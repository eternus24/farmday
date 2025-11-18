package com.farmday.user.domain;
// USER 도메인 & DTO / User VO (도메인 클래스)
//컬럼명과 1:1 매핑 + map-underscore-to-camel-case로 언더스코어 자동 처리됨.

import lombok.Data;

import java.util.Date;

@Data
public class User {
    private Long userNo;
    private String role;
    private String userId;
    private String userPwd;
    private String addr;
    private String name;
    private String phone;
    private String phoneVerified;
    private String email;
    private String emailVerified;
    private String emailVerifyToken;
    private Date emailVerifyExpiredAt;
    private Date birth;
    private String gender;
    private String photo;
    private Date lastLoginAt;
    private Date createdDate;
    private Date updatedDate;
    private String isBlocked;
    private String blockReason;
    private Date blockedAt;
}
