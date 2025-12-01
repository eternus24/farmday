// src/pages/login/PasswordResetForm.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PasswordResetForm() {
  const query = useQuery();
  const token = query.get("token");
  const navigate = useNavigate();

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/auth/password/validate?token=${encodeURIComponent(
            token
          )}`
        );
        setValid(res.ok);
      } catch (e) {
        setValid(false);
      } finally {
        setValidating(false);
      }
    };

    if (token) validate();
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!password) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) {
        setDone(true);
      } else {
        setMessage("비밀번호 재설정에 실패했습니다. 링크가 만료되었을 수 있습니다.");
      }
    } catch (err) {
      console.error(err);
      setMessage("요청 처리 중 오류가 발생했습니다.");
    }
  };

  if (!token) {
    return (
      <PageWrapper>
        <Card>
          <MessageText>유효하지 않은 접근입니다.</MessageText>
        </Card>
      </PageWrapper>
    );
  }

  if (validating) {
    return (
      <PageWrapper>
        <Card>
          <MessageText>토큰 확인 중입니다...</MessageText>
        </Card>
      </PageWrapper>
    );
  }

  if (!valid) {
    return (
      <PageWrapper>
        <Card>
          <MessageText>토큰이 유효하지 않거나 만료되었습니다.</MessageText>
          <BottomLink onClick={() => navigate("/password/reset-request")}>
            비밀번호 재설정 다시 요청하기
          </BottomLink>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card>
        <Title>새 비밀번호 설정</Title>
        {done ? (
          <>
            <MessageText>비밀번호가 변경되었습니다. 다시 로그인해 주세요.</MessageText>
            <BottomLink onClick={() => navigate("/login")}>
              ← 로그인 화면으로 이동
            </BottomLink>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <FormGroup>
              <Label>새 비밀번호</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="새 비밀번호"
              />
            </FormGroup>
            <FormGroup>
              <Label>새 비밀번호 확인</Label>
              <Input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="새 비밀번호 확인"
              />
            </FormGroup>
            <SubmitButton type="submit">비밀번호 변경</SubmitButton>
            {message && <MessageText>{message}</MessageText>}
          </form>
        )}
      </Card>
    </PageWrapper>
  );
}

/* =============== styled-components (PasswordResetForm.jsx) =============== */

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
  margin: 0 0 12px;
  font-size: 1.6rem;
  font-weight: 700;
  color: #198754;
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
  margin-top: 12px;
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
