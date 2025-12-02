// src/main/java/com/farmday/banner/dto/BannerUpdateRequest.java
package com.farmday.banner.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BannerUpdateRequest {
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String isActive;   // 'Y' or 'N'
    private LocalDate startDate;
    private LocalDate endDate;
}