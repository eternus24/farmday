package com.farmday.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.admin.dto.AdminProducerDto;
import com.farmday.admin.service.AdminProducerService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/producers")
@RequiredArgsConstructor
public class AdminProducerController {

    private final AdminProducerService adminProducerService;

    // 목록 조회
    @GetMapping
    public List<AdminProducerDto> getProducers(@RequestParam String status) {
        return adminProducerService.getProducersByStatus(status);
    }

    // 승인
    @PostMapping("/{producerId}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long producerId) {
        adminProducerService.approveProducer(producerId);
        return ResponseEntity.ok().build();
    }

    // 반려
    @PostMapping("/{producerId}/reject")
    public ResponseEntity<Void> reject(
            @PathVariable Long producerId,
            @RequestBody RejectRequest request
    ) {
        adminProducerService.rejectProducer(producerId, request.getRejectReason());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class RejectRequest {
        private String rejectReason;
    }
}