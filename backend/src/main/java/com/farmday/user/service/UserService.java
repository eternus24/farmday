package com.farmday.user.service;

import com.farmday.producer.domain.Producer;
import com.farmday.user.domain.User;
import com.farmday.verification.domain.EmailVerification;

public interface UserService {

    // 소비자 회원가입 (role = USER)
    void signupUser(User user);

    // 생산자 회원가입 (role = PRODUCER_PENDING)
    void signupProducer(User user, Producer producer);

    // 관리자 회원가입 (role = ADMIN) - adminCode 검증
    void signupAdmin(User user, String adminCode);

    // 로그인
    User login(String userId, String rawPassword);

    // userId로 유저 조회 (토큰 재발급 등에 사용)
    User findByUserId(String userId);

        // ✅ (추가) 이메일 인증: 1) 메일 발송
    void requestEmailVerificationForSignup(String email);

    // ✅ (추가) 이메일 인증: 2) 토큰 검증 + VERIFIED 처리 후, 인증 정보 반환
    EmailVerification completePreSignupEmailVerification(String token);
    
}
