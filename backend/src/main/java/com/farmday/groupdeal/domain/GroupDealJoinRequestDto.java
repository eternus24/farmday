// backend/src/main/java/com/farmday/groupdeal/domain/GroupDealJoinRequestDto.java
package com.farmday.groupdeal.domain;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupDealJoinRequestDto {

    // JWT에서 세팅해줄 userId
    private String userId;

    // 프론트에서 보내주는 quantity
    private Integer quantity;
}
