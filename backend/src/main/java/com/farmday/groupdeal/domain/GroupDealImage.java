package com.farmday.groupdeal.domain;

import lombok.Data;

@Data
public class GroupDealImage {
    private Long id;
    private Long dealId;
    private String imageUrl;
    private int order;

    // getter / setter / 기본 생성자
}
