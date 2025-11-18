package com.farmday.user.controller;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.service.ProducerService;
import com.farmday.security.jwt.JwtTokenProvider;
import com.farmday.user.domain.User;
import com.farmday.user.service.UserService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import com.farmday.verification.domain.EmailVerification;
import org.springframework.beans.factory.annotation.Value;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProducerService producerService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ==========================
    // 0) 소비자 회원가입 전 - 이메일 인증 요청
    // ==========================
    @PostMapping("/pre-signup/email")
    public ResponseEntity<?> preSignupEmail(@RequestBody EmailVerificationRequest request) {
        userService.requestEmailVerificationForSignup(request.getEmail());
        return ResponseEntity.ok("이메일로 인증 링크를 발송했습니다.");
    }

    // ==========================
    // 0-2) 이메일 링크 클릭 - 회원가입 화면으로 리다이렉트
    // ==========================
    @GetMapping("/pre-signup/verify-email")
    public ResponseEntity<Void> preSignupVerifyEmail(@RequestParam("token") String token) throws Exception {

        EmailVerification ev = userService.completePreSignupEmailVerification(token);

        String redirectUrl = frontendUrl
                + "/signup?email=" + URLEncoder.encode(ev.getEmail(), StandardCharsets.UTF_8.name())
                + "&emailToken=" + URLEncoder.encode(ev.getToken(), StandardCharsets.UTF_8.name());

        return ResponseEntity
                .status(HttpStatus.FOUND)   // 302 리다이렉트
                .location(URI.create(redirectUrl))
                .build();
                 
    }

    // ==========================
    // 1) 소비자 회원가입
    // ==========================
    @PostMapping("/signup/user")
    public ResponseEntity<?> signupUser(@RequestBody SignupRequest request) {

        User user = new User();
        user.setUserId(request.getUserId());
        user.setUserPwd(request.getPassword());
        user.setRole("USER");
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setAddr(request.getAddr());
        if (request.getBirth() != null && !request.getBirth().trim().isEmpty()) {
            LocalDate localDate = LocalDate.parse(request.getBirth(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            user.setBirth(java.sql.Date.valueOf(localDate));
        }

        user.setGender(request.getGender());
        userService.signupUser(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("소비자 회원가입이 완료되었습니다.");
    }

    // ==========================
    // 2) 생산자 회원가입 (승인 대기)
    // ==========================
    @PostMapping("/signup/producer")
    public ResponseEntity<?> producerSignup(@RequestBody ProducerSignupRequest request){

        // 1) USER 생성
        User user = new User();
        user.setUserId(request.getUserId());
        user.setUserPwd(request.getPassword());
        user.setRole("PRODUCER_PENDING");  // 승인대기
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setAddr(request.getAddr());
        user.setGender(request.getGender());
        user.setIsBlocked("N");

        // birth 변환
        if (request.getBirth() != null && !request.getBirth().trim().isEmpty()) {
            LocalDate date = LocalDate.parse(request.getBirth().trim());
            user.setBirth(java.sql.Date.valueOf(date));
        }

        // 2) USER 저장 (user_no 생성)
        userService.signupUser(user);

        // 2) Producer 정보 생성
        Producer producer = new Producer();
        producer.setBizNo(request.getBizNo());
        producer.setBizName(request.getBizName());
        producer.setBizAddr(request.getBizAddr());
        producer.setBizPhone(request.getBizPhone());
        producer.setBankName(request.getBankName());
        producer.setBankAccountNo(request.getBankAccountNo());
        producer.setAccountHolder(request.getAccountHolder());

        // 엔티티에 status 필드는 없고, isVerified만 있으니까 이렇게 두는 게 자연스러워
        producer.setIsVerified("N");   // 아직 미인증
        // verifiedAt / rejectReason / createdDate / updatedDate 는 DB에서 채우도록 둬도 됨

        // 4) 등록 (유저번호 연결)
        producerService.createProducerForSignup(user.getUserNo(), producer);

        return ResponseEntity.ok("생산자 가입 신청이 완료되었습니다.");
    }

    // ==========================
    // 3) 관리자 회원가입 (인증코드 필요)
    // ==========================
    @PostMapping("/signup/admin")
    public ResponseEntity<?> signupAdmin(@RequestBody AdminSignupRequest request) {
        User user = new User();
        user.setUserId(request.getUserId());
        user.setUserPwd(request.getPassword());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        userService.signupAdmin(user, request.getAdminCode());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("관리자 회원가입이 완료되었습니다.");
    }

    // ==========================
    // 4) 로그인 (토큰 발급)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1) 아이디/비밀번호 검증
            User user = userService.login(request.getUserId(), request.getPassword());

            // 2) 토큰 발급
            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            // 3) 성공 응답
            LoginResponse response = new LoginResponse(accessToken, refreshToken, user);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // ❗ 아이디/비밀번호 틀렸을 때 → 401 + 깔끔한 메시지 한 줄만
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 올바르지 않습니다.");
        } catch (IllegalStateException e) {
            // 차단 계정 같은 경우 → 403
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================
    // 5) 토큰 재발급 (Refresh Token)
    // ==========================
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("유효하지 않은 리프레시 토큰입니다.");
        }

        String userId = jwtTokenProvider.getUserId(refreshToken);
        User user = userService.findByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("사용자를 찾을 수 없습니다.");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        TokenRefreshResponse response =
                new TokenRefreshResponse(newAccessToken, newRefreshToken);
        return ResponseEntity.ok(response);
    }

    // ==========================
    // 내부 DTO들
    // ==========================

    @Data
    static class EmailVerificationRequest {
        private String email;
    }

    @Data
    static class SignupRequest {
        private String userId;
        private String password;
        private String name;
        private String phone;
        private String email;
        private String addr;
        private String birth;   // "YYYY-MM-DD" 형식 등
        private String gender;
    }

    @Data
    static class AdminSignupRequest {
        private String userId;
        private String password;
        private String name;
        private String email;
        private String adminCode; // 관리자 인증코드
    }

    @Data
    static class LoginRequest {
        private String userId;
        private String password;
    }

    @Data
    @AllArgsConstructor
    static class LoginResponse {
        private String accessToken;
        private String refreshToken;
        private User user;
    }

    @Data
    static class TokenRefreshRequest {
        private String refreshToken;
    }

    @Data
    @AllArgsConstructor
    static class TokenRefreshResponse {
        private String accessToken;
        private String refreshToken;
    }

    @Data
    static class ProducerSignupRequest {
        // 공통 유저 정보
        private String userId;
        private String password;
        private String name;
        private String phone;
        private String email;
        private String addr;
        private String birth;   // "yyyy-MM-dd"
        private String gender;

        // 생산자 전용 정보
        private String bizNo;
        private String bizName;
        private String bizAddr;
        private String bizPhone;
        private String bankName;
        private String bankAccountNo;
        private String accountHolder;
    }

}