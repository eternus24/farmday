// src/pages/login/PasswordResetRequest.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      await fetch(`${API_BASE_URL}/api/auth/password/reset-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // 계정 존재 여부와 상관없이 "보냈습니다"라고 응답한다고 가정
      setDone(true);
    } catch (err) {
      console.error(err);
      setMessage("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Title>비밀번호 재설정</Title>
        <SubTitle>
          가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </SubTitle>

        {done ? (
          <>
            <MessageText>
              입력하신 이메일로 비밀번호 재설정 안내 메일이 발송되었습니다
              (계정이 존재하는 경우).
            </MessageText>
            <BottomLink onClick={() => navigate("/login")}>
              ← 로그인 화면으로 돌아가기
            </BottomLink>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <FormGroup>
              <Label>이메일</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={!email || loading}>
              {loading ? "전송 중..." : "재설정 메일 보내기"}
            </SubmitButton>

            {message && <MessageText>{message}</MessageText>}

            <BottomLink onClick={() => navigate("/login")}>
              ← 로그인 화면으로 돌아가기
            </BottomLink>
          </form>
        )}
      </Card>
    </PageWrapper>
  );
}

/* =============== styled-components (PasswordResetRequest.jsx) =============== */

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

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.6rem;
  font-weight: 700;
  color: #198754;
`;

const SubTitle = styled.p`
  margin: 0 0 16px;
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
  margin-top: 4px;

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
  margin-top: 14px;
  font-size: 0.85rem;
  text-align: center;
  color: #6c757d;
  line-height: 1.5;
`;

const BottomLink = styled.button`
  margin-top: 16px;
  border: none;
  background: none;
  color: #198754;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    text-decoration: underline;
  }
`;
