// backend/src/main/java/com/farmday/testtable/TestTableController.java
package com.farmday.orders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.cart.CartDTO;
import com.farmday.cart.CartService;
import com.farmday.mypage.MypageService;

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
    @PostMapping(value = "/orders/insertOrders/{user_id}", consumes = "application/json")
    public ResponseEntity<Void> insertCart(
            @PathVariable("user_id") String user_id,
            @RequestBody OrdersDTO item
    ) throws Exception {
        if (user_id == null || user_id.isEmpty() || item == null) {
            return ResponseEntity.badRequest().build();
        }
        item.setOrder_status("A");
        item.setProduct_total_amount(item.getSubtotal());

        String toss_orderid = item.getToss_orderid();
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
            ordersItem.setDiscount_amount(0);
            ordersItem.setPrice_at_order(cart.getPrice());
            ordersItem.setQuantity(cart.getQuantity());
            ordersItem.setLine_total_amount(cart.getPrice()*cart.getQuantity());

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
            int product_id = ordersItem.get(0).getProduct_id();
            String thumbnail_name = ordersItem.get(0).getProduct_name();
            String thumbnail_img = mypageService.findProductMainImage(product_id);


            dto.setOrder_amount(order_amount);
            dto.setThumbnail_name(thumbnail_name);
            dto.setThumbnail_img(thumbnail_img);
            dto.setThumbnail_id(product_id);
        }

        return userOrders;
    }

    @GetMapping("/orders/findOrdersItemByOrderId")
    public List<OrdersItemDTO> findOrdersItemByOrderId(@RequestParam("order_id")int order_id) throws Exception {
        return ordersService.findOrdersItemByOrderId(order_id);
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


        int refund_amount = 0;

        OrdersCanceledDTO cancel = new OrdersCanceledDTO();
        cancel.setOrder_item_id(order_item_id);
        cancel.setProduct_id(ordersItem.getProduct_id());
        cancel.setUser_id(user_id);
        cancel.setCancel_reason(cancel_reason);
        cancel.setRefund_amount(refund_amount);

        ordersService.insertOrdersItemIntoCancel(cancel);

        // 취소 및 환불 완료 코드인 R1으로 변경
        ordersService.changeOrdersItemStatus(order_item_id, "R1");

        ordersService.changeDeliveryStatus(order_item_id,"배송취소");


        return ResponseEntity.ok("");
    }
    

    // 배송이 완료되어 고객이 물품 수령 후 이상이 없음을 확인하고 구매를 확정할 때
    @PostMapping("/orders/confirmOrder/{user_id}")
    public ResponseEntity<String> confirmOrder(
        @PathVariable("user_id") String user_id,
        @RequestParam("order_item_id")int order_item_id) throws Exception {
        
        OrdersItemDTO ordersItem = ordersService.findOrdersItemById(order_item_id);

        String status = ordersItem.getOrder_status();

        if (!status.equals("A2")) {
            return ResponseEntity.badRequest().body("not_appropriate_status");
        }

        ordersService.changeOrdersItemStatus(order_item_id, "E1");

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
