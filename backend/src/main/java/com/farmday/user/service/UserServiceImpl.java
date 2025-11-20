package com.farmday.user.service;

import com.farmday.user.domain.User;
import com.farmday.user.mapper.UserMapper;
import com.farmday.verification.domain.EmailVerification;
import com.farmday.verification.mapper.EmailVerificationMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import com.farmday.producer.domain.Producer;
import com.farmday.producer.service.ProducerService;

import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ProducerService producerService;
        // ✅ (추가)
    private final EmailVerificationMapper emailVerificationMapper;
    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.backend-url}")
    private String backendUrl;

    // 관리자 가입용 인증 코드 (application.yml 등에 설정)
    @Value("${admin.signup.code}")
    private String adminSignupCode;

    @Override
    public void signupUser(User user) {
        // 1) 시퀀스로 user_no 세팅
        Long userNo = userMapper.getNextUserNo();
        user.setUserNo(userNo);

        // 2) role이 비어 있으면 기본값 USER, 이미 세팅돼 있으면 그대로 사용
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        }
        // 생산자 회원가입에서는 컨트롤러에서 "PRODUCER_PENDING" 넣어둔 상태 그대로 감

        // 3) 비밀번호 암호화
        user.setUserPwd(passwordEncoder.encode(user.getUserPwd()));

        // 4) 기본 상태값들 (null이면 N으로)
        if (user.getPhoneVerified() == null) {
            user.setPhoneVerified("N");
        }
        if (user.getEmailVerified() == null) {
            user.setEmailVerified("N");
        }
        if (user.getIsBlocked() == null) {
            user.setIsBlocked("N");
        }

        // 5) INSERT
        userMapper.insertUser(user);
    }

    @Override
    public boolean existsByUserId(String userId) {
        return userMapper.countByUserId(userId) > 0;
    }

    @Override
    public void signupProducer(User user, Producer producer) {
        Long userNo = userMapper.getNextUserNo();
        user.setUserNo(userNo);
        user.setRole("PRODUCER_PENDING"); // 관리자 승인 대기
        user.setUserPwd(passwordEncoder.encode(user.getUserPwd()));
        user.setPhoneVerified("N");
        user.setEmailVerified("N");
        user.setIsBlocked("N");
        userMapper.insertUser(user);

        // PRODUCER 테이블 생성
        producerService.createProducerForSignup(userNo, producer);
    }

    @Override
    public void signupAdmin(User user, String adminCode) {
        // 관리자 인증 코드 검증
        if (!adminSignupCode.equals(adminCode)) {
            throw new IllegalArgumentException("관리자 인증 코드가 올바르지 않습니다.");
        }

        Long userNo = userMapper.getNextUserNo();
        user.setUserNo(userNo);
        user.setRole("ADMIN");
        user.setUserPwd(passwordEncoder.encode(user.getUserPwd()));
        user.setPhoneVerified("N");
        user.setEmailVerified("N");
        user.setIsBlocked("N");
        userMapper.insertUser(user);
    }

    @Override
    public User login(String userId, String password) {
        User saved = userMapper.findByUserId(userId);
        if (saved == null) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        if ("Y".equalsIgnoreCase(saved.getIsBlocked())) {
            throw new IllegalStateException("차단된 계정입니다.");
        }

        boolean isMatch = passwordEncoder.matches(password, saved.getUserPwd());
        if (!isMatch) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // 마지막 로그인 시간은 DB에서 SYSDATE로 관리해도 되고,
        // 필요하면 별도 update 쿼리 만들어서 호출해도 됨.
        // 여기서는 단순히 User만 반환
        return saved;
    }

    @Override
    public User findByUserId(String userId) {
        return userMapper.findByUserId(userId);
    }

    @Override
    public void requestEmailVerificationForSignup(String email) {
        // 1) 이미 가입된 이메일인지 확인
        User existing = userMapper.findByEmail(email);
        if (existing != null) {
            throw new IllegalStateException("이미 가입된 이메일입니다.");
        }

        // 2) 토큰 생성
        String token = UUID.randomUUID().toString();

        // 3) 만료 시간 (예: 30분)
        Date expiredAt = new Date(System.currentTimeMillis() + 1000L * 60 * 30);

        // 4) EMAIL_VERIFICATION 테이블에 INSERT
        Long emailId = emailVerificationMapper.getNextId();

        EmailVerification ev = new EmailVerification();
        ev.setEmailId(emailId);
        ev.setEmail(email);
        ev.setToken(token);
        ev.setStatus("PENDING");
        ev.setPurpose("SIGNUP");
        ev.setRequestedAt(new Date());
        ev.setExpiredAt(expiredAt);
        ev.setCreatedDate(new Date());

        emailVerificationMapper.insert(ev);

        // 5) 인증 링크 생성
        String link = backendUrl + "/api/auth/pre-signup/verify-email?token=" + token;

        // 6) 메일 발송
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("[FarmDay] 이메일 인증을 완료해주세요");
        message.setText(
            "안녕하세요, FarmDay 입니다.\n\n" +
            "회원가입을 진행하시려면 아래 링크를 클릭하여 이메일 인증을 완료해주세요.\n\n" +
            link + "\n\n" +
            "해당 링크는 30분 동안만 유효합니다."
        );

        mailSender.send(message);
    }

    @Override
    public EmailVerification completePreSignupEmailVerification(String token) {
        EmailVerification ev = emailVerificationMapper.findByToken(token);

        if (ev == null) {
            throw new IllegalArgumentException("유효하지 않은 인증 링크입니다.");
        }

        Date now = new Date();

        if (ev.getExpiredAt() != null && ev.getExpiredAt().before(now)) {
            throw new IllegalStateException("인증 링크가 만료되었습니다.");
        }

        if (!"PENDING".equals(ev.getStatus())) {
            throw new IllegalStateException("이미 처리된 인증 링크입니다.");
        }

        // VERIFIED 상태로 변경
        emailVerificationMapper.markVerified(ev.getEmailId());
        ev.setStatus("VERIFIED");
        ev.setVerifiedAt(now);

        return ev;
    }

}