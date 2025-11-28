// src/main/java/com/farmday/producer/dto/ProducerProfileUpdateRequest.java
package com.farmday.producer.dto;

import lombok.Data;

@Data
public class ProducerProfileUpdateRequest {

    // USERS 정보
    private String name;
    private String email;
    private String phone;
    private String addr;
    private String photo;   // 프로필 이미지 URL

    // PRODUCER 정보
    private String bizName;
    private String bizAddr;
    private String bizPhone;
    private String bankName;
    private String bankAccountNo;
    private String accountHolder;

}