// src/pages/login/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";   // ✅ 추가
import styled from "styled-components";

const initialForm = {
  userId: "",
  userPwd: "",
};

export default function Login() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();                // ✅ 추가

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

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!canSubmit) {
      setMessage("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          password: form.userPwd,
        }),
      });

      if (res.ok) {
        // ✅ 백엔드가 보내주는 User JSON 받기
        const user = await res.json();
        console.log("로그인 성공 user:", user);

        // ✅ 브라우저에 로그인 정보 저장 (간단 버전)
        localStorage.setItem("loginUser", JSON.stringify(user));

        // ✅ 메인 페이지로 이동
        navigate("/");

        // 원하면 상태값/메시지도 정리
        setMessage("로그인 성공!");
      } else {
        setMessage("로그인에 실패했습니다. 아이디/비밀번호를 확인해 주세요.");
      }
    } catch (err) {
      console.error(err);
      setMessage("서버와의 통신 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
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
            아직 회원이 아니신가요?{" "}
            <button onClick={openEmailVerifyPopup}>회원가입</button>
          </SubLinkArea>
        </form>
      </Card>
    </PageWrapper>
  );
}

/* =============== styled-components (Signup이랑 톤 맞춤) =============== */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 60vh;
  display: flex;
  justify-content: center;
  padding: 120px 16px 20px;
  background-color: #fff;
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

  a {
    color: #198754;
    font-weight: 600;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;
