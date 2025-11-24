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

    public OrdersDTO findOrdersByTossOrderId(String toss_orderid) throws Exception {
        return ordersMapper.findOrdersByTossOrderId(toss_orderid);
    }

    public int insertOrders(OrdersDTO dto) throws Exception {
        return ordersMapper.insertOrders(dto);
    }

    public int insertOrdersItem(OrdersItemDTO dto) throws Exception {
        return ordersMapper.insertOrdersItem(dto);
    }

    public List<OrdersDTO> findAllOrdersByUserId(String user_id) throws Exception {
        return ordersMapper.findAllOrdersByUserId(user_id);
    }

    public List<OrdersItemDTO> findOrdersItemByOrderId(int order_id) throws Exception {
        return ordersMapper.findOrdersItemByOrderId(order_id);
    }

}
