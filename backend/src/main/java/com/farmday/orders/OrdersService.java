// backend/src/main/java/com/farmday/test/TestTableService.java
package com.farmday.orders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


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


}
