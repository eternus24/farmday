package com.farmday.membership.domain;

import java.util.Date;

import lombok.Data;

@Data
public class UserMembership {

    private Long userNo;                // PK, FK → USERS.user_no

    private String gradeCode;           // 현재등급 코드
    private String gradeName;           // 현재등급 이름

    private Long monthSpentAmount;       // 최근 1년 금액
    private Long lifetimeSpentAmount;   // 총 누적 금액

    private Date lastGradeChangedAt;

    // 선택 필드 (추후 필요하면 사용)
    private String nextGradeCode;
    private Long nextGradeNeedAmount;

    private Date createdDate;
    private Date updatedDate;
}