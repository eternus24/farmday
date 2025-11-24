// src/main/java/com/farmday/groupdeal/controller/GroupDealController.java
package com.farmday.groupdeal.controller;
import com.farmday.groupdeal.domain.GroupDealImage;
import com.farmday.groupdeal.domain.GroupDealCardDto;
import com.farmday.groupdeal.domain.GroupDealDetailDto;
import com.farmday.groupdeal.service.GroupDealService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/group-deals")
public class GroupDealController {

    private final GroupDealService groupDealService;

    // 공동구매 리스트(카드) 조회 + 썸네일 포함
    @GetMapping
    public List<GroupDealCardDto> getGroupDealList() {
        return groupDealService.getActiveGroupDealCards();
    }

    // 공동구매 상세 조회 + 이미지 리스트 포함
    @GetMapping("/{groupDealId}")
    public GroupDealDetailDto getGroupDealDetail(@PathVariable Long groupDealId) {
        return groupDealService.getGroupDealDetail(groupDealId);
    }
}
