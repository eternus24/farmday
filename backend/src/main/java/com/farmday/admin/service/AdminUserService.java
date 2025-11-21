package com.farmday.admin.service;

import com.farmday.admin.dto.AdminUserDetailDto;
import com.farmday.admin.dto.AdminUserListResponse;

public interface AdminUserService {

    AdminUserListResponse getUsers(int page, int size, String keyword, String role, String blocked);

    AdminUserDetailDto getUserDetail(Long userNo);

    void blockUser(Long userNo, String reason);

    void unblockUser(Long userNo);
}