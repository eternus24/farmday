package com.farmday.product.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.farmday.review.dto.ReviewDTO;

import java.time.LocalDate;
import lombok.Data;

@Data
public class ProductDTO {//상품 & 상품 정보
    
    //product
    private Long productId; //상품 ID
    private Long producerId; //생산자 ID
    private String name; //상품명
    private Long baseCategoryId; //카테고리 ID
    private String mainImage; //대표 이미지 url
    private String summary; //상품 설명
    private String status; //상태 (on,off,deleted)
    private LocalDateTime createdDate; //생성일
    private LocalDateTime updatedDate; //수정일

    //detail
    private Long detailId;//상세 상품 번호
    private String grade;//등급
    private String unitName;//규격
    private Long price;//가격
    private Long stockQty;//재고
    private String originRegion;//산지
    private LocalDate harvestDate;//수확일
    private LocalDate expireDate;//유통기한
    private String detailDesc;//상세설명
    private LocalDateTime detailCreatedDate;//등록일
    private LocalDateTime detailUpdatedDate;//수정일

    private List<ReviewDTO> reviews; //상품 리뷰 목록
}
