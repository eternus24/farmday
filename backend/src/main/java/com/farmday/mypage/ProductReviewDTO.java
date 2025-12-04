package com.farmday.mypage;

import lombok.Data;

@Data
public class ProductReviewDTO {
    
    private int review_id;
    private int product_id;
    private int store_id;
    private int order_item_id;
    private String writer_user_id;
    private int rating;
    private String title;
    private String content;
    private String image_url;
    private int like_count;
    private String is_visible;
    private String created_date;
    private String updated_date;
    private String reply;
    private String product_tags;


}
