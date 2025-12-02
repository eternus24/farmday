package com.farmday.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmday.admin.dto.AdminProducerDto;
import com.farmday.producer.mapper.ProducerMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminProducerService {

    private final ProducerMapper producerMapper;

    public List<AdminProducerDto> getProducersByStatus(String status) {
        return producerMapper.findAdminProducersByStatus(status);
    }

    @Transactional
    public void approveProducer(Long producerId) {
        producerMapper.approveProducerUserRole(producerId);
        producerMapper.markProducerVerified(producerId);
    }

    @Transactional
    public void rejectProducer(Long producerId, String rejectReason) {
        producerMapper.rejectProducerUserRole(producerId);
        producerMapper.rejectProducer(producerId, rejectReason);
    }
}
