package com.farmday.producer.service;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.mapper.ProducerMapper;
import com.farmday.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProducerServiceImpl implements ProducerService {

    private final ProducerMapper producerMapper;
    private final UserMapper userMapper;

    @Override
    public void createProducerForSignup(Long userNo, Producer producer) {

        Long producerId = producerMapper.getNextProducerId();
        producer.setProducerId(producerId);
        producer.setUserNo(userNo);
        producer.setIsVerified("N");  // 기본값: 미인증

        producerMapper.insertProducer(producer);
    }

    @Override
    public List<Producer> getPendingProducers() {
        return producerMapper.findPendingProducers();
    }

    @Override
    public void approveProducer(Long producerId) {
        Producer producer = producerMapper.findById(producerId);
        if (producer == null) {
            throw new IllegalArgumentException("생산자를 찾을 수 없습니다.");
        }

        // PRODUCER 테이블 승인 처리
        producerMapper.approveProducer(producerId);

        // USERS.role = PRODUCER 로 변경
        userMapper.updateUserRole(producer.getUserNo(), "PRODUCER");
    }

    @Override
    public void rejectProducer(Long producerId, String rejectReason) {
        Producer producer = producerMapper.findById(producerId);
        if (producer == null) {
            throw new IllegalArgumentException("생산자를 찾을 수 없습니다.");
        }

        producerMapper.rejectProducer(producerId, rejectReason);

        // role 은 당분간 PRODUCER_PENDING 그대로 두거나, 필요하면 USER로 되돌릴 수도 있음
        // 여기선 그대로 두는 걸로.
    }

    @Override
    public Producer findByUserNo(Long userNo) {
        return producerMapper.findByUserNo(userNo);
    }
    
}