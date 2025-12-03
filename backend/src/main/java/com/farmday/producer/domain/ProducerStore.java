package com.farmday.producer.domain;

import lombok.Data;

import java.util.Date;

@Data
public class ProducerStore {

    private Long storeId;
    private Long producerId;
    private String ownerUserId;

    private String storeName;
    private String description;
    private String thumbnailUrl;

    private String status;      // READY / OPEN / CLOSED
    private String isActive;    // Y / N

    private Date createdDate;
    private Date updatedDate;
}