// src/main/java/com/farmday/banner/domain/Banner.java
package com.farmday.banner.domain;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Banner {
    private Long bannerId;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String isActive;      // 'Y' or 'N'
    private LocalDate startDate;
    private LocalDate endDate;
    private String createdBy;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}