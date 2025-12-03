package com.farmday.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 마이페이지 - 내 정보 조회용 DTO (비밀번호 없음!)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyInfoResponseDto {

    private Long userNo;       // user_no
    private String role;       // role
    private String userId;     // user_id
    private String name;       // name
    private String phone;      // phone (01012345678 형식으로 저장 추천)
    private String email;      // email
    private String addr;       // addr

    // 날짜는 프론트 포맷 맞추기 편하게 String으로 받자
    private String birth;         // "YYYY-MM-DD"
    private String gender;        // "M", "F" 등
    private String createdDate;   // "YYYY-MM-DD HH24:MI:SS"
    private String lastLoginAt;   // "YYYY-MM-DD HH24:MI:SS"
    private String photo;
}