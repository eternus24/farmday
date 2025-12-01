// 경로: backend/src/main/java/com/farmday/groupdeal/controller/GroupDealSellerController.java
package com.farmday.groupdeal.controller;

import com.farmday.groupdeal.dto.GroupDealCreateRequestDto;
import com.farmday.groupdeal.service.GroupDealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
}
