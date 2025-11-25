package com.farmday.producer.controller;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.service.ProducerService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/producer")
public class ProducerAdminController {

    private final ProducerService producerService;

    // 승인 대기 목록 조회
    @GetMapping("/pending")
    public ResponseEntity<List<Producer>> getPendingProducers() {
        List<Producer> list = producerService.getPendingProducers();
        return ResponseEntity.ok(list);
    }

    // 승인
    @PostMapping("/{producerId}/approve")
    public ResponseEntity<?> approveProducer(@PathVariable Long producerId) {
        producerService.approveProducer(producerId);
        return ResponseEntity.ok("생산자 승인 완료");
    }

    // 반려
    @PostMapping("/{producerId}/reject")
    public ResponseEntity<?> rejectProducer(
            @PathVariable Long producerId,
            @RequestBody RejectRequest request
    ) {
        producerService.rejectProducer(producerId, request.getRejectReason());
        return ResponseEntity.ok("생산자 반려 처리 완료");
    }

    @Data
    static class RejectRequest {
        private String rejectReason;
    }

}


