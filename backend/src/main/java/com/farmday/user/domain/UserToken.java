package com.farmday.user.domain;

import lombok.Data;

import java.util.Date;

@Data
public class UserToken {

    private Long tokenId;       // USER_TOKEN.token_id
    private Long userNo;        // USER_TOKEN.user_no
    private String tokenValue;  // USER_TOKEN.token_value
    private String tokenType;   // REFRESH 등
    private String isActive;    // Y / N
    private Date createdDate;   // 발급일
    private Date expiredDate;   // 만료일 (옵션)
    private Date revokedDate;   // 취소일 (로그아웃 등)
    private String userAgent;   // UA (옵션)
    private String ipAddress;   // IP (옵션)
}
