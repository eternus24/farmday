// src/pages/admin/AdminLogin.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../../contexts/AuthContext";

// 관리자 로그인 초기값
const initialForm = {
  userId: "",
  password: "",
};

export default function AdminLogin() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ password 로 체크해야 함
  const canSubmit = form.userId && form.password;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!canSubmit) {
      setMessage("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: form.userId,
        password: form.password, // ✅ 백엔드 DTO와 동일
      };

      const res = await fetch("http://192.168.0.20:8080/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        // 서버에서 보낸 에러 메시지를 그대로 보여주기
        let msg = "관리자 로그인에 실패했습니다. 아이디/비밀번호를 확인해 주세요.";
        try {
          const text = await res.text();
          if (text) msg = text;
        } catch (err) {console.error(err);}
        setMessage(msg);
        return;
      }

      const data = await res.json();
      // 예상 응답: { accessToken, refreshToken, user: {...} }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      if (data.user) {
        localStorage.setItem("loginUser", JSON.stringify(data.user));
      }

      setAuth((prev) => ({
        ...prev,
        loggedIn: true,
        name: data?.user?.name || data?.user?.userId || "관리자",
        photo: data?.user?.photo || prev.photo || null,
        role: data?.user?.role || "ADMIN",
      }));

      navigate("/admin"); // 관리자 대시보드로 이동
    } catch (err) {
      console.error("[AdminLogin] 로그인 실패:", err);
      setMessage("관리자 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminAuthWrapper>
      <AuthCard>
        <h2>관리자 로그인</h2>
        <p className="subtitle">FarmDay 관리자 전용 페이지입니다.</p>

        <form onSubmit={onSubmit}>
          <label>
            관리자 아이디
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={onChange}
              placeholder="admin 아이디"
              autoComplete="username"
            />
          </label>

          <label>
            비밀번호
            <input
              type="password"
              name="password"
              value={form.password}  // ✅ 여기도 password
              onChange={onChange}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </label>

          {message && <p className="message">{message}</p>}

          <button type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "로그인 중..." : "로그인"}
          </button>

          <div className="footer">
            <span>관리자 계정이 없나요?</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/admin/signup")}
            >
              관리자 회원가입
            </button>
          </div>
        </form>
      </AuthCard>
    </AdminAuthWrapper>
  );
}

// 공통 스타일 (로그인/회원가입 같이 써도 됨)
const AdminAuthWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fb;
`;

const AuthCard = styled.div`
  width: 380px;
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