
package com.farmday.review.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReviewDTO {
    
    private Long reviewId; //리뷰id
    private Long productId; //상품 id
    private Long storeId; //가게 id
    private Long orderItemId;
    private String writerUserId; //작성자 id
    private int rating; //별점
    private String title; //리뷰 제목
    private String content; //리뷰 내용
    private String imageUrl; //리뷰 이미지
    private int likeCount;//좋아요 수
    private boolean isVisible;//노출 여부
    private LocalDateTime createdDate;//작성일
    private LocalDateTime updatedDate;//수정일

    private String reply; //판매자 답글 - 추가
    private String productTags;//상품 태그 - 추가

}
