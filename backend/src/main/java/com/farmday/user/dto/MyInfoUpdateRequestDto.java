package com.farmday.user.dto;

import lombok.Data;

// 마이페이지 - 내 정보 수정 요청 DTO
@Data
public class MyInfoUpdateRequestDto {

    private String userId;   // pathVariable에서 세팅 예정

    private String name;
    private String phone;   // "01012345678"
    private String email;
    private String addr;
    private String birth;   // "YYYY-MM-DD" (date input)
    private String gender;  // "M" / "F"
    private String photo;
}