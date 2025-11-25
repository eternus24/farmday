package com.farmday.membership.controller;

import com.farmday.membership.dto.MembershipStatusResponse;
import com.farmday.membership.service.MembershipQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage/membership")
public class MembershipController {

    private final MembershipQueryService membershipQueryService;

    @GetMapping
    public ResponseEntity<MembershipStatusResponse> getMyMembershipStatus(
            @RequestParam("userNo") Long userNo
    ) {
        MembershipStatusResponse status = membershipQueryService.getMyMembershipStatus(userNo);
        return ResponseEntity.ok(status);
    }
}