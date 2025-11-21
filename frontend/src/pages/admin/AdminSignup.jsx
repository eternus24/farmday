// src/pages/admin/AdminSignup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const initialForm = {
  userId: "",
  userPwd: "",
  userPwdConfirm: "",
  name: "",
  adminCode: "", // 관리자 가입 코드
};

export default function AdminSignup() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit =
    form.userId &&
    form.userPwd &&
    form.userPwdConfirm &&
    form.name &&
    form.adminCode;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!canSubmit) {
      setMessage("필수 항목을 모두 입력해 주세요.");
      return;
    }

    if (form.userPwd !== form.userPwdConfirm) {
      setMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      // ⚠️ 백엔드 URL / 필드명은 실제 구현에 맞게 조정
      const res = await fetch("http://localhost:8080/api/auth/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          password: form.userPwd,
          name: form.name,
          adminCode: form.adminCode,
        }),
      });

      if (!res.ok) {
        // 서버에서 에러 메시지 내려주면 표시
        let msg = "관리자 회원가입에 실패했습니다.";
        try {
          const errBody = await res.json();
          if (errBody && errBody.message) {
            msg = errBody.message;
          }
        } catch (e) {console.error(e);}
        throw new Error(msg);
      }

      // 성공하면 로그인 페이지로
      alert("관리자 회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/admin/login");
    } catch (err) {
      console.error("[AdminSignup] 에러:", err);
      setMessage(err.message || "관리자 회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminAuthWrapper>
      <AuthCard>
        <h2>관리자 회원가입</h2>
        <p className="subtitle">
          관리자 승인용 계정입니다. 발급받은 관리자 코드를 입력해 주세요.
        </p>

        <form onSubmit={onSubmit}>
          <label>
            관리자 아이디
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={onChange}
              placeholder="관리자 아이디"
              autoComplete="off"
            />
          </label>

          <label>
            이름
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="이름"
              autoComplete="off"
            />
          </label>

          <label>
            비밀번호
            <input
              type="password"
              name="userPwd"
              value={form.userPwd}
              onChange={onChange}
              placeholder="비밀번호"
              autoComplete="new-password"
            />
          </label>

          <label>
            비밀번호 확인
            <input
              type="password"
              name="userPwdConfirm"
              value={form.userPwdConfirm}
              onChange={onChange}
              placeholder="비밀번호 확인"
              autoComplete="new-password"
            />
          </label>

          <label>
            관리자 코드
            <input
              type="text"
              name="adminCode"
              value={form.adminCode}
              onChange={onChange}
              placeholder="관리자에게 발급받은 코드"
            />
          </label>

          {message && <p className="message">{message}</p>}

          <button type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "가입 중..." : "관리자 회원가입"}
          </button>

          <div className="footer">
            <span>이미 계정이 있나요?</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/admin/login")}
            >
              관리자 로그인
            </button>
          </div>
        </form>
      </AuthCard>
    </AdminAuthWrapper>
  );
}

// 로그인에서 쓴 스타일 재사용 (같은 파일에 있어도 됨)
const AdminAuthWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fb;
`;

const AuthCard = styled.div`
  width: 400px;
  padding: 32px 28px 24px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);

  h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 13px;
    color: #888;
    margin-bottom: 20px;
    line-height: 1.4;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    gap: 6px;
  }

  input {
    border-radius: 10px;
    border: 1px solid #dde1ee;
    padding: 10px 12px;
    font-size: 14px;
    outline: none;
    transition: border 0.15s ease, box-shadow 0.15s ease;
  }

  input:focus {
    border-color: #4e7eff;
    box-shadow: 0 0 0 1px rgba(78, 126, 255, 0.3);
  }

  .message {
    font-size: 13px;
    color: #e74c3c;
    margin-top: 4px;
  }

  button[type="submit"] {
    margin-top: 6px;
    border: none;
    border-radius: 10px;
    padding: 10px 0;
    font-size: 15px;
    font-weight: 600;
    background: #4e7eff;
    color: #fff;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.05s ease;
  }

  button[type="submit"]:disabled {
    background: #c2c8de;
    cursor: not-allowed;
  }

  button[type="submit"]:not(:disabled):active {
    transform: translateY(1px);
  }

  .footer {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    color: #666;
  }

  .link-btn {
    border: none;
    background: none;
    color: #4e7eff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
  }
`;