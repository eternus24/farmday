// com.farmday.producer.dto.ProducerProductSaveRequest.java
package com.farmday.producer.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProducerProductSaveRequest {

    // PRODUCT
    private String productName;     // PRODUCT.name
    private Long baseCategoryId;    // PRODUCT.base_category_id
    private String status;          // 판매 상태 (신규 등록 시 기본값 ON 으로 줄 거라 null 가능)

    // PRODUCT_DETAIL
    private String grade;           // 등급 (특/상/중/하)
    private String unitName;        // 규격(단위)
    private Integer price;          // 가격
    private Integer stockQty;       // 재고

    private String origin;       // 원산지
    private String harvestDate;  // 수확일
    private String expireDate;   // 유통기한

    private String summary;     // PRODUCT.summary (짧은 소개)
    private String detailDesc;  // PRODUCT_DETAIL.detail_desc (상세 설명)

     // ⭐ URL 기반 이미지 관리
    private String mainImageUrl;               // 대표 이미지 URL
    private List<String> descriptionImageUrls; // 상세 이미지 URL들 (0~N장)
}