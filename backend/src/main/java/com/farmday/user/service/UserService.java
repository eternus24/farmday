package com.farmday.user.service;

import com.farmday.producer.domain.Producer;
import com.farmday.user.domain.User;
import com.farmday.user.dto.MyInfoResponseDto;
import com.farmday.user.dto.MyInfoUpdateRequestDto;
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

    boolean existsByUserId(String userId);

    // ✅ (추가) 이메일로 유저 조회 - 소셜 로그인용
    User findByEmail(String email);

    // ✅ (추가) 소셜 로그인용 자동 회원가입
    User signupSocialUser(String provider, String providerUserId, String email, String name, String photoUrl);

        // ✅ (추가) 이메일 인증: 1) 메일 발송
    void requestEmailVerificationForSignup(String email);

    // ✅ (추가) 이메일 인증: 2) 토큰 검증 + VERIFIED 처리 후, 인증 정보 반환
    EmailVerification completePreSignupEmailVerification(String token);

    void updateLastLogin(Long userNo);

    void updateUserPhoto(Long userNo, String photoUrl);
    
    // =========================
    // ✅ 아이디 / 비밀번호 찾기용 추가 메서드
    // =========================
    /**
     * 이름 + 이메일로 userId 조회 (마스킹은 서비스에서 처리)
     */
    String findUserIdForRecovery(String name, String email);

    /**
     * 비밀번호 재설정용 이메일 발송
     */
    void requestPasswordReset(String email);

    /**
     * 비밀번호 재설정 토큰 유효성 확인
     */
    boolean validatePasswordResetToken(String token);

    /**
     * 비밀번호 실제 변경 (ResetPassword)
     */
    void resetPassword(String token, String newPassword);

    // ✅ 마이페이지 - 내 정보 조회
    MyInfoResponseDto getMyInfo(String userId);

    // ✅ 마이페이지 - 내 정보 수정
    void updateMyInfo(MyInfoUpdateRequestDto request);

}
