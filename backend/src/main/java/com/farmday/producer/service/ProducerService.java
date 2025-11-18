package com.farmday.producer.service;

import com.farmday.producer.domain.Producer;

import java.util.List;

public interface ProducerService {

    // 회원가입 시 PRODUCER 생성
    void createProducerForSignup(Long userNo, Producer producer);

    // 승인 대기 목록
    List<Producer> getPendingProducers();

    // 승인
    void approveProducer(Long producerId);

    // 반려
    void rejectProducer(Long producerId, String rejectReason);
}