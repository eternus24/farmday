package com.farmday.product.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProductReviewDTO {
    
    private Long reviewId;//리뷰ID
    private Long productId;//상품 ID
    private Long storeId;//스토어 ID
    private Long orderItemId;//주문 상세 ID
    private String writerUserId;//작성자 ID
    private double rating;//평점
    private String title;//리뷰 제목
    private String content;//리뷰 내용
    private String imageUrl;//리뷰 이미지
    private Long likeCount;//좋아요 수
    private boolean isVisible;//노출 여부
    private LocalDateTime createdDate;//작성일
    private LocalDateTime updatedDate;//수정일
    
}
