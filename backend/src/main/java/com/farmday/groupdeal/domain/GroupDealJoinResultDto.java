// src/main/java/com/farmday/groupdeal/domain/GroupDealJoinResultDto.java
package com.farmday.groupdeal.domain;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GroupDealJoinResultDto {

    private Long groupDealId;
    private Long teamId;

    private Long productId;
    private Long detailId;

    private Integer quantity;
    private BigDecimal dealPrice;

    private String message;   // "새 팀이 생성되었습니다", "팀에 합류했습니다" 등 안내 문구
}
