// src/main/java/com/farmday/banner/dto/BannerSaveRequest.java
package com.farmday.admin.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BannerSaveRequest {
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String isActive;   // 'Y' or 'N'
    private LocalDate startDate;
    private LocalDate endDate;
}