package com.farmday.producer.mapper;

import com.farmday.producer.domain.Producer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProducerMapper {

    Long getNextProducerId();

    int insertProducer(Producer producer);

    Producer findByUserNo(@Param("userNo") Long userNo);

    Producer findById(@Param("producerId") Long producerId);

    List<Producer> findPendingProducers();

    void approveProducer(@Param("producerId") Long producerId);

    void rejectProducer(@Param("producerId") Long producerId,
                        @Param("rejectReason") String rejectReason);
                        
}