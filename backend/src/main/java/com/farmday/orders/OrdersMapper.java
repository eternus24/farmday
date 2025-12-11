package com.farmday.orders;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.farmday.mypage.MembershipGradeDTO;
import com.farmday.mypage.OrdersCanceledDTO;

@Mapper
public interface OrdersMapper {

	UsersDTO findUserInfoForOrder(String user_id) throws Exception;

  int findUserPoints(String user_id) throws Exception;

	String findUserMembershipInfo(String user_id) throws Exception;

	MembershipGradeDTO findMembershipGradeInfo(String grade_code) throws Exception;

	OrdersDTO findOrdersByOrderId(int order_id) throws Exception;

	OrdersDTO findOrdersByTossOrderId(String toss_orderid) throws Exception;

	OrdersItemDTO findOrdersItemById(int order_item_id) throws Exception;


	int insertOrders(OrdersDTO dto) throws Exception;

	int insertOrdersItem(OrdersItemDTO dto) throws Exception;

	int insertOrdersItemIntoDelivery(DeliveryDTO dto) throws Exception;

	int updateUserPoints(
		@Param("user_id")String user_id,
		@Param("points")int points
	) throws Exception;

	int findProductStockQty(int product_id) throws Exception;

	int updateProductAmount(
		@Param("product_id")int product_id,
		@Param("stock_qty")int stock_qty
	) throws Exception;	




	List<OrdersDTO> findAllOrdersByUserId(String user_id) throws Exception;
	
	List<OrdersDTO> findAllGroupDealOrdersByUserId(String user_id) throws Exception;

	List<OrdersItemDTO> findOrdersItemByOrderId(int order_id) throws Exception;

	int findOrderItemIdOfGroupDealOrder(int order_id) throws Exception;

	OrdersItemDTO findGroupDealItemByOrderId(int order_id) throws Exception;

	

	int insertOrdersItemIntoCancel(OrdersCanceledDTO dto) throws Exception;

	int changeOrdersItemStatus(
		@Param("order_item_id")int order_item_id,
		@Param("order_status")String order_status
	) throws Exception;

	int changeDeliveryStatus(
		@Param("order_item_id")int order_item_id,
		@Param("delivery_status")String delivery_status
	) throws Exception;

	int findTotalCanceledAmountByOrderId(int order_id) throws Exception;

	int chargeShippingFeeAfterCancel(
		@Param("order_id")int order_id,
		@Param("shipping_fee")int shipping_fee
	) throws Exception;

	List<OrdersImgListDTO> findOrdersImgListByOrderId(int order_id) throws Exception;

	//민아 - 리뷰 작성 적립금
	Long findUserNoByOrderItemId(int order_item_id);
	



	OrdersItemDTO findGroupDealOrdersItemById(int group_deal_id) throws Exception;

	int changeGroupDealOrdersItemStatus(
		@Param("group_deal_id")int group_deal_id,
		@Param("order_status")String order_status
	) throws Exception;

}