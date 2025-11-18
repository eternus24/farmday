import { useState } from "react";
import styled from "styled-components";

const initialForm = {
  role: "USER",
  userId: "",
  userPwd: "",
  name: "",
  addr: "",
  phone: "",
  email: "",
  birth: "",
  gender: "",       // ✅ 처음엔 아무것도 선택 안 된 상태
  agreeAll: false,
};

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const changeRole = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  // 간단한 대기업 느낌(?) 검증
  const idError =
    form.userId && !/^[a-zA-Z0-9]{6,20}$/.test(form.userId)
      ? "아이디는 영문/숫자 6~20자로 입력해주세요."
      : "";

  const pwdError =
    form.userPwd && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.userPwd)
      ? "비밀번호는 영문+숫자 포함 8자 이상이어야 합니다."
      : "";

  const emailError =
    form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? "이메일 형식을 확인해주세요."
      : "";

  const canSubmit =
    form.userId &&
    form.userPwd &&
    form.name &&
    form.email &&
    !idError &&
    !pwdError &&
    !emailError &&
    form.agreeAll;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!canSubmit) {
      setMessage("필수 항목과 약관 동의를 확인해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          userId: form.userId,
          userPwd: form.userPwd,
          name: form.name,
          addr: form.addr,
          phone: form.phone,
          email: form.email,
          birth: form.birth,
          gender: form.gender,
        }),
      });

      const text = await res.text();
      if (res.ok) {
        alert(text);
        setMessage("가입이 완료되었습니다. 이메일을 확인해 주세요.");
        setForm(initialForm);
      } else {
        alert(text);
        setMessage(text);
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
          <Title>회원가입</Title>
          <SubTitle>
            농산물 가격 추이 및 직거래 서비스를 이용하기 위해 회원가입을 진행해 주세요.
          </SubTitle>
        </HeaderArea>

        {/* 역할 선택 */}
        <RoleToggle>
          <RoleButton
            type="button"
            $active={form.role === "USER"}
            onClick={() => changeRole("USER")}
          >
            일반 회원
          </RoleButton>
          <RoleButton
            type="button"
            $active={form.role === "PRODUCER"}
            onClick={() => changeRole("PRODUCER")}
          >
            생산자 회원
          </RoleButton>
        </RoleToggle>
        <RoleDesc>
          생산자 회원은 추후 농가 정보/정산 계좌 정보를 추가로 등록하게 됩니다.
        </RoleDesc>

        <form onSubmit={onSubmit} noValidate>
          {/* 아이디 */}
          <FormGroup>
            <Label>
              아이디 <Required>*</Required>
            </Label>
            <Input
              type="text"
              name="userId"
              value={form.userId}
              onChange={onChange}
              placeholder="영문/숫자 6~20자"
              $error={!!idError}
              required
            />
            {idError && <ErrorText>{idError}</ErrorText>}
          </FormGroup>

          {/* 비밀번호 */}
          <FormGroup>
            <Label>
              비밀번호 <Required>*</Required>
            </Label>
            <Input
              type="password"
              name="userPwd"
              value={form.userPwd}
              onChange={onChange}
              placeholder="영문+숫자 포함 8자 이상"
              $error={!!pwdError}
              required
            />
            {pwdError && <ErrorText>{pwdError}</ErrorText>}
          </FormGroup>

          {/* 이름 */}
          <FormGroup>
            <Label>
              이름 <Required>*</Required>
            </Label>
            <Input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          </FormGroup>

          {/* 이메일 */}
          <FormGroup>
            <Label>
              이메일 <Required>*</Required>
            </Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="example@farmday.com"
              $error={!!emailError}
              required
            />
            {emailError && <ErrorText>{emailError}</ErrorText>}
          </FormGroup>

          {/* 휴대폰 */}
          <FormGroup>
            <Label>휴대폰 번호</Label>
            <Input
              type="text"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="010-0000-0000"
            />
          </FormGroup>

          {/* 주소 */}
          <FormGroup>
            <Label>주소</Label>
            <Input
              type="text"
              name="addr"
              value={form.addr}
              onChange={onChange}
              placeholder="주소를 입력하세요"
            />
          </FormGroup>

          {/* 생년월일 & 성별 */}
          <Row>
            <Col>
              <FormGroup>
                <Label>생년월일</Label>
                <Input
                  type="date"
                  name="birth"
                  value={form.birth}
                  onChange={onChange}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label>성별</Label>
                <RadioGroup>
  <RadioLabel>
    <RadioInput
      type="radio"
      name="gender"
      value="M"
      checked={form.gender === "M"}
      onChange={onChange}
    />
    남
  </RadioLabel>
  <RadioLabel>
    <RadioInput
      type="radio"
      name="gender"
      value="F"
      checked={form.gender === "F"}
      onChange={onChange}
    />
    여
  </RadioLabel>
</RadioGroup>
     </FormGroup>
            </Col>
          </Row>

          {/* 약관 동의 */}
          <AgreeBox>
            <AgreeRow>
              <Checkbox
                type="checkbox"
                id="agreeAll"
                name="agreeAll"
                checked={form.agreeAll}
                onChange={onChange}
              />
              <CheckboxLabel htmlFor="agreeAll">
                (필수) 이용약관 및 개인정보 수집·이용에 동의합니다.
              </CheckboxLabel>
            </AgreeRow>
            <AgreeDesc>
              서비스 제공을 위해 필요한 최소한의 개인정보만을 수집하며, 동의 후에도
              마이페이지에서 언제든지 변경할 수 있습니다.
            </AgreeDesc>
          </AgreeBox>

          {message && <MessageText>{message}</MessageText>}

          <SubmitButton type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "가입 처리 중..." : "회원가입"}
          </SubmitButton>
        </form>
      </Card>
    </PageWrapper>
  );
}

/* ================= styled-components ================= */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;              /* 화면 전체 높이 채우기 */
  display: flex;
  justify-content: center;
  padding: 120px 16px 20px;      
  background-color: #fff;
`;

const Card = styled.div`
  width: 100%;
  max-width: 720px;
  background: #ffffff;
  border-radius: 18px;
  padding: 32px 28px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
`;

const HeaderArea = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.6rem;
  font-weight: 700;
  color: #198754; /* 부트스트랩 success 계열과 비슷하게 */
`;

const SubTitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
`;

const RoleToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const RoleButton = styled.button`
  flex: 1;
  border-radius: 999px;
  padding: 10px 0;
  border: 1px solid ${({ $active }) => ($active ? "#198754" : "#ced4da")};
  background-color: ${({ $active }) => ($active ? "#198754" : "#f8f9fa")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#495057")};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $active }) => ($active ? "#157347" : "#e9ecef")};
  }
`;

const RoleDesc = styled.p`
  font-size: 0.8rem;
  color: #868e96;
  margin: 0 0 20px;
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

const Required = styled.span`
  color: #dc3545;
  margin-left: 2px;
`;

const Input = styled.input`
  width: 100%;
  border-radius: 999px;
  border: 1px solid ${({ $error }) => ($error ? "#dc3545" : "#ced4da")};
  padding: 9px 14px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.15s;
  background-color: #ffffff;

  &:focus {
    border-color: ${({ $error }) => ($error ? "#dc3545" : "#81c408")};
    box-shadow: 0 0 0 0.15rem
      ${({ $error }) =>
        $error ? "rgba(220, 53, 69, 0.25)" : "rgba(129, 196, 8, 0.25)"};
  }
`;

const ErrorText = styled.div`
  margin-top: 4px;
  font-size: 0.8rem;
  color: #dc3545;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Col = styled.div`
  flex: 1;
  min-width: 0;
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #495057;
  cursor: pointer;
`;

const RadioInput = styled.input`
  width: 14px;
  height: 14px;
  cursor: pointer;
`;

const AgreeBox = styled.div`
  margin: 20px 0 16px;
  padding-top: 14px;
  border-top: 1px solid #e9ecef;
`;

const AgreeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.85rem;
  color: #495057;
`;

const AgreeDesc = styled.p`
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: #868e96;
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