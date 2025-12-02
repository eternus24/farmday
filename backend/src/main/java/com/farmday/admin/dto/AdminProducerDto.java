package com.farmday.admin.dto;

import lombok.Data;

@Data
public class AdminProducerDto {
    private Long producerId;
    private Long userNo;
    private String userId;
    private String userName;
    private String bizNo;
    private String bizName;
    private String bizAddr;
    private String bizPhone;
    private String createdDate;
    private String verifiedAt;
    private String updatedDate;
    private String rejectReason;
}