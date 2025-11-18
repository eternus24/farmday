package com.farmday.producer.domain;

import lombok.Data;

import java.util.Date;

@Data
public class Producer {

    private Long producerId;      // PK (PRODUCER_SEQ)
    private Long userNo;          // FK → USERS.user_no

    private String bizNo;         // 사업자등록번호
    private String bizName;       // 상호 / 농장명
    private String bizAddr;       // 사업장 주소
    private String bizPhone;      // 사업장 연락처

    private String bankName;      // 정산용 은행명
    private String bankAccountNo; // 정산 계좌번호
    private String accountHolder; // 예금주

    private String isVerified;    // Y/N
    private Date verifiedAt;      // 인증 완료 일시
    private String rejectReason;  // 반려 사유

    private Date createdDate;     // 등록일
    private Date updatedDate;     // 수정일
}
