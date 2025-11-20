// src/pages/signup/PreSignupEmail.jsx
import { useState } from "react";
import styled from "styled-components";

const initialState = {
  email: "",
};

export default function PreSignupEmail() {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState({ text: "", error: false });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit = form.email && form.email.includes("@");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!canSubmit) {
      setMessage("올바른 이메일 주소를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://192.168.0.20:8080/api/auth/pre-signup/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      if (res.ok) {
        setMessage({
            text: "입력하신 이메일로 인증 링크를 보냈습니다. 메일함에서 인증 링크를 클릭하면 회원가입 화면으로 이동합니다.",
            error: false
        });
      } else {
        if (res.status === 409) {
          setMessage({ text: "이미 사용중인 이메일입니다.", error: true });
        } else {
          setMessage({ text: "이메일 인증 메일 발송 중 오류가 발생했습니다.", error: true });
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <HeaderArea>
          <Title>이메일 인증</Title>
          <SubTitle>
            회원가입을 위해 먼저 이메일 인증을 진행합니다. <br />
            아래에 본인의 이메일 주소를 입력해 주세요.
          </SubTitle>
        </HeaderArea>

        <form onSubmit={onSubmit} noValidate>
          <FormGroup>
            <Label>이메일</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="example@example.com"
              required
            />
          </FormGroup>

          {message.text && (
            <MessageText error={message.error}>{message.text}</MessageText>
          )}

          <SubmitButton type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "발송 중..." : "인증 메일 보내기"}
          </SubmitButton>
        </form>
      </Card>
    </PageWrapper>
  );
}

// 스타일은 Login.jsx랑 비슷하게 맞췄어
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
  margin-bottom: 12px;
  font-size: 0.8rem;
  text-align: center;
  color: ${(props) => (props.error ? "#dc3545" : "#198754")}; 
  /* 빨강: 오류 / 초록: 성공 */
`;