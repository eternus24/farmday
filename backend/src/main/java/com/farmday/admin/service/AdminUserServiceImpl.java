package com.farmday.admin.service;

import com.farmday.admin.dto.AdminUserDetailDto;
import com.farmday.admin.dto.AdminUserListResponse;
import com.farmday.user.domain.User;
import com.farmday.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserMapper userMapper;

    @Override
    public AdminUserListResponse getUsers(int page, int size, String keyword, String role, String blocked) {
        int pageIndex = Math.max(page, 1);
        int pageSize = Math.max(size, 1);
        int offset = (pageIndex - 1) * pageSize;

        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("role", role);
        params.put("blocked", blocked);
        params.put("offset", offset);
        params.put("size", pageSize);

        long totalCount = userMapper.countUsersForAdmin(params);
        List<User> users = userMapper.findUsersForAdmin(params);

        AdminUserListResponse resp = new AdminUserListResponse();
        resp.setTotalCount(totalCount);
        resp.setPage(pageIndex);
        resp.setSize(pageSize);
        resp.setUsers(
                users.stream()
                        .map(AdminUserDetailDto::fromEntity)
                        .collect(Collectors.toList())
        );

        return resp;
    }

    @Override
    public AdminUserDetailDto getUserDetail(Long userNo) {
        User user = userMapper.findByUserNoForAdmin(userNo);
        if (user == null) {
            throw new IllegalArgumentException("해당 사용자를 찾을 수 없습니다. userNo=" + userNo);
        }
        return AdminUserDetailDto.fromEntity(user);
    }

    @Override
    public void blockUser(Long userNo, String reason) {
        int updated = userMapper.updateBlockStatus(userNo, "Y", reason);
        if (updated == 0) {
            throw new IllegalArgumentException("차단 대상 사용자를 찾을 수 없습니다. userNo=" + userNo);
        }
    }

    @Override
    public void unblockUser(Long userNo) {
        int updated = userMapper.updateBlockStatus(userNo, "N", null);
        if (updated == 0) {
            throw new IllegalArgumentException("차단 해제 대상 사용자를 찾을 수 없습니다. userNo=" + userNo);
        }
    }
}