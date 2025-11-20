package com.farmday.user.service;

import com.farmday.user.domain.UserToken;

public interface UserTokenService {

    // 로그인/재발급 시 새 리프레시 토큰 저장
    UserToken saveRefreshToken(Long userNo, String refreshToken);

    // 활성 토큰 조회 (검증용)
    UserToken getActiveToken(String refreshToken);

    // 해당 토큰 비활성화 (로그아웃/로테이션)
    void revokeToken(String refreshToken);

    // 유저 전체 토큰 비활성화 (옵션)
    void revokeAllTokensForUser(Long userNo);
}