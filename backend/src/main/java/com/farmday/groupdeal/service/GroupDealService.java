// 경로: backend/src/main/java/com/farmday/groupdeal/service/GroupDealService.java
package com.farmday.groupdeal.service;

import com.farmday.groupdeal.dto.GroupDealCreateRequestDto;
import com.farmday.groupdeal.dto.GroupDealDetailResponseDto;
import com.farmday.groupdeal.dto.GroupDealListResponseDto;

import java.util.List;

public interface GroupDealService {

    // 공동구매 목록 (소비자)
    List<GroupDealListResponseDto> getGroupDealList(String status);

    // 공동구매 상세 (소비자)
    GroupDealDetailResponseDto getGroupDealDetail(Long groupDealId);

    // 공동구매 참여 (소비자)
    void joinGroupDeal(String userId, Long groupDealId, Integer quantity);

    // 공동구매 등록 (생산자)
    Long createGroupDeal(String sellerUserId, GroupDealCreateRequestDto dto);

    // ❌ 여기에는 더 이상 대시보드 메서드 없음
}