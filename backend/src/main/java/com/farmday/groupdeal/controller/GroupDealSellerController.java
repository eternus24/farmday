// 경로: backend/src/main/java/com/farmday/groupdeal/controller/GroupDealSellerController.java
package com.farmday.groupdeal.controller;

import com.farmday.groupdeal.dto.GroupDealCreateRequestDto;
import com.farmday.groupdeal.dto.GroupDealListResponseDto;
import com.farmday.groupdeal.service.GroupDealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/group-deals")
@RequiredArgsConstructor
public class GroupDealSellerController {

    private final GroupDealService groupDealService;

    /**
     * 생산자 공동구매 등록
     * - POST /api/seller/group-deals
     */
    @PostMapping
    public ResponseEntity<Void> createGroupDeal(
            @AuthenticationPrincipal String loginUserId,   // JWT 의 subject 가 String 이라고 가정
            @RequestBody GroupDealCreateRequestDto dto
    ) {
        // 개발 중 JWT 없이 테스트할 때 대비 (선택)
        String sellerUserId = (loginUserId != null ? loginUserId : "test1");
        // ↑ "test1" 자리는 DB에 실제로 존재하는 회원 ID 로 맞춰줘야 FK 에러 안 남

        groupDealService.createGroupDeal(sellerUserId, dto);

        return ResponseEntity.ok().build();
    }

    /**
     * 생산자가 작성한 공동구매 목록 조회
     * - GET /api/seller/group-deals/my
     */
    @GetMapping("/my")
    public ResponseEntity<List<GroupDealListResponseDto>> getMyGroupDeals(
            @AuthenticationPrincipal String loginUserId
    ) {
        String sellerUserId = (loginUserId != null ? loginUserId : "test1");
        List<GroupDealListResponseDto> list = groupDealService.getGroupDealListByProducer(sellerUserId);
        return ResponseEntity.ok(list);
    }

    /**
     * 공동구매 수정
     * - PUT /api/seller/group-deals/{groupDealId}
     */
    @PutMapping("/{groupDealId}")
    public ResponseEntity<Void> updateGroupDeal(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long groupDealId,
            @RequestBody GroupDealCreateRequestDto dto
    ) {
        String sellerUserId = (loginUserId != null ? loginUserId : "test1");
        groupDealService.updateGroupDeal(sellerUserId, groupDealId, dto);
        return ResponseEntity.ok().build();
    }

    /**
     * 공동구매 중단
     * - PATCH /api/seller/group-deals/{groupDealId}/stop
     */
    @PatchMapping("/{groupDealId}/stop")
    public ResponseEntity<Void> stopGroupDeal(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long groupDealId,
            @RequestParam(defaultValue = "STOPPED") String status
    ) {
        String sellerUserId = (loginUserId != null ? loginUserId : "test1");
        groupDealService.stopGroupDeal(sellerUserId, groupDealId, status);
        return ResponseEntity.ok().build();
    }

    /**
     * 공동구매 삭제
     * - DELETE /api/seller/group-deals/{groupDealId}
     */
    @DeleteMapping("/{groupDealId}")
    public ResponseEntity<Void> deleteGroupDeal(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long groupDealId
    ) {
        String sellerUserId = (loginUserId != null ? loginUserId : "test1");
        groupDealService.deleteGroupDeal(sellerUserId, groupDealId);
        return ResponseEntity.noContent().build();
    }
}