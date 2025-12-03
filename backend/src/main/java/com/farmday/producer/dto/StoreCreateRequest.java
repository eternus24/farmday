// backend/src/main/java/com/farmday/producer/dto/StoreCreateRequest.java
package com.farmday.producer.dto;

import lombok.Data;

@Data
public class StoreCreateRequest {

    private String storeName;
    private String description;
    private String status;
    private String isActive;
    private String ownerUserId;
    private Long producerId;

    private Long userNo;      // 🔹 추가: 생산자 찾기용
    private String thumbnailUrl;
}