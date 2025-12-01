package com.farmday.orders;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrdersMapper {

	UsersDTO findUserInfoForOrder(String user_id) throws Exception;

    int findUserPoints(String user_id) throws Exception;

	OrdersDTO findOrdersByTossOrderId(String toss_orderid) throws Exception;

	OrdersItemDTO findOrdersItemById(int order_item_id) throws Exception;


	int insertOrders(OrdersDTO dto) throws Exception;

	int insertOrdersItem(OrdersItemDTO dto) throws Exception;

	int insertOrdersItemIntoDelivery(DeliveryDTO dto) throws Exception;

	List<OrdersDTO> findAllOrdersByUserId(String user_id) throws Exception;
	
	List<OrdersItemDTO> findOrdersItemByOrderId(int order_id) throws Exception;



	int insertOrdersItemIntoCancel(OrdersCanceledDTO dto) throws Exception;

	int changeOrdersItemStatus(
		@Param("order_item_id")int order_item_id,
		@Param("order_status")String order_status
	) throws Exception;

	int changeDeliveryStatus(
		@Param("order_item_id")int order_item_id,
		@Param("delivery_status")String delivery_status
	) throws Exception;



}