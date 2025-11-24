package com.farmday.product.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ProductImageDTO {
    
    private Long imageId;//이미지 번호
    private Long productId;//상품 번호
    private String imageUrl;//이미지 경로
    private Boolean isMain;//대표 이미지 여부 (true/false)
    private Long sortOrder;//이미지 정렬 순서
    private LocalDateTime createdDate;//등록일
}
