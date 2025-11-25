// src/main/java/com/farmday/delivery/mapper/DeliveryMapper.java
package com.farmday.delivery.mapper;

import com.farmday.delivery.domain.Delivery;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DeliveryMapper {

    Delivery findByOrderId(@Param("orderId") Long orderId);

    void insertDelivery(Delivery delivery);

    void updateDelivery(Delivery delivery);
}