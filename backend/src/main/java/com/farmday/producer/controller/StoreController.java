// backend/src/main/java/com/farmday/producer/controller/StoreController.java
package com.farmday.producer.controller;

import com.farmday.producer.domain.ProducerStore;
import com.farmday.producer.dto.StoreCreateRequest;
import com.farmday.producer.dto.StoreResponse;
import com.farmday.producer.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    /**
     * 프론트에서 JSON으로 오는 스토어 생성 요청 처리
     * - 이미지 업로드는 이미 다른 서버(192.168.0.76)에서 처리되어 thumbnailUrl만 넘어옴
     */
    @PostMapping
    public ResponseEntity<StoreResponse> createStore(@RequestBody StoreCreateRequest req) {

        // 필수값 체크
        if (!StringUtils.hasText(req.getStoreName())) {
            return ResponseEntity.badRequest().build();
        }

        // 기본값 보정
        if (!StringUtils.hasText(req.getStatus())) {
            req.setStatus("READY");   // 기본 운영 상태
        }
        if (!StringUtils.hasText(req.getIsActive())) {
            req.setIsActive("Y");     // 기본 활성화
        }

        // 서비스 호출 (DB INSERT)
        ProducerStore store = storeService.createStore(req);

        // 응답 DTO 구성
        StoreResponse res = StoreResponse.builder()
                .storeId(store.getStoreId())
                .storeName(store.getStoreName())
                .description(store.getDescription())
                .thumbnailUrl(store.getThumbnailUrl())
                .status(store.getStatus())
                .isActive(store.getIsActive())
                .build();

        return ResponseEntity.ok(res);
    }
}
