package com.farmday.user.controller;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.service.ProducerService;
import com.farmday.security.jwt.JwtTokenProvider;
import com.farmday.user.domain.User;
import com.farmday.user.domain.UserToken;
import com.farmday.user.service.UserService;
import com.farmday.user.service.UserTokenService;
import com.farmday.verification.domain.EmailVerification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProducerService producerService;
    private final UserTokenService userTokenService;

    @Value("${admin.signup.code}")
    private String adminSignupCode;   // ✅ 관리자 회원가입 코드

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
                + "&token=" + URLEncoder.encode(ev.getToken(), StandardCharsets.UTF_8.name());

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

        producer.setIsVerified("N");   // 아직 미인증

        // 4) 등록 (유저번호 연결)
        producerService.createProducerForSignup(user.getUserNo(), producer);

        return ResponseEntity.ok("생산자 가입 신청이 완료되었습니다.");
    }

    // ==========================
    // 3) 관리자 회원가입 (인증코드 필요)
    // ==========================
    @PostMapping("/admin/signup")
    public ResponseEntity<?> adminSignup(@RequestBody AdminSignupRequest request) {

        if (!adminSignupCode.equals(request.getAdminCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("관리자 회원가입 코드가 올바르지 않습니다.");
        }

        User user = new User();
        user.setUserId(request.getUserId());
        user.setUserPwd(request.getPassword());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole("ADMIN");

        userService.signupUser(user);

        return ResponseEntity.ok("관리자 회원가입이 완료되었습니다.");
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.getUserId(), request.getPassword());

            if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("관리자만 로그인 가능합니다.");
            }

            userService.updateLastLogin(user.getUserNo());

            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            try {
                userTokenService.saveRefreshToken(user.getUserNo(), refreshToken);
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken, user));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 올바르지 않습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================
    // 4) 일반 로그인 (토큰 발급)
    // ==========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.getUserId(), request.getPassword());

            userService.updateLastLogin(user.getUserNo());

            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            try {
                userTokenService.saveRefreshToken(user.getUserNo(), refreshToken);
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            LoginResponse response = new LoginResponse(accessToken, refreshToken, user);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 올바르지 않습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================
    // 4-1) 구글 소셜 로그인 (accessToken만 받음)
    // ==========================
    @PostMapping("/social/google")
    public ResponseEntity<?> googleSocialLogin(@RequestBody AccessTokenRequest request) {

        try {
            SocialLoginRequest socialReq = fetchGoogleUserInfo(request.getAccessToken());
            socialReq.setProvider("GOOGLE");
            return handleSocialLogin("GOOGLE", socialReq);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("구글 소셜 로그인 처리 중 오류가 발생했습니다.");
        }
    }

    // ==========================
    // 4-2) 카카오 소셜 로그인 (accessToken만 받음)
    // ==========================
    @PostMapping("/social/kakao")
    public ResponseEntity<?> kakaoSocialLogin(@RequestBody AccessTokenRequest request) {

        try {
            SocialLoginRequest socialReq = fetchKakaoUserInfo(request.getAccessToken());
            socialReq.setProvider("KAKAO");
            return handleSocialLogin("KAKAO", socialReq);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("카카오 소셜 로그인 처리 중 오류가 발생했습니다.");
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

        UserToken storedToken = userTokenService.getActiveToken(refreshToken);
        if (storedToken == null || !"Y".equalsIgnoreCase(storedToken.getIsActive())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("이미 로그아웃되었거나 유효하지 않은 리프레시 토큰입니다.");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        userTokenService.revokeToken(refreshToken);
        userTokenService.saveRefreshToken(user.getUserNo(), newRefreshToken);

        TokenRefreshResponse response =
                new TokenRefreshResponse(newAccessToken, newRefreshToken);
        return ResponseEntity.ok(response);
    }

    // ==========================
    // 6) 로그아웃 (Refresh Token 무효화)
    // ==========================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody TokenRefreshRequest request) {
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

        userTokenService.revokeToken(refreshToken);

        return ResponseEntity.ok("로그아웃 완료");
    }

    /**
     * 소셜 로그인 공통 처리:
     * - email 로 기존 유저 찾기
     * - 없으면 자동 회원가입
     * - 액세스/리프레시 토큰 발급 + 저장
     */
    private ResponseEntity<?> handleSocialLogin(String provider, SocialLoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("이메일 정보가 없습니다.");
        }
        if (request.getProviderUserId() == null || request.getProviderUserId().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("소셜 사용자 ID가 없습니다.");
        }

        User user = userService.findByEmail(request.getEmail());

        if (user == null) {
            // ⭐ USERS 테이블 기반 소셜 회원가입
            user = userService.signupSocialUser(
                    provider,
                    request.getProviderUserId(),
                    request.getEmail(),
                    request.getName(),
                    request.getPhotoUrl()
            );
        }

        userService.updateLastLogin(user.getUserNo());

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        try {
            userTokenService.saveRefreshToken(user.getUserNo(), refreshToken);
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        LoginResponse response = new LoginResponse(accessToken, refreshToken, user);
        return ResponseEntity.ok(response);
    }

    // ==========================
    // 7) 구글 유저 정보 조회 (accessToken → email, name, picture)
    // ==========================
    private SocialLoginRequest fetchGoogleUserInfo(String accessToken) throws Exception {
        String url = "https://www.googleapis.com/oauth2/v3/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> resp = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("구글 사용자 정보 조회 실패: " + resp.getStatusCode());
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(resp.getBody());

        String sub = root.path("sub").asText();           // 구글 고유 ID
        String email = root.path("email").asText(null);
        String name = root.path("name").asText(null);
        String picture = root.path("picture").asText(null);

        SocialLoginRequest req = new SocialLoginRequest();
        req.setProviderUserId(sub);
        req.setEmail(email);
        req.setName(name != null ? name : email);
        req.setPhotoUrl(picture);

        return req;
    }

    // ==========================
    // 8) 카카오 유저 정보 조회 (accessToken → email, nickname, profile_image)
    //   주소/연령대는 제외
    // ==========================
    private SocialLoginRequest fetchKakaoUserInfo(String accessToken) throws Exception {
        String url = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> resp = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("카카오 사용자 정보 조회 실패: " + resp.getStatusCode());
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(resp.getBody());

        Long kakaoId = root.path("id").asLong();
        JsonNode account = root.path("kakao_account");
        JsonNode profile = account.path("profile");

        String email = account.path("email").asText(null);
        String name = account.path("name").asText(null);
        String nickname = profile.path("nickname").asText(null);
        String profileImage = profile.path("profile_image_url").asText(null);

        SocialLoginRequest req = new SocialLoginRequest();
        req.setProviderUserId(String.valueOf(kakaoId));
        req.setEmail(email);
        req.setName(
                name != null && !name.isEmpty()
                        ? name
                        : (nickname != null ? nickname : "카카오사용자")
        );
        req.setPhotoUrl(profileImage);

        // 연령대/주소 제외, 필요하면 gender/phone/birth 등도 여기서 추출 가능

        return req;
    }

    // 1) 아이디 찾기
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody FindIdRequest dto) {
        String maskedId = userService.findUserIdForRecovery(dto.getName(), dto.getEmail());

        if (maskedId == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("일치하는 계정을 찾을 수 없습니다.");
        }

        // Java 8에서는 Map.of 대신 Collections.singletonMap 사용
        return ResponseEntity.ok(
                java.util.Collections.singletonMap("userId", maskedId)
        );
    }

    // 2) 비밀번호 재설정 메일 요청
    @PostMapping("/password/reset-request")
    public ResponseEntity<?> resetRequest(@RequestBody ResetRequest dto) {
        userService.requestPasswordReset(dto.getEmail());
        // 계정 존재 여부와 상관없이 동일 응답 (보안상)
        return ResponseEntity.ok("비밀번호 재설정 메일이 발송되었습니다(계정이 존재하는 경우).");
    }

    // 3) 토큰 유효성 검사 (프론트 /reset-password 들어갈 때)
    @GetMapping("/password/validate")
    public ResponseEntity<?> validate(@RequestParam String token) {
        boolean valid = userService.validatePasswordResetToken(token);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("토큰이 유효하지 않거나 만료되었습니다.");
        }
        return ResponseEntity.ok("OK");
    }

    // 4) 새 비밀번호 설정
    @PostMapping("/password/reset")
    public ResponseEntity<?> reset(@RequestBody ResetPasswordDto dto) {
        userService.resetPassword(dto.getToken(), dto.getNewPassword());
        return ResponseEntity.ok("비밀번호가 변경되었습니다.");
    }

    // ==========================
    // 내부 DTO들
    // ==========================

    @Data
    static class FindIdRequest {
        private String name;
        private String email;
    }

    @Data
    static class ResetRequest {
        private String email;
    }

    @Data
    static class ResetPasswordDto {
        private String token;
        private String newPassword;
    }

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

    @GetMapping("/check-userid")
    public ResponseEntity<String> checkUserId(@RequestParam String userId) {
        boolean exists = userService.existsByUserId(userId);
        if (exists) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("이미 사용 중인 아이디입니다.");
        } else {
            return ResponseEntity
                    .ok("사용 가능한 아이디입니다.");
        }
    }

    // 프론트에서 보내는 바디: { "accessToken": "..." }
    @Data
    static class AccessTokenRequest {
        private String accessToken;
    }

    // 내부 공통 DTO (클라에서 이걸 직접 보내지 않음)
    @Data
    static class SocialLoginRequest {
        private String provider;        // GOOGLE / KAKAO
        private String providerUserId;  // 소셜 고유 ID
        private String email;           // account_email
        private String name;            // name or nickname
        private String photoUrl;        // 프로필 이미지 URL
    }

}