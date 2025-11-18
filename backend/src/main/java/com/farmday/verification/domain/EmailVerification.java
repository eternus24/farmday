package com.farmday.verification.domain;

import lombok.Data;

import java.util.Date;

@Data
public class EmailVerification {

    private Long emailId;     // EMAIL_VERIFICATION.email_id
    private String email;     // 인증할 이메일
    private String token;     // 인증 토큰 (UUID)
    private String status;    // PENDING / VERIFIED / USED
    private String purpose;   // SIGNUP 등
    private Date requestedAt;
    private Date verifiedAt;
    private Date expiredAt;
    private Date createdDate;
    private Date updatedDate;
}