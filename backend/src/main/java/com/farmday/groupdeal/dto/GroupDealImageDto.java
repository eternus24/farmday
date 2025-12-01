// 경로: backend/src/main/java/com/farmday/groupdeal/dto/GroupDealImageDto.java
package com.farmday.groupdeal.dto;

import lombok.Data;

// GROUP_DEAL_IMAGE 매핑용 DTO
@Data
public class GroupDealImageDto {

    private Long imageId;
    private Long groupDealId;
    private String imageUrl;
    private Integer sortOrder;
}
