package com.farmday.mypage;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.farmday.orders.DeliveryDTO;
import com.farmday.review.dto.ReviewDTO;


@Mapper
public interface MypageMapper {
    
    public String findProductMainImage(int product_id) throws Exception;

    public int isWishlistExist(
		@Param("user_id")String user_id,
		@Param("product_id")int product_id
	) throws Exception;

		public List<OrdersCanceledDTO> findCanceledOrderByUserId(String user_id) throws Exception;

    public int insertWishlist(WishlistDTO dto) throws Exception;

    public int deleteWishlist(
			@Param("user_id")String user_id,
			@Param("product_id")int product_id
		) throws Exception;

		public List<MyReviewDTO> findReviewByUserId(String user_id) throws Exception;

		public DeliveryDTO findDeliveryInfo(int order_item_id) throws Exception;

}
