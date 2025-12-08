package com.farmday.review.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class UserPointDTO {
    
    // 포인트 이력 PK
    private Long pointHistoryId;

    // 대상 사용자 (USERS.user_no)
    private Long userNo;

    // 변동 포인트 (+적립 / -차감)
    private Integer pointAmount;

    // 포인트 유형 (REVIEW, ORDER, REFUND 등)
    private String pointType;

    // 관련 ID (order_item_id, order_id 등)
    private Long relatedId;

    // 포인트 발생 사유 설명
    private String description;

    // 발생 일시
    private Date createdDate;
}