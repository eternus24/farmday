package com.farmday.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminUserListResponse {
    private long totalCount;
    private int page;
    private int size;
    private List<AdminUserDetailDto> users;
}