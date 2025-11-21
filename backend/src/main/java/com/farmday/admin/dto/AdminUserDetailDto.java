package com.farmday.admin.dto;

import com.farmday.user.domain.User;
import lombok.Data;

import java.util.Date;

@Data
public class AdminUserDetailDto {

    private Long userNo;
    private String role;
    private String userId;
    private String name;
    private String email;
    private String phone;
    private String addr;
    private String gender;
    private Date birth;
    private String photo;
    private String phoneVerified;
    private String emailVerified;
    private Date lastLoginAt;
    private Date createdDate;
    private Date updatedDate;
    private String isBlocked;
    private String blockReason;
    private Date blockedAt;

    public static AdminUserDetailDto fromEntity(User u) {
        AdminUserDetailDto dto = new AdminUserDetailDto();
        dto.setUserNo(u.getUserNo());
        dto.setRole(u.getRole());
        dto.setUserId(u.getUserId());
        dto.setName(u.getName());
        dto.setEmail(u.getEmail());
        dto.setPhone(u.getPhone());
        dto.setAddr(u.getAddr());
        dto.setGender(u.getGender());
        dto.setBirth(u.getBirth());
        dto.setPhoto(u.getPhoto());
        dto.setPhoneVerified(u.getPhoneVerified());
        dto.setEmailVerified(u.getEmailVerified());
        dto.setLastLoginAt(u.getLastLoginAt());
        dto.setCreatedDate(u.getCreatedDate());
        dto.setUpdatedDate(u.getUpdatedDate());
        dto.setIsBlocked(u.getIsBlocked());
        dto.setBlockReason(u.getBlockReason());
        dto.setBlockedAt(u.getBlockedAt());
        return dto;
    }
}