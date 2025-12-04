package com.farmday.mypage;

import lombok.Data;

@Data
public class MyReviewDTO {

    private int review_id; //리뷰id
    private int product_id; //상품 id
    private int store_id; //가게 id
    private int order_item_id;
    private String writer_user_id; //작성자 id
    private int rating; //별점
    private String title; //리뷰 제목
    private String content; //리뷰 내용
    private String image_url; //리뷰 이미지
    private int like_count;//좋아요 수
    private boolean is_visible;//노출 여부
    private String created_date;//작성일
    private String updated_date;//수정일

    private String reply; //판매자 답글 - 추가
    private String product_tags;//상품 태그 - 추가



    private String toss_orderid;
    private int price_at_order;
    private int quantity;
    private String name;
    private String main_image;
    private String grade;
    private String unit_name;
    private String origin_region;
    private String detail_desc; 



}
