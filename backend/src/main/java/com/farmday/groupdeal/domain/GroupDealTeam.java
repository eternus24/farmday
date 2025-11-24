// src/main/java/com/farmday/groupdeal/domain/GroupDealTeam.java
package com.farmday.groupdeal.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GroupDealTeam {
    private Long teamId;               // PK
    private Long groupDealId;          // FK → GROUP_DEAL

    private String leaderUserId;       // 팀장(방장) userId
    private Integer targetMemberCnt;   // 목표 인원수 (보통 minMemberCount)
    private Integer currentMemberCnt;  // 현재 참여 인원수

    private String status;             // WAITING/FULL/SUCCESS/FAIL/CANCELED

    private LocalDateTime openedAt;    // 팀 생성 일시
    private LocalDateTime closedAt;    // 팀 마감 일시

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
