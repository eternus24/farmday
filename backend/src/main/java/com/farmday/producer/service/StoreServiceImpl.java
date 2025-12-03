package com.farmday.producer.service;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.domain.ProducerStore;
import com.farmday.producer.dto.StoreCreateRequest;
import com.farmday.producer.mapper.ProducerMapper;
import com.farmday.producer.mapper.ProducerStoreMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final ProducerStoreMapper storeMapper;
    private final ProducerMapper producerMapper;  // 🔹 추가

    @Override
    @Transactional
    public ProducerStore createStore(StoreCreateRequest req) {

        // ownerUserId 체크
        if (req.getOwnerUserId() == null || req.getOwnerUserId().isEmpty()) {
            throw new IllegalArgumentException("스토어 생성에는 ownerUserId가 필수입니다.");
        }

        // -------- 🔥 핵심 변경: producerId 자동 채움 --------
        Long producerId = req.getProducerId();

        if (producerId == null && req.getUserNo() != null) {
            // user_no → PRODUCER 조회
            Producer producer = producerMapper.findByUserNo(req.getUserNo());
            if (producer != null) {
                producerId = producer.getProducerId();
            }
        }

        // 그래도 null이면 생산자 등록이 안 된 계정임
        if (producerId == null) {
            throw new IllegalArgumentException("해당 계정은 생산자 정보가 없습니다. 생산자 등록을 먼저 진행해주세요.");
        }
        // ---------------------------------------------------

        // 엔티티 구성
        ProducerStore store = new ProducerStore();
        store.setProducerId(producerId);
        store.setOwnerUserId(req.getOwnerUserId());
        store.setStoreName(req.getStoreName());
        store.setDescription(req.getDescription());
        store.setThumbnailUrl(req.getThumbnailUrl());
        store.setStatus(
                (req.getStatus() == null || req.getStatus().isEmpty())
                        ? "READY"
                        : req.getStatus()
        );
        store.setIsActive(
                (req.getIsActive() == null || req.getIsActive().isEmpty())
                        ? "Y"
                        : req.getIsActive()
        );

        // DB insert
        storeMapper.insertStore(store);

        return store;
    }

    @Override
    public ProducerStore findByOwnerUserId(String ownerUserId) {
        return storeMapper.findByOwnerUserId(ownerUserId);
    }
}