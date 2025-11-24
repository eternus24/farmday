// src/main/java/com/farmday/groupdeal/domain/GroupDealMember.java
package com.farmday.groupdeal.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GroupDealMember {
    private Long memberId;             // PK
    private Long teamId;               // FK → GROUP_DEAL_TEAM

    private String userId;             // 참여자 userId
    private Long orderId;              // ORDER.order_id (결제 후 연결)
    private Long orderItemId;          // ORDER_ITEM.order_item_id

    private String status;             // PENDING_PAYMENT/PAID/CANCELED/REFUNDED

    private LocalDateTime resultNotifiedAt; // 성공/실패 알림 발송 시간
    private LocalDateTime joinedAt;         // 참여 일시
}
