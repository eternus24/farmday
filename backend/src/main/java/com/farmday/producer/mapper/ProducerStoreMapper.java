package com.farmday.producer.mapper;

import com.farmday.producer.domain.ProducerStore;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProducerStoreMapper {

    void insertStore(ProducerStore store);

    ProducerStore findByOwnerUserId(String ownerUserId);

}