// backend/src/main/java/com/farmday/testtable/TestTableController.java
package com.farmday.orders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.cart.CartDTO;
import com.farmday.cart.CartService;
import com.farmday.coupon.service.MembershipCouponServiceImpl;
import com.farmday.groupdeal.dto.GroupDealDetailResponseDto;
import com.farmday.groupdeal.dto.GroupDealImageDto;
import com.farmday.groupdeal.service.GroupDealService;
import com.farmday.mypage.MembershipGradeDTO;
import com.farmday.mypage.MypageService;
import com.farmday.mypage.OrdersCanceledDTO;

import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class OrdersController {

    @Autowired
    OrdersService ordersService;

    @Autowired
    CartService cartService;

    @Autowired
    MypageService mypageService;

    @Autowired
    GroupDealService groupDealService;

    @Autowired
    com.farmday.groupdeal.mapper.GroupDealMapper groupDealMapper;

    @Autowired
    MembershipCouponServiceImpl membershipCouponServiceImpl;

    // public OrdersController(OrdersService ordersService, CartService cartService, MypageService mypageService) { 
    //     this.ordersService = ordersService; 
    //     this.cartService = cartService;
    //     this.mypageService = mypageService;
    // }

    @GetMapping("/orders/findUserInfoForOrder")
    public UsersDTO findUserInfoForOrder(@RequestParam("user_id")String user_id) throws Exception {
        return ordersService.findUserInfoForOrder(user_id);
    }

    @GetMapping("/orders/findUserPoints")
    public int findUserPoints(@RequestParam("user_id") String user_id) throws Exception {
        return ordersService.findUserPoints(user_id);
    }


    // 구매 시 처리
    @Transactional(rollbackFor = Exception.class)
    @PostMapping(value = "/orders/insertOrders/{user_id}", consumes = "application/json")
    public ResponseEntity<Void> insertCart(
            @PathVariable("user_id") String user_id,
            @RequestBody OrdersDTO item
    ) throws Exception {
        if (user_id == null || user_id.isEmpty() || item == null) {
            return ResponseEntity.badRequest().build();
        }
        int user_no = ordersService.findUserInfoForOrder(user_id).getUser_no().intValue();

        int used_points = item.getUsed_points();
        int current_points = ordersService.findUserPoints(user_id);

        int updated_points = current_points - used_points;
        ordersService.updateUserPoints(user_id, updated_points);
        


        item.setOrder_status("A");
        item.setProduct_total_amount(item.getSubtotal());

        String toss_orderid = item.getToss_orderid();




        if (item.getOrder_type().length()>=9 && item.getOrder_type().substring(0, 9).equals("groupdeal")) {
            String[] splitInfo = item.getOrder_type().split("_");
            long groupDealId = Long.parseLong(splitInfo[1]);
            item.setOrder_type("groupdeal")
            ;
            ordersService.insertOrders(item);

            // 토스페이먼츠 결제로 생성된 고유 주문번호를 통해 방금 생성된 order의 PK값 찾아오기
            int order_id = ordersService.findOrdersByTossOrderId(toss_orderid).getOrder_id();

            GroupDealDetailResponseDto groupDealDTO = groupDealService.getGroupDealDetail(groupDealId);

            OrdersItemDTO ordersItem = new OrdersItemDTO();
            ordersItem.setOrder_id(order_id);
            ordersItem.setProduct_id(0);
            ordersItem.setProduct_name(groupDealDTO.getTitle());
            ordersItem.setGroup_deal_id(groupDealDTO.getGroupDealId().intValue());
            ordersItem.setPrice_at_order(groupDealDTO.getDealPrice().intValue());
            ordersItem.setQuantity(Integer.parseInt(splitInfo[2]));
            ordersItem.setLine_total_amount(groupDealDTO.getDealPrice().intValue()*Integer.parseInt(splitInfo[2]));

            ordersService.insertOrdersItem(ordersItem);

            groupDealService.joinGroupDeal(user_id, groupDealId, Integer.parseInt(splitInfo[2]));


            int order_item_id = ordersService.findOrderItemIdOfGroupDealOrder(order_id);

            DeliveryDTO delivery = new DeliveryDTO();
            delivery.setOrder_item_id(order_item_id);
            delivery.setDelivery_status("배송준비");

            ordersService.insertOrdersItemIntoDelivery(delivery);

            membershipCouponServiceImpl.deleteUsedCoupon(user_no, item.getCouponId());


            System.out.println("그룹딜 주문 처리 완료");

            return ResponseEntity.noContent().build();
        }

        ordersService.insertOrders(item);


        // 토스페이먼츠 결제로 생성된 고유 주문번호를 통해 방금 생성된 order의 PK값 찾아오기
        int order_id = ordersService.findOrdersByTossOrderId(toss_orderid).getOrder_id();

        List<CartDTO> cartList = cartService.findCartByUserId(user_id);

        // 현재 cart의 품목들을 ordersItem으로 옮겨담고 cart는 비우기
        for (CartDTO cart : cartList) {
            OrdersItemDTO ordersItem = new OrdersItemDTO();
            ordersItem.setOrder_id(order_id);
            ordersItem.setProduct_id(cart.getProduct_id());
            ordersItem.setProduct_name(cart.getProduct_name());
            ordersItem.setGroup_deal_id(0);
            ordersItem.setPrice_at_order(cart.getPrice());
            ordersItem.setQuantity(cart.getQuantity());
            ordersItem.setLine_total_amount(cart.getPrice()*cart.getQuantity());

            // 트랜잭션을 통한 Database 무결성 보장
            boolean ok = ordersService.updateProductAmount(cart.getProduct_id(), -cart.getQuantity());

            if (!ok) {
                throw new IllegalStateException("재고 부족으로 주문을 진행할 수 없습니다.");
            }

            ordersService.insertOrdersItem(ordersItem);
            cartService.deleteCart(cart.getCart_id());

        }

        List<OrdersItemDTO> ordersItemList = ordersService.findOrdersItemByOrderId(order_id);

        for (OrdersItemDTO ordersItem : ordersItemList) {
            DeliveryDTO delivery = new DeliveryDTO();
            delivery.setOrder_item_id(ordersItem.getOrder_item_id());
            delivery.setDelivery_status("배송준비");

            ordersService.insertOrdersItemIntoDelivery(delivery);
        }
        
        int deleted = membershipCouponServiceImpl.deleteUsedCoupon(user_no, item.getCouponId());

        System.out.println("deleted : "+deleted+", user_no : "+user_no+", coupon_id : "+item.getCouponId());

        // return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.noContent().build();
    }



    

    @GetMapping("/orders/findAllOrdersByUserId")
    public List<OrdersDTO> findAllOrdersByUserId(@RequestParam("user_id")String user_id) throws Exception {

        List<OrdersDTO> userOrders = ordersService.findAllOrdersByUserId(user_id);

        for (OrdersDTO dto : userOrders) {

            List<OrdersItemDTO> ordersItem = ordersService.findOrdersItemByOrderId(dto.getOrder_id());
            if (ordersItem == null || ordersItem.isEmpty()) {
                continue;
            }
            int order_amount = ordersItem.size();
            dto.setOrder_amount(order_amount);

            List<OrdersImgListDTO> imgList = ordersService.findOrdersImgListByOrderId(dto.getOrder_id());
            
            dto.setOrders_img_list(imgList);

            int product_id = ordersItem.get(0).getProduct_id();
            String thumbnail_name = ordersItem.get(0).getProduct_name();
            String thumbnail_img = mypageService.findProductMainImage(product_id);


            dto.setThumbnail_name(thumbnail_name);
            dto.setThumbnail_img(thumbnail_img);
            dto.setThumbnail_id(product_id);
        }

        return userOrders;
    }


    @GetMapping("/orders/findAllGroupDealOrdersByUserId")
    public List<OrdersDTO> findAllGroupDealOrdersByUserId(@RequestParam("user_id")String user_id) throws Exception {

        List<OrdersDTO> userOrders = ordersService.findAllGroupDealOrdersByUserId(user_id);

        for (OrdersDTO dto : userOrders) {

            OrdersItemDTO ordersItem = ordersService.findGroupDealItemByOrderId(dto.getOrder_id());
            if (ordersItem == null) {
                continue;
            }

            List<GroupDealImageDto> imageList = groupDealMapper.selectGroupDealImages((long)ordersItem.getGroup_deal_id());

            List<OrdersImgListDTO> ordersImgList = new ArrayList<>();

            for (GroupDealImageDto imgDto : imageList) {
                OrdersImgListDTO ordersImg = new OrdersImgListDTO();
                ordersImg.setProduct_id(ordersItem.getGroup_deal_id());
                ordersImg.setMain_image(imgDto.getImageUrl());
                ordersImgList.add(ordersImg);
            }

            dto.setOrders_img_list(ordersImgList);


        }

        return userOrders;
    }



    @GetMapping("/orders/findOrdersItemByOrderId")
    public List<OrdersItemDTO> findOrdersItemByOrderId(@RequestParam("order_id")int order_id) throws Exception {
        return ordersService.findOrdersItemByOrderId(order_id);
    }

    @GetMapping("/orders/findGroupDealItemByOrderId")
    public OrdersItemDTO findGroupDealItemByOrderId(@RequestParam("order_id")int order_id) throws Exception {
        return ordersService.findGroupDealItemByOrderId(order_id);
    }



    @GetMapping("/orders/findOrdersItemById")
    public OrdersItemDTO findOrdersItemById(@RequestParam("order_item_id")int order_item_id) throws Exception {
        return ordersService.findOrdersItemById(order_item_id);
    }
    

    // 배송이 아직 시작되지 않았을 때 주문 취소하기 (별도의 심사 없이 바로 취소 가능)
    @PostMapping("/orders/cancelOrderBeforeDelivery/{user_id}")
    public ResponseEntity<String> cancelOrderBeforeDelivery(
        @PathVariable("user_id") String user_id,
        @RequestParam("order_item_id")int order_item_id, 
        @RequestParam("cancel_reason")String cancel_reason) throws Exception {

        OrdersItemDTO ordersItem = ordersService.findOrdersItemById(order_item_id);

        String status = ordersItem.getOrder_status();

        if (!status.equals("A1")) {
            return ResponseEntity.badRequest().body("not_appropriate_status");
        }

        OrdersDTO order = ordersService.findOrdersByOrderId(ordersItem.getOrder_id());


        int product_total_amount = order.getProduct_total_amount();
        int order_total_amount = order.getOrder_total_amount();
        int item_total_amount = ordersItem.getLine_total_amount();

        int refund_amount = order_total_amount * item_total_amount / product_total_amount;

        // 환불 시 남은 구매금액이 4만원 이하가 된다면 면제받은 배송비를 다시 부과
        int canceled_total_amount = ordersService.findTotalCanceledAmountByOrderId(order.getOrder_id());

        int remaining_total_amount = product_total_amount - canceled_total_amount;
        boolean isShippingFeeCharged = false;
        boolean isShippingFeeRefunded = false;

        if (order.getShipping_fee()==0 && (remaining_total_amount - item_total_amount)<40000) {
            if (remaining_total_amount - item_total_amount>0) {
                isShippingFeeCharged = true;
                ordersService.chargeShippingFeeAfterCancel(order.getOrder_id(), 3000);
            }
        } else if (order.getShipping_fee()>0 && (remaining_total_amount<=item_total_amount)) {
            isShippingFeeRefunded = true;
            ordersService.chargeShippingFeeAfterCancel(order.getOrder_id(), -3000);
        }



        int refund_points = order.getUsed_points() * item_total_amount / product_total_amount;

        int current_points = ordersService.findUserPoints(user_id);
        int updated_points = current_points + refund_points;
        ordersService.updateUserPoints(user_id, updated_points);

        System.out.println("환불로 인해 "+refund_points+"점을 반환받아 "+updated_points+"점이 되었습니다.");
        

        






        OrdersCanceledDTO cancel = new OrdersCanceledDTO();
        cancel.setOrder_item_id(order_item_id);
        cancel.setProduct_id(ordersItem.getProduct_id());
        cancel.setUser_id(user_id);
        cancel.setCancel_reason(cancel_reason);
        cancel.setRefund_amount(refund_amount);

        ordersService.insertOrdersItemIntoCancel(cancel);

        ordersService.updateProductAmount(ordersItem.getProduct_id(),ordersItem.getQuantity());

        // 취소 및 환불 완료 코드인 R1으로 변경
        ordersService.changeOrdersItemStatus(order_item_id, "R1");

        ordersService.changeDeliveryStatus(order_item_id,"배송취소");

        if (isShippingFeeCharged) {
            return ResponseEntity.ok("shipping_fee_charged");
        } else if (isShippingFeeRefunded) {
            return ResponseEntity.ok("shipping_fee_refunded");
        }
        return ResponseEntity.ok("");
    }
    

    // 배송이 완료되어 고객이 물품 수령 후 이상이 없음을 확인하고 구매를 확정할 때
    @PostMapping("/orders/confirmOrder/{user_id}")
    public ResponseEntity<String> confirmOrder(
        @PathVariable("user_id") String user_id,
        @RequestParam("order_item_id")int order_item_id) throws Exception {
        
        System.out.println("디버깅 확인: 주문 확정 컨트롤러 진입");

        OrdersItemDTO ordersItem = ordersService.findOrdersItemById(order_item_id);

        String status = ordersItem.getOrder_status();

        if (!status.equals("A2")) {
            return ResponseEntity.badRequest().body("not_appropriate_status");
        }

        MembershipGradeDTO membershipGrade = ordersService.findMembershipGradeInfo(ordersService.findUserMembershipInfo(user_id));

        double point_rate = membershipGrade.getPoint_rate();
        
        int earned_points = (int)(ordersItem.getLine_total_amount() * point_rate * 0.01);
        int current_points = ordersService.findUserPoints(user_id);
        int updated_points = current_points + earned_points;

        ordersService.updateUserPoints(user_id, updated_points);

        System.out.println("적립금 "+earned_points+"점을 얻어 총 "+updated_points+"점이 되었습니다.");

        ordersService.changeOrdersItemStatus(order_item_id, "E1");

        return ResponseEntity.ok("");
    }
    

    @PostMapping("/orders/confirmGroupDealOrder/{user_id}")
    public ResponseEntity<String> confirmGroupDealOrder(
        @PathVariable("user_id") String user_id,
        @RequestParam("group_deal_id")int group_deal_id) throws Exception {
        
        System.out.println("디버깅 확인: 주문 확정 컨트롤러 진입");

        OrdersItemDTO ordersItem = ordersService.findGroupDealOrdersItemById(group_deal_id);

        String status = ordersItem.getOrder_status();

        if (!status.equals("A2")) {
            return ResponseEntity.badRequest().body("not_appropriate_status");
        }

        MembershipGradeDTO membershipGrade = ordersService.findMembershipGradeInfo(ordersService.findUserMembershipInfo(user_id));

        double point_rate = membershipGrade.getPoint_rate();
        
        int earned_points = (int)(ordersItem.getLine_total_amount() * point_rate * 0.01);
        int current_points = ordersService.findUserPoints(user_id);
        int updated_points = current_points + earned_points;

        ordersService.updateUserPoints(user_id, updated_points);

        System.out.println("적립금 "+earned_points+"점을 얻어 총 "+updated_points+"점이 되었습니다.");

        ordersService.changeGroupDealOrdersItemStatus(group_deal_id, "E1");

        return ResponseEntity.ok("");
    }


    // 배송이 완료되고 고객이 물품을 환불하려고 할 때
    @PostMapping("/orders/refundRequest/{user_id}")
    public ResponseEntity<String> refundRequest(
        @PathVariable("user_id") String user_id,
        @RequestParam("order_item_id")int order_item_id) throws Exception {

        OrdersItemDTO ordersItem = ordersService.findOrdersItemById(order_item_id);

        String status = ordersItem.getOrder_status();

        if (!status.equals("A2")) {
            return ResponseEntity.badRequest().body("not_appropriate_status");
        }
        
        // 취소 및 환불신청 후 대기중 코드인 B1으로 변경
        ordersService.changeOrdersItemStatus(order_item_id, "B1");

        ordersService.changeDeliveryStatus(order_item_id,"환불요청");

        return ResponseEntity.ok("");
    }

}