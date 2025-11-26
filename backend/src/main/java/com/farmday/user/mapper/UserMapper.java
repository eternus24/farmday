package com.farmday.user.mapper;

import com.farmday.user.domain.User;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {

    // 시퀀스에서 다음 user_no 뽑기
    Long getNextUserNo();

    // userId 로 유저 한 명 조회
    User findByUserId(@Param("userId") String userId);

    // 회원 INSERT
    int insertUser(User user);

    // (선택) 이메일 인증 관련 — 필요 없으면 안 써도 됨
    void updateEmailToken(
            @Param("userNo") Long userNo,
            @Param("token") String token,
            @Param("expiredAt") java.util.Date expiredAt
    );

    User findByEmailVerifyToken(@Param("token") String token);

    void verifyEmail(@Param("userNo") Long userNo);
    
    User findByEmail(@Param("email") String email);

    int countByUserId(String userId);

    User findByProviderUserId(String providerUserId);

    void updateUserRole(@Param("userNo") Long userNo, @Param("role") String role);
        
    List<User> findUsersForAdmin(Map<String, Object> params);

    long countUsersForAdmin(Map<String, Object> params);

    User findByUserNoForAdmin(@Param("userNo") Long userNo);

    int updateBlockStatus(@Param("userNo") Long userNo, @Param("blocked") String blocked, @Param("blockReason") String blockReason);

    void updateLastLogin(@Param("userNo") Long userNo);

    void updateUserPhoto(@Param("userNo") Long userNo, @Param("photo") String photo);

}