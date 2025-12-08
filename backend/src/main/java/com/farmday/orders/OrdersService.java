// backend/src/main/java/com/farmday/test/TestTableService.java
package com.farmday.orders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.farmday.mypage.MembershipGradeDTO;
import com.farmday.mypage.OrdersCanceledDTO;

import java.util.List;

@Service
public class OrdersService {

    @Autowired
    OrdersMapper ordersMapper;

    public UsersDTO findUserInfoForOrder(String user_id) throws Exception {
        return ordersMapper.findUserInfoForOrder(user_id);
    }

    public int findUserPoints(String user_id) throws Exception {
        return ordersMapper.findUserPoints(user_id);
    }

    public String findUserMembershipInfo(String user_id) throws Exception {
        return ordersMapper.findUserMembershipInfo(user_id);
    }

    public MembershipGradeDTO findMembershipGradeInfo(String grade_code) throws Exception {
        return ordersMapper.findMembershipGradeInfo(grade_code);
    }

    public OrdersDTO findOrdersByOrderId(int order_id) throws Exception {
        return ordersMapper.findOrdersByOrderId(order_id);
    }

    public OrdersDTO findOrdersByTossOrderId(String toss_orderid) throws Exception {
        return ordersMapper.findOrdersByTossOrderId(toss_orderid);
    }

    public OrdersItemDTO findOrdersItemById(int order_item_id) throws Exception {
        return ordersMapper.findOrdersItemById(order_item_id);
    }



    public int insertOrders(OrdersDTO dto) throws Exception {
        return ordersMapper.insertOrders(dto);
    }

    public int insertOrdersItem(OrdersItemDTO dto) throws Exception {
        return ordersMapper.insertOrdersItem(dto);
    }

    public int insertOrdersItemIntoDelivery(DeliveryDTO dto) throws Exception {
        return ordersMapper.insertOrdersItemIntoDelivery(dto);
    }

    public int updateUserPoints(String user_id, int points) throws Exception {
        return ordersMapper.updateUserPoints(user_id, points);
    }
    

    public List<OrdersDTO> findAllOrdersByUserId(String user_id) throws Exception {
        return ordersMapper.findAllOrdersByUserId(user_id);
    }

    public List<OrdersItemDTO> findOrdersItemByOrderId(int order_id) throws Exception {
        return ordersMapper.findOrdersItemByOrderId(order_id);
    }


    public int insertOrdersItemIntoCancel(OrdersCanceledDTO dto) throws Exception {
        return ordersMapper.insertOrdersItemIntoCancel(dto);
    }

    public int changeOrdersItemStatus(int order_item_id,String order_status) throws Exception {
        return ordersMapper.changeOrdersItemStatus(order_item_id,order_status);
    }

    public int changeDeliveryStatus(int order_item_id,String delivery_status) throws Exception {
        return ordersMapper.changeDeliveryStatus(order_item_id,delivery_status);
    }


    public int findTotalCanceledAmountByOrderId(int order_id) throws Exception {
        return ordersMapper.findTotalCanceledAmountByOrderId(order_id);
    }

    public int chargeShippingFeeAfterCancel(int order_id, int shipping_fee) throws Exception {
        return ordersMapper.chargeShippingFeeAfterCancel(order_id, shipping_fee);
    }

    //민아 - 리뷰 작성 시 적립금 증가
    public Long findUserNoByOrderItemId(int order_item_id) throws Exception {
        return ordersMapper.findUserNoByOrderItemId(order_item_id);
    }

}