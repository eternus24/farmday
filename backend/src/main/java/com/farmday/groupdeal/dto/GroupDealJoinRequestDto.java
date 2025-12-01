// 경로: backend/src/main/java/com/farmday/groupdeal/dto/GroupDealJoinRequestDto.java
package com.farmday.groupdeal.dto;

import lombok.Data;

// 소비자가 공동구매 참여 버튼 눌렀을 때 사용하는 요청 DTO
@Data
public class GroupDealJoinRequestDto {

    private Integer quantity; // 신청 수량
}
