package com.farmday.mypage;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.farmday.orders.DeliveryDTO;
import com.farmday.review.dto.ReviewDTO;


@Service
public class MypageService {

    @Autowired
    MypageMapper mypageMapper;
    
    public String findProductMainImage(int product_id) throws Exception {
        return mypageMapper.findProductMainImage(product_id);
    }

    public int isWishlistExist(String user_id, int product_id) throws Exception {
        return mypageMapper.isWishlistExist(user_id,product_id);
    }

    public List<OrdersCanceledDTO> findCanceledOrderByUserId(String user_id) throws Exception {
        return mypageMapper.findCanceledOrderByUserId(user_id);
    }



    public int insertWishlist(WishlistDTO dto) throws Exception {
        return mypageMapper.insertWishlist(dto);
    }

    public int deleteWishlist(String user_id, int product_id) throws Exception {
        return mypageMapper.deleteWishlist(user_id,product_id);
    }

    public List<MyReviewDTO> findReviewByUserId(String user_id) throws Exception {
        return mypageMapper.findReviewByUserId(user_id);
    }

    public DeliveryDTO findDeliveryInfo(int order_item_id) throws Exception {
        return mypageMapper.findDeliveryInfo(order_item_id);
    }

    public int awstestInsert(int product_id, String image_url) throws Exception {
        return mypageMapper.awstestInsert(product_id, image_url);
    }

    public String awstestSelect(int product_id) throws Exception {
        return mypageMapper.awstestSelect(product_id);
    }

}