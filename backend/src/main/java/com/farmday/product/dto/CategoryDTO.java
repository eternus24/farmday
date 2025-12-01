package com.farmday.product.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CategoryDTO {
    
    //category
    private Long categoryId;//카테고리 번호
    private Long parentCategoryId;//상위 카테고리
    private String categoryName;//카테고리명
    private Long categoryLevel;//대분류, 중분류, 소분류
    private Long displayOrder;//정렬 순서
    private String isActive;//사용 여부
    private LocalDateTime createdDate;//생성일
    private LocalDateTime updatedDate;//수정일
}