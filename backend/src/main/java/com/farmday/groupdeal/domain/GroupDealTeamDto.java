// src/main/java/com/farmday/groupdeal/domain/GroupDealTeamDto.java
package com.farmday.groupdeal.domain;

import lombok.Data;

@Data
public class GroupDealTeamDto {

    private Long teamId;

    private String leaderMaskedName;   // 김*수님
    private Integer currentMemberCnt;  // 1
    private Integer targetMemberCnt;   // 2

    private String openedAgoText;      // "10분 전 시작", "30분 전 시작"
    private String needMoreText;       // "1명 더 필요!"
    private boolean joinable;          // 참여 가능 여부 (팀 상태/인원 기반)
}
