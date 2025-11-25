package com.farmday.producer.controller;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.dto.LowStockProductDto;
import com.farmday.producer.dto.ProducerDashboardSummaryDto;
import com.farmday.producer.service.ProducerService;
import com.farmday.user.domain.User;
import com.farmday.user.service.UserService;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/producer")
public class ProducerController {

    private final UserService userService;
    private final ProducerService producerService;

    @GetMapping("/me")
    public ResponseEntity<ProducerMeResponse> getMyProducerInfo(
            @AuthenticationPrincipal String loginUserId
    ) {

        System.out.println(">>> /api/producer/me loginUserId = " + loginUserId);

        String userId = loginUserId;
        User user = userService.findByUserId(userId);

        if (user == null) {
            System.out.println(">>> USER NOT FOUND for userId = " + userId);
            return ResponseEntity.notFound().build();
        }

        System.out.println(">>> FOUND USER: userNo = " + user.getUserNo());

        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            System.out.println(">>> PRODUCER NOT FOUND for userNo = " + user.getUserNo());
            return ResponseEntity.notFound().build();
        }

        System.out.println(">>> FOUND PRODUCER: producerId = " + producer.getProducerId());

        // DTO 생성
        ProducerMeResponse dto = new ProducerMeResponse(
                // 🔹 유저 정보
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getPhoto(),

                // 🔹 기존 Producer 정보 그대로 유지
                producer.getProducerId(),
                producer.getBizName(),   // farmName
                producer.getBizNo(),
                producer.getBizAddr(),
                producer.getBizPhone(),

                producer.getBankName(),
                producer.getBankAccountNo(),
                producer.getAccountHolder(),
                producer.getIsVerified(),

                // 스토어 여부는 당장은 false
                false
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal String loginUserId) {

        User user = userService.findByUserId(loginUserId);
        
        if (user == null) {
            return ResponseEntity.status(401).body("유저 없음");
        }

        Producer producer = producerService.findByUserNo(user.getUserNo());

        if (producer == null) {
            return ResponseEntity.status(403).body("생산자 권한이 없습니다.");
        }

        Long producerId = producer.getProducerId();

        ProducerDashboardSummaryDto summary =
                producerService.getDashboardSummary(producerId);

        List<LowStockProductDto> lowStocks =
                producerService.getLowStockProducts(producerId);

        return ResponseEntity.ok(new ProducerDashboardResponse(summary, lowStocks));
    }

    @Data
    @AllArgsConstructor
    static class ProducerDashboardResponse {
        private ProducerDashboardSummaryDto summary;
        private List<LowStockProductDto> lowStockProducts;
    }

    @Data
    @AllArgsConstructor
    static class ProducerMeResponse {

        // 🔹 유저 정보
        private String userId;
        private String name;
        private String email;
        private String phone;
        private String photoUrl;

        // 🔹 생산자 정보
        private Long producerId;
        private String farmName;
        private String bizNo;
        private String farmAddr;
        private String farmPhone;

        // 🔹 기존 Producer 정보 유지
        private String bankName;
        private String bankAccountNo;
        private String accountHolder;
        private String isVerified;

        // 🔹 추가 정보
        private boolean hasStore;
    }
}