package com.farmday.producer.service;

import com.farmday.producer.domain.ProducerStore;
import com.farmday.producer.dto.StoreCreateRequest;

public interface StoreService {

    ProducerStore createStore(StoreCreateRequest request);

    ProducerStore findByOwnerUserId(String ownerUserId);
}