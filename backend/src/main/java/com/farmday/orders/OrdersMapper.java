package com.farmday.orders;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OrdersMapper {

	UsersDTO findUserInfoForOrder(String user_id) throws Exception;

	OrdersDTO findOrdersByTossOrderId(String toss_orderid) throws Exception;

	int insertOrders(OrdersDTO dto) throws Exception;

	int insertOrdersItem(OrdersItemDTO dto) throws Exception;

	List<OrdersDTO> findAllOrdersByUserId(String user_id) throws Exception;
	
	List<OrdersItemDTO> findOrdersItemByOrderId(int order_id) throws Exception;








}