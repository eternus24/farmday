// src/pages/login/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../../contexts/AuthContext";

// 야채 프사 5개
import defaultAvatar from "../../assets/img/user-default1.png";
import veggie1 from "../../assets/img/user-default2.png";
import veggie2 from "../../assets/img/user-default3.png";
import veggie3 from "../../assets/img/user-default4.png";
import veggie4 from "../../assets/img/user-default5.png";

const VEGGIE_AVATARS = [defaultAvatar, veggie1, veggie2, veggie3, veggie4];

const initialForm = {
  userId: "",
  userPwd: "",
};

export default function Login() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

  const goFindId = () => {
    navigate("/find-id");
  };

  const goFindPassword = () => {
    navigate("/password/reset-request");
  };


  // 🔹 로그인 성공 시 공통 처리
  const handleLoginSuccess = (data) => {
    if (!data || !data.accessToken || !data.refreshToken || !data.user) {
      setMessage("로그인 응답 형식이 올바르지 않습니다.");
      return;
    }

    console.log("로그인 응답 data:", data);
    console.log("userNo 체크:", data?.user?.userNo);
    console.log("role 체크:", data?.user?.role);   // ✅ 추가해서 한번 확인해봐

    // 토큰 저장
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    // 유저 정보 저장 (role 포함)
    localStorage.setItem("loginUser", JSON.stringify(data.user));

    // 프로필 사진 결정
    let finalPhoto = data.user?.photo || null;
    if (!finalPhoto) {
      const idx = Math.floor(Math.random() * VEGGIE_AVATARS.length);
      finalPhoto = VEGGIE_AVATARS[idx];
    }
    localStorage.setItem("loginAvatar", finalPhoto);

    // 🔹 역할 가져오기 (필드명은 백엔드 응답에 맞춰)
    const role =
      data.user?.role ||
      data.user?.roles?.[0] || // 혹시 배열이면 첫 번째
      null;

    // 전역 AuthContext 업데이트
    setAuth({
      loggedIn: true,
      name: data.user?.name || data.user?.userId || "회원",
      photo: finalPhoto,
      userNo: data.user?.userNo,
      role, // ⭐⭐ 여기 추가
    });

    setMessage("로그인 성공!");
    navigate("/");
  };

  const openEmailVerifyPopup = () => {
    window.open(
      "/pre-signup",
      "emailVerifyPopup",
      "width=500,height=600"
    );
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit = form.userId && form.userPwd;

  // 🔹 일반 로그인
  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!canSubmit) {
      setMessage("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          password: form.userPwd,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("일반 로그인 성공:", data);
        handleLoginSuccess(data);
      } else {
        if (res.status === 401) {
          setMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
        } else if (res.status === 403) {
          setMessage("접근이 차단된 계정입니다.");
        } else {
          setMessage("로그인에 실패했습니다. 다시 시도해 주세요.");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("서버와의 통신 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.9 0 7.1 1.6 9.3 3.8l6.9-6.9C35.9 2.9 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l8.1 6.3C12.6 14 17.9 9.5 24 9.5z"/>
      <path fill="#FBBC05" d="M46.5 24c0-1.5-.1-2.5-.4-3.7H24v7.5h12.8c-.5 3-2.1 5.6-4.6 7.4l7.1 5.6C43.5 37.3 46.5 31.2 46.5 24z"/>
      <path fill="#34A853" d="M10.7 28.9c-.5-1.5-.8-3.1-.8-4.9s.3-3.4.8-4.9l-8.1-6.3C1.3 16.4 0 20 0 24s1.3 7.6 3.3 11.1l7.4-6.2z"/>
      <path fill="#4285F4" d="M24 48c6.2 0 11.9-2.1 16.1-5.7l-7.1-5.6c-2 1.3-4.7 2.2-9 2.2-6.1 0-11.4-4.4-13.3-10.4l-7.4 6.2C6.6 42.6 14.6 48 24 48z"/>
    </svg>
  );

  const KakaoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#3C1E1E"
        d="M12 2C6.48 2 2 5.66 2 10.2c0 2.87 1.98 5.38 5 6.8-.2.7-.7 2.4-.8 2.8-.1.3 0 .3.2.2.3-.1 2.5-1.6 3.5-2.3.7.1 1.4.1 2.1.1 5.52 0 10-3.66 10-8.2S17.52 2 12 2z"
      />
    </svg>
  );

  // 🔹 구글 소셜 로그인
  const handleGoogleLogin = () => {
    if (
      !window.google ||
      !window.google.accounts ||
      !window.google.accounts.oauth2
    ) {
      console.error("Google OAuth2 client not loaded.");
      setMessage("구글 로그인 기능을 사용할 수 없습니다. 관리자에게 문의해 주세요.");
      return;
    }

    const google = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "profile email",
      callback: async (response) => {
        try {
          const res = await fetch(
            "http://localhost:8080/api/auth/social/google", // 구글은 로컬에서만 테스트라면 localhost
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken: response.access_token,
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            console.log("구글 소셜 로그인 성공:", data);
            handleLoginSuccess(data);
          } else {
            setMessage("구글 소셜 로그인에 실패했습니다.");
          }
        } catch (err) {
          console.error(err);
          setMessage("구글 소셜 로그인 중 오류가 발생했습니다.");
        }
      },
    });

    google.requestAccessToken();
  };

  // 🔹 카카오 소셜 로그인
  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      console.error("Kakao SDK not loaded.");
      setMessage("카카오 로그인 기능을 사용할 수 없습니다. 관리자에게 문의해 주세요.");
      return;
    }

    // SDK 로드됐는데 init 안 되어 있으면 여기서 초기화
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }

    if (!window.Kakao.Auth) {
      console.error("Kakao Auth not available.");
      setMessage("카카오 로그인 기능을 사용할 수 없습니다. 관리자에게 문의해 주세요.");
      return;
    }

    window.Kakao.Auth.login({
      scope: "profile_nickname profile_image account_email", // 필요한 동의항목
      success: async function (authObj) {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/auth/social/kakao`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken: authObj.access_token,
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            console.log("카카오 소셜 로그인 성공:", data);
            handleLoginSuccess(data);
          } else {
            setMessage("카카오 소셜 로그인에 실패했습니다.");
          }
        } catch (err) {
          console.error(err);
          setMessage("카카오 소셜 로그인 중 오류가 발생했습니다.");
        }
      },
      fail: function (err) {
        console.error(err);
        setMessage("카카오 소셜 로그인에 실패했습니다.");
      },
    });
  };

  return (
    <PageWrapper>
      <Card>
        <HeaderArea>
          <Title>로그인</Title>
          <SubTitle>
            농산물 가격 추이 및 직거래 서비스를 이용하려면 먼저 로그인 해 주세요.
          </SubTitle>
        </HeaderArea>

        <form onSubmit={onSubmit} noValidate>
          <FormGroup>
            <Label>아이디</Label>
            <Input
              type="text"
              name="userId"
              value={form.userId}
              onChange={onChange}
              placeholder="아이디를 입력하세요"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>비밀번호</Label>
            <Input
              type="password"
              name="userPwd"
              value={form.userPwd}
              onChange={onChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "로그인 중..." : "로그인"}
          </SubmitButton>

          {message && <MessageText>{message}</MessageText>}

          <SubLinkArea>
            <div>
              <button type="button" onClick={goFindId}>
                아이디 찾기
              </button>
              <span className="divider">|</span>
              <button type="button" onClick={goFindPassword}>
                비밀번호 재설정
              </button>
            </div>

            <div className="signup">
              아직 회원이 아니신가요?{" "}
              <button type="button" onClick={openEmailVerifyPopup}>
                회원가입
              </button>
            </div>
          </SubLinkArea>

          <SocialLoginArea>
            <SocialButton type="button" onClick={handleGoogleLogin}>
              <GoogleIcon />
              구글 로그인
            </SocialButton>

            <SocialButton type="button" onClick={handleKakaoLogin}>
              <KakaoIcon />
              카카오 로그인
            </SocialButton>
          </SocialLoginArea>
        </form>
      </Card>
    </PageWrapper>
  );
}

/* =============== styled-components =============== */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 85vh;
  display: flex;
  justify-content: center;
  padding: 120px 16px 20px;
  background-color: #fff;
  align-items: flex-start;
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 18px;
  padding: 32px 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
`;

const HeaderArea = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.6rem;
  font-weight: 700;
  color: #198754;
`;

const SubTitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
`;

const Input = styled.input`
  width: 100%;
  border-radius: 999px;
  border: 1px solid #ced4da;
  padding: 9px 14px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.15s;
  background-color: #ffffff;

  &:focus {
    border-color: #81c408;
    box-shadow: 0 0 0 0.15rem rgba(129, 196, 8, 0.25);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  border-radius: 999px;
  padding: 11px 0;
  border: none;
  background-color: #198754;
  color: #ffffff;
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.05s;

  &:hover {
    background-color: #157347;
  }

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    background-color: #adb5bd;
    cursor: not-allowed;
  }
`;

const MessageText = styled.div`
  margin-bottom: 8px;
  font-size: 0.8rem;
  text-align: center;
  color: #6c757d;
`;

const SubLinkArea = styled.div`
  margin-top: 16px;
  font-size: 0.85rem;
  text-align: center;
  color: #6c757d;

  .divider {
    margin: 0 6px;
    color: #adb5bd;
  }

  .signup {
    margin-top: 6px;
  }

  button {
    border: none;
    background: none;
    padding: 0;
    margin-left: 4px;
    color: #198754;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.85rem;
  }

  button:hover {
    text-decoration: underline;
  }
`;

const SocialLoginArea = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const SocialButton = styled.button`
  flex: 1;
  border-radius: 999px;
  padding: 9px 0;
  border: 1px solid #ced4da;
  background-color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover { background-color: #f8f9fa; }
  &:active { transform: scale(0.98); }
`;
