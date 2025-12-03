package com.farmday.producer.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StoreResponse {

    private Long storeId;
    private String storeName;
    private String description;
    private String thumbnailUrl;
    private String status;
    private String isActive;
}