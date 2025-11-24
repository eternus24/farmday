// src/main/java/com/farmday/groupdeal/controller/GroupDealTeamController.java
package com.farmday.groupdeal.controller;

import com.farmday.groupdeal.domain.GroupDealJoinRequestDto;
import com.farmday.groupdeal.domain.GroupDealJoinResultDto;
import com.farmday.groupdeal.domain.GroupDealTeamDto;
import com.farmday.groupdeal.service.GroupDealService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class GroupDealTeamController {

    private final GroupDealService groupDealService;

    // 팀 목록 조회
    @GetMapping("/api/group-deals/{groupDealId}/teams")
    public List<GroupDealTeamDto> getTeams(@PathVariable Long groupDealId) {
        return groupDealService.getTeamsByGroupDeal(groupDealId);
    }

    // 새 팀 생성
    @PostMapping("/api/group-deals/{groupDealId}/teams")
    public GroupDealJoinResultDto createTeam(@PathVariable Long groupDealId,
                                             @AuthenticationPrincipal String userId,
                                             @RequestBody GroupDealJoinRequestDto request) {
        // JWT에서 받은 userId를 DTO에 세팅
        request.setUserId(userId);
        // 서비스 시그니처: (Long, GroupDealJoinRequestDto)
        return groupDealService.createTeam(groupDealId, request);
    }

    // 기존 팀 참여
    @PostMapping("/api/group-deal-teams/{teamId}/join")
    public GroupDealJoinResultDto joinTeam(@PathVariable Long teamId,
                                           @AuthenticationPrincipal String userId,
                                           @RequestBody GroupDealJoinRequestDto request) {
        // JWT에서 받은 userId를 DTO에 세팅
        request.setUserId(userId);
        // 서비스 시그니처: (Long, GroupDealJoinRequestDto)
        return groupDealService.joinTeam(teamId, request);
    }
}
