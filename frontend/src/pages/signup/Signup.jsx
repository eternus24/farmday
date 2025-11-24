// Signup.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import DaumPostcode from "react-daum-postcode";

const initialForm = {
  role: "USER", // USER / PRODUCER
  // 공통 유저 정보
  userId: "",
  userPwd: "",
  confirmPwd: "",
  name: "",
  addr: "",
  addrDetail: "",
  phone: "",
  email: "",
  birth: "",
  gender: "",
  agreeAll: false,

  // 생산자 전용 정보
  bizNo: "",
  bizName: "",
  bizAddr: "",
  bizPhone: "",
  bankName: "",
  bankAccountNo: "",
  accountHolder: "",
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 아이디 중복체크 상태
  const [idCheck, setIdCheck] = useState({
    checkedId: "",
    available: false,
    loading: false,
    message: "",
    done: false, // ✅ 버튼 눌러서 서버 응답 받은 뒤에만 true
  });
  const [idModalOpen, setIdModalOpen] = useState(false);

  // 약관 모달
  const [termsOpen, setTermsOpen] = useState(false);
  const [canAgreeTerms, setCanAgreeTerms] = useState(false);

  // 주소 검색 모달
  const [addrModalOpen, setAddrModalOpen] = useState(false);

  // 비밀번호 보기/숨기기
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [bizAddrModalOpen, setBizAddrModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 이메일 인증 링크로만 접근 허용 + 이메일 자동 세팅
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    const tokenParam = params.get("token");

    if (!emailParam || !tokenParam) {
      alert("이메일 인증 링크를 통해서만 회원가입 페이지에 접근할 수 있습니다.");
      navigate("/", { replace: true });
      return;
    }

    setForm((prev) => ({
      ...prev,
      email: emailParam,
    }));

    // 아이디 중복체크 상태 초기화
    setIdCheck({
      checkedId: "",
      available: false,
      loading: false,
      message: "",
      done: false,
    });
  }, [location.search, navigate]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // 아이디가 바뀌면 중복체크 상태 리셋
      if (name === "userId") {
        setIdCheck({
          checkedId: "",
          available: false,
          loading: false,
          message: "",
          done: false,
        });
      }

      return next;
    });
  };

  const changeRole = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
    }));
  };

  // ====== 기본 검증 ======
  const idError =
    form.userId && !/^[a-zA-Z0-9]{6,20}$/.test(form.userId)
      ? "아이디는 영문/숫자 6~20자로 입력해주세요."
      : "";

  const pwdError =
    form.userPwd && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.userPwd)
      ? "비밀번호는 영문+숫자 포함 8자 이상이어야 합니다."
      : "";

  const pwdConfirmError =
    form.confirmPwd && form.userPwd !== form.confirmPwd
      ? "비밀번호가 일치하지 않습니다."
      : "";

  const emailError =
    form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? "이메일 형식을 확인해주세요."
      : "";

  const birthError =
    form.birth && !/^\d{4}-\d{2}-\d{2}$/.test(form.birth)
      ? "생년월일은 YYYY-MM-DD 형식으로 입력해주세요. (예: 1995-03-10)"
      : "";

  // 생산자일 때만 필수로 보는 항목들
  const producerRequiredOk =
    form.role !== "PRODUCER" ||
    (form.bizNo &&
      form.bizName &&
      form.bizAddr &&
      form.bizPhone &&
      form.bankName &&
      form.bankAccountNo &&
      form.accountHolder);

  // 아이디 중복체크가 현재 아이디 기준으로 완료되었는지
  const idCheckedOk =
    !!form.userId &&
    idCheck.done &&
    idCheck.available &&
    idCheck.checkedId === form.userId &&
    !idError;

  const canSubmit =
    form.userId &&
    form.userPwd &&
    form.confirmPwd &&
    form.name &&
    form.email &&
    !idError &&
    !pwdError &&
    !pwdConfirmError &&
    !emailError &&
    !birthError &&
    form.agreeAll &&
    producerRequiredOk &&
    idCheckedOk;

  // 아이디 중복확인
  const handleCheckUserId = async () => {
    if (!form.userId) {
      alert("아이디를 먼저 입력해주세요.");
      return;
    }
    if (idError) {
      alert(idError);
      return;
    }

    setIdModalOpen(true);
    setIdCheck((prev) => ({
      ...prev,
      loading: true,
      message: "아이디를 확인 중입니다...",
      available: false,
      checkedId: "",
      done: false,
    }));

    try {
      const res = await fetch(
        `${API_BASE}/api/auth/check-userid?userId=${encodeURIComponent(
          form.userId
        )}`
      );

      const text = await res.text();

      if (res.ok) {
        setIdCheck({
          loading: false,
          available: true,
          checkedId: form.userId,
          message: text || "사용 가능한 아이디입니다.",
          done: true,
        });
      } else {
        // 예: 409 CONFLICT 등
        setIdCheck({
          loading: false,
          available: false,
          checkedId: form.userId,
          message: text || "이미 사용 중인 아이디입니다.",
          done: true,
        });
      }
    } catch (err) {
      console.error(err);
      setIdCheck({
        loading: false,
        available: false,
        checkedId: "",
        message: "아이디 확인 중 오류가 발생했습니다.",
        done: true,
      });
    }
  };

  // 약관 체크 클릭 시 동작
  const handleAgreeCheckboxClick = () => {
    if (form.agreeAll) {
      // 이미 동의 → 취소
      setForm((prev) => ({ ...prev, agreeAll: false }));
    } else {
      // 아직 미동의 → 약관 모달 열기
      setTermsOpen(true);
      setCanAgreeTerms(false);
    }
  };

  // 모달 안 스크롤 이벤트: 끝까지 내리면 동의 버튼 활성화
  const handleTermsScroll = (e) => {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setCanAgreeTerms(true);
    }
  };

  const handleTermsAgree = () => {
    setForm((prev) => ({ ...prev, agreeAll: true }));
    setTermsOpen(false);
    setCanAgreeTerms(false);
  };

  const handleTermsCancel = () => {
    setTermsOpen(false);
    setCanAgreeTerms(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!canSubmit) {
      setMessage(
        "필수 항목, 약관 동의, 아이디 중복확인 여부를 확인해주세요."
      );
      return;
    }

    setSubmitting(true);
    try {
      let url = "";
      let body = {};

      if (form.role === "USER") {
        const fullAddr = form.addrDetail
          ? `${form.addr} ${form.addrDetail}`
          : form.addr;

        url = `${API_BASE}/api/auth/signup/user`;
        body = {
          userId: form.userId,
          password: form.userPwd,
          name: form.name,
          phone: form.phone,
          email: form.email,
          addr: fullAddr,          // ✅ 합쳐서 보냄
          birth: form.birth,
          gender: form.gender,
        };
      } else {
        const fullAddr = form.addrDetail
          ? `${form.addr} ${form.addrDetail}`
          : form.addr;

        const fullBizAddr = form.bizAddrDetail
          ? `${form.bizAddr} ${form.bizAddrDetail}`
          : form.bizAddr;

        url = `${API_BASE}/api/auth/signup/producer`;
        body = {
          userId: form.userId,
          password: form.userPwd,
          name: form.name,
          phone: form.phone,
          email: form.email,
          addr: fullAddr,           // ✅ 유저 기본 주소
          birth: form.birth,
          gender: form.gender,
          bizNo: form.bizNo,
          bizName: form.bizName,
          bizAddr: fullBizAddr,     // ✅ 사업장 주소 + 상세주소 합친 값
          bizPhone: form.bizPhone,
          bankName: form.bankName,
          bankAccountNo: form.bankAccountNo,
          accountHolder: form.accountHolder,
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      if (res.ok) {
        alert(text || "가입이 완료되었습니다.");
        setMessage("가입이 완료되었습니다. 로그인 후 이용해 주세요.");
        setForm(initialForm);
        setIdCheck({
          checkedId: "",
          available: false,
          loading: false,
          message: "",
          done: false,
        });
        navigate("/login");
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
    <>
      <PageWrapper>
        <Card>
          <HeaderArea>
            <Title>회원가입</Title>
            <SubTitle>
              농산물 가격 추이 및 직거래 서비스를 이용하기 위해 회원가입을 진행해
              주세요.
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
            {/* 공통 유저 정보 영역 */}
            <SectionTitle>기본 정보</SectionTitle>

            {/* 아이디 + 중복확인 버튼 */}
            <FormGroup>
              <Label>
                아이디 <Required>*</Required>
              </Label>
              <IdRow>
                <Input
                  type="text"
                  name="userId"
                  value={form.userId}
                  onChange={onChange}
                  placeholder="영문/숫자 6~20자"
                  $error={!!idError}
                  required
                />
                <IdCheckButton
                  type="button"
                  onClick={handleCheckUserId}
                  disabled={!form.userId || !!idError || idCheck.loading}
                >
                  {idCheck.loading ? "확인 중..." : "중복확인"}
                </IdCheckButton>
              </IdRow>
              {idError && <ErrorText>{idError}</ErrorText>}
              {/* ✅ 중복확인 버튼 눌러서 응답 받은 뒤에만 문구 노출 */}
              {idCheck.done &&
                idCheck.checkedId === form.userId &&
                !idError && (
                  <InfoText $ok={idCheck.available}>
                    {idCheck.message}
                  </InfoText>
                )}
            </FormGroup>

            {/* 비밀번호 */}
            <FormGroup>
              <Label>
                비밀번호 <Required>*</Required>
              </Label>
              <PasswordWrapper>
                <Input
                  type={showPwd ? "text" : "password"}
                  name="userPwd"
                  value={form.userPwd}
                  onChange={onChange}
                  placeholder="영문+숫자 포함 8자 이상"
                  $error={!!pwdError}
                  required
                />
                <EyeIcon onClick={() => setShowPwd((p) => !p)}>
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </EyeIcon>
              </PasswordWrapper>
              {pwdError && <ErrorText>{pwdError}</ErrorText>}
            </FormGroup>

            {/* 비밀번호 확인 */}
            <FormGroup>
              <Label>
                비밀번호 확인 <Required>*</Required>
              </Label>
              <PasswordWrapper>
                <Input
                  type={showConfirmPwd ? "text" : "password"}
                  name="confirmPwd"
                  value={form.confirmPwd}
                  onChange={onChange}
                  placeholder="비밀번호를 한 번 더 입력해주세요"
                  $error={!!pwdConfirmError}
                  required
                />
                <EyeIcon onClick={() => setShowConfirmPwd((p) => !p)}>
                  {showConfirmPwd ? <FaEyeSlash /> : <FaEye />}
                </EyeIcon>
              </PasswordWrapper>
              {pwdConfirmError && <ErrorText>{pwdConfirmError}</ErrorText>}
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
                placeholder="example@farmday.com"
                $error={!!emailError}
                required
                readOnly     // 🔥 이거 추가!
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

            {/* 주소 + 검색 버튼 */}
            <FormGroup>
              <Label>주소</Label>
              <AddressRow>
                <Input
                  type="text"
                  name="addr"
                  value={form.addr}
                  onChange={onChange}
                  placeholder="주소 검색 버튼을 눌러 선택하세요"
                  readOnly
                />
                <AddrSearchButton
                  type="button"
                  onClick={() => setAddrModalOpen(true)}
                >
                  주소 검색
                </AddrSearchButton>
              </AddressRow>

              {/* ✅ 상세주소 입력 */}
              <DetailInput
                type="text"
                name="addrDetail"
                value={form.addrDetail}
                onChange={onChange}
                placeholder="상세 주소 (동/호수 등)을 입력해주세요"
              />
            </FormGroup>

            {/* 생년월일 & 성별 */}
            <Row>
              <Col>
                <FormGroup>
                  <Label>생년월일</Label>
                  <Input
                    type="text"
                    name="birth"
                    value={form.birth}
                    onChange={onChange}
                    placeholder="YYYY-MM-DD (예: 1995-03-10)"
                    $error={!!birthError}
                  />
                  {birthError && <ErrorText>{birthError}</ErrorText>}
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

            {/* 생산자 전용 입력란 */}
            {form.role === "PRODUCER" && (
              <FadeSection>
                <SectionDivider />
                <SectionTitle>생산자 정보</SectionTitle>

                <FormGroup>
                  <Label>
                    사업자 등록번호 <Required>*</Required>
                  </Label>
                  <Input
                    type="text"
                    name="bizNo"
                    value={form.bizNo}
                    onChange={onChange}
                    placeholder="예: 123-45-67890"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    상호명(농가명) <Required>*</Required>
                  </Label>
                  <Input
                    type="text"
                    name="bizName"
                    value={form.bizName}
                    onChange={onChange}
                    placeholder="농장/농가 이름"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>사업장 주소 *</Label>

                  <AddressRow>
                    <Input
                      type="text"
                      name="bizAddr"
                      value={form.bizAddr}
                      placeholder="사업장 주소 검색 버튼을 눌러 선택하세요"
                      readOnly
                    />

                    <AddrSearchButton
                      type="button"
                      onClick={() => setBizAddrModalOpen(true)}
                    >
                      주소 검색
                    </AddrSearchButton>
                  </AddressRow>

                  <DetailInput
                    type="text"
                    name="bizAddrDetail"
                    value={form.bizAddrDetail}
                    onChange={onChange}
                    placeholder="상세 주소 (건물명, 층, 호수 등)"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    사업장 연락처 <Required>*</Required>
                  </Label>
                  <Input
                    type="text"
                    name="bizPhone"
                    value={form.bizPhone}
                    onChange={onChange}
                    placeholder="예: 010-0000-0000"
                  />
                </FormGroup>

                <Row>
                  <Col>
                    <FormGroup>
                      <Label>
                        정산 은행명 <Required>*</Required>
                      </Label>
                      <Input
                        type="text"
                        name="bankName"
                        value={form.bankName}
                        onChange={onChange}
                        placeholder="예: 농협"
                      />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Label>
                        계좌번호 <Required>*</Required>
                      </Label>
                      <Input
                        type="text"
                        name="bankAccountNo"
                        value={form.bankAccountNo}
                        onChange={onChange}
                        placeholder="'-' 없이 숫자만"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label>
                    예금주명 <Required>*</Required>
                  </Label>
                  <Input
                    type="text"
                    name="accountHolder"
                    value={form.accountHolder}
                    onChange={onChange}
                    placeholder="실제 예금주 이름"
                  />
                </FormGroup>
              </FadeSection>
            )}

            {/* 약관 동의 */}
            <AgreeBox>
              <AgreeRow>
                <Checkbox
                  type="checkbox"
                  id="agreeAll"
                  name="agreeAll"
                  checked={form.agreeAll}
                  onChange={handleAgreeCheckboxClick}
                />
                <CheckboxLabel htmlFor="agreeAll">
                  (필수) 이용약관 및 개인정보 수집·이용에 동의합니다.
                </CheckboxLabel>
                <TermsLink
                  type="button"
                  onClick={() => {
                    if (!form.agreeAll) {
                      setTermsOpen(true);
                    }
                  }}
                >
                  약관 자세히 보기
                </TermsLink>
              </AgreeRow>
              <AgreeDesc>
                서비스 제공을 위해 필요한 최소한의 개인정보만을 수집하며, 동의 후에도
                마이페이지에서 언제든지 변경할 수 있습니다.
              </AgreeDesc>
            </AgreeBox>

            {message && <MessageText>{message}</MessageText>}

            <SubmitButton type="submit" disabled={!canSubmit || submitting}>
              {submitting
                ? form.role === "PRODUCER"
                  ? "생산자 가입 신청 중..."
                  : "가입 처리 중..."
                : form.role === "PRODUCER"
                ? "생산자 가입 신청"
                : "회원가입"}
            </SubmitButton>
          </form>
        </Card>
      </PageWrapper>

      {/* 아이디 중복확인 모달 */}
      {idModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>아이디 중복확인</ModalTitle>
            <ModalBody>
              {idCheck.loading
                ? "아이디를 확인 중입니다..."
                : idCheck.message || "아이디 확인 결과를 불러오지 못했습니다."}
            </ModalBody>
            <ModalFooterRight>
              <ModalCloseButton onClick={() => setIdModalOpen(false)}>
                닫기
              </ModalCloseButton>
            </ModalFooterRight>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 주소 검색 모달 */}
      {addrModalOpen && (
        <ModalOverlay>
          <AddrModalContent>
            <ModalTitle>주소 검색</ModalTitle>
            <DaumPostcode
              onComplete={(data) => {
                const addr = data.roadAddress || data.jibunAddress;
                setForm((prev) => ({ ...prev, addr }));
                setAddrModalOpen(false);
              }}
              style={{ width: "100%", height: "400px" }}
            />
            <ModalFooterRight>
              <SubButton type="button" onClick={() => setAddrModalOpen(false)}>
                닫기
              </SubButton>
            </ModalFooterRight>
          </AddrModalContent>
        </ModalOverlay>
      )}

      {/* 약관 모달 */}
      {termsOpen && (
        <ModalOverlay>
          <TermsModalContent>
            <ModalTitle>이용약관 및 개인정보 처리방침</ModalTitle>
            <TermsScrollArea onScroll={handleTermsScroll}>
              {/* 약관 내용은 필요하면 나중에 실제 문구로 교체 */}
              <TermsParagraph>
                제1조(목적) 본 약관은 FarmDay(이하 "서비스")가 제공하는 농산물 가격
                정보 및 직거래 중개 서비스의 이용과 관련하여, 서비스와 이용자 간의
                권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </TermsParagraph>
              <TermsParagraph>
                제2조(정의) ① "이용자"란 본 약관에 따라 서비스가 제공하는 기능을
                이용하는 회원 및 비회원을 의미합니다. ② "회원"이란 서비스에 회원
                가입을 완료하고 아이디(ID)를 부여받은 자를 말하며, 일반 회원과
                생산자(농가) 회원으로 구분됩니다. ③ "생산자 회원"이란 농산물을
                직접 생산하거나 유통하는 주체로서, 본 서비스를 통해 상품을 등록하고
                판매를 진행하는 자를 말합니다.
              </TermsParagraph>
              <TermsParagraph>
                제3조(약관의 효력 및 변경) ① 본 약관은 서비스를 이용하고자 하는 모든
                이용자에게 그 효력이 발생합니다. ② 서비스는 관련 법령을 위배하지 않는
                범위 내에서 약관을 개정할 수 있으며, 변경된 약관은 서비스 화면에
                공지함으로써 효력이 발생합니다. ③ 이용자는 변경된 약관에 동의하지
                않을 권리가 있으며, 이 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할
                수 있습니다.
              </TermsParagraph>
              <TermsParagraph>
                제4조(개인정보의 수집 및 이용) ① 서비스는 회원가입, 본인 확인,
                거래 이행, 고객 상담 등을 위해 필요한 최소한의 개인정보를 수집합니다.
                ② 서비스는 수집된 개인정보를 관련 법령 및 개인정보 처리방침에서
                정한 범위 내에서만 이용하며, 이용자의 사전 동의 없이는 그 범위를
                초과하여 이용하거나 제3자에게 제공하지 않습니다.
              </TermsParagraph>
              <TermsParagraph>
                제5조(개인정보의 보유 및 파기) ① 서비스는 관련 법령에서 정한 기간
                동안 개인정보를 보관하며, 보유 기간이 경과하거나 처리 목적이 달성된
                경우 지체 없이 안전한 방법으로 파기합니다. ② 이용자는 언제든지
                개인정보 열람·정정·삭제·처리를 정지할 것을 요청할 수 있으며, 서비스는
                관련 법령이 허용하는 범위 내에서 지체 없이 필요한 조치를 취합니다.
              </TermsParagraph>
              <TermsParagraph>
                제6조(이용자의 의무) ① 이용자는 자신의 아이디 및 비밀번호를
                철저히 관리해야 하며, 이를 제3자에게 양도·대여하거나 사용을
                허락해서는 안 됩니다. ② 이용자는 서비스 이용과 관련하여 관계 법령,
                본 약관, 서비스가 공지하는 이용 안내 및 주의 사항을 준수해야 합니다.
              </TermsParagraph>
              <TermsParagraph>
                제7조(서비스의 제공 및 변경) ① 서비스는 농산물 가격 정보 조회,
                가격 비교, 직거래 등록 및 관리, 공동구매, 알림 서비스 등 다양한 기능을
                제공할 수 있습니다. ② 서비스는 기술적 필요, 운영 정책, 법령 변경 등에
                따라 제공 중인 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우
                사전에 그 내용을 공지합니다.
              </TermsParagraph>
              <TermsParagraph>
                제8조(책임 제한) ① 서비스는 생산자 회원이 등록한 상품 정보의
                정확성·진실성·적법성에 대해 보증하지 않으며, 거래 당사자 간에
                발생하는 분쟁에 대해 원칙적으로 개입하지 않습니다. ② 다만, 서비스는
                이용자 보호를 위해 관련 법령이 허용하는 범위 내에서 필요한 조치를
                취할 수 있습니다.
              </TermsParagraph>
              <TermsParagraph>
                제9조(문의처) 서비스 이용 중 궁금한 점이나 불편 사항이 있을 경우
                고객센터 또는 1:1 문의를 통해 연락하시면, 최대한 신속하게 답변
                드리겠습니다.
              </TermsParagraph>
              <TermsParagraph>
                위 약관 및 개인정보 처리방침을 충분히 읽고 이해하였으며, 이에
                동의합니다.
              </TermsParagraph>
            </TermsScrollArea>
            <TermsHint>
              약관을 끝까지 스크롤하면{" "}
              <strong>동의하기 버튼이 활성화</strong>됩니다.
            </TermsHint>
            <ModalFooterBetween>
              <SubButton type="button" onClick={handleTermsCancel}>
                취소
              </SubButton>
              <PrimaryButton
                type="button"
                disabled={!canAgreeTerms}
                onClick={handleTermsAgree}
              >
                동의합니다
              </PrimaryButton>
            </ModalFooterBetween>
          </TermsModalContent>
        </ModalOverlay>
      )}
      {bizAddrModalOpen && (
        <ModalOverlay>
          <AddrModalContent>
            <ModalTitle>사업장 주소 검색</ModalTitle>

            <DaumPostcode
              onComplete={(data) => {
                const addr = data.roadAddress || data.jibunAddress;
                setForm((prev) => ({ ...prev, bizAddr: addr }));
                setBizAddrModalOpen(false);
              }}
              style={{ width: "100%", height: "400px" }}
            />

            <ModalFooterRight>
              <SubButton type="button" onClick={() => setBizAddrModalOpen(false)}>
                닫기
              </SubButton>
            </ModalFooterRight>
          </AddrModalContent>
        </ModalOverlay>
      )}
    </>
  );
}

/* ================= styled-components ================= */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
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
  color: #198754;
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

const SectionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 12px 0 8px;
  color: #198754;
`;

const SectionDivider = styled.hr`
  border: 0;
  border-top: 1px solid #e9ecef;
  margin: 20px 0 10px;
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
  &[readOnly] {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
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

const InfoText = styled.div`
  margin-top: 4px;
  font-size: 0.8rem;
  color: ${({ $ok }) => ($ok ? "#198754" : "#dc3545")};
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
  flex-wrap: wrap;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.85rem;
  color: #495057;
  cursor: pointer;
`;

const TermsLink = styled.button`
  border: none;
  background: none;
  padding: 0;
  margin-left: auto;
  font-size: 0.8rem;
  color: #198754;
  text-decoration: underline;
  cursor: pointer;
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

/* 아이디 입력줄 + 버튼 */
const IdRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  & > input {
    flex: 1;
  }
`;

const IdCheckButton = styled.button`
  flex-shrink: 0;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid #198754;
  background-color: #ffffff;
  color: #198754;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: #198754;
    color: #ffffff;
  }

  &:disabled {
    border-color: #adb5bd;
    color: #adb5bd;
    background-color: #f1f3f5;
    cursor: not-allowed;
  }
`;

const PasswordToggleButton = styled.button`
  flex-shrink: 0;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid #ced4da;
  background-color: #ffffff;
  color: #495057;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    background-color: #f1f3f5;
  }
`;

/* 주소 + 검색 버튼 */
const AddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  & > input {
    flex: 1;
  }
`;

const AddrSearchButton = styled.button`
  flex-shrink: 0;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid #198754;
  background-color: #ffffff;
  color: #198754;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: #198754;
    color: #ffffff;
  }
`;

/* 공통 모달 오버레이 */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

/* 아이디 중복 모달 */
const ModalContent = styled.div`
  width: 100%;
  max-width: 360px;
  background-color: #ffffff;
  border-radius: 18px;
  padding: 20px 22px 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
`;

const ModalTitle = styled.h4`
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #198754;
`;

const ModalBody = styled.div`
  font-size: 0.9rem;
  color: #495057;
  margin-bottom: 16px;
`;

const ModalFooterRight = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ModalCloseButton = styled.button`
  padding: 7px 14px;
  border-radius: 999px;
  border: none;
  background-color: #198754;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #157347;
  }
`;

/* 약관 모달 전용 */
const TermsModalContent = styled.div`
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  background-color: #ffffff;
  border-radius: 18px;
  padding: 20px 22px 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
`;

const TermsScrollArea = styled.div`
  flex: 1;
  padding: 10px 4px 10px 0;
  margin-top: 6px;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  overflow-y: auto;
`;

const TermsParagraph = styled.p`
  font-size: 0.85rem;
  color: #495057;
  line-height: 1.5;
  margin: 0 0 10px;
`;

const TermsHint = styled.div`
  font-size: 0.75rem;
  color: #868e96;
  margin: 8px 0 6px;
`;

const ModalFooterBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PrimaryButton = styled.button`
  padding: 7px 16px;
  border-radius: 999px;
  border: none;
  background-color: ${({ disabled }) => (disabled ? "#adb5bd" : "#198754")};
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#adb5bd" : "#157347")};
  }
`;

const SubButton = styled.button`
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid #ced4da;
  background-color: #ffffff;
  color: #495057;
  font-size: 0.83rem;
  cursor: pointer;

  &:hover {
    background-color: #f1f3f5;
  }
`;

/* 주소 모달 전용 */
const AddrModalContent = styled.div`
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  background-color: #ffffff;
  border-radius: 18px;
  padding: 20px 22px 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
`;

/* 생산자 섹션 페이드 인 */
const FadeSection = styled.div`
  animation: fadeInUp 0.25s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;

  input {
    width: 100%;
    border-radius: 999px;
    padding-right: 40px; /* 아이콘 자리 확보 */
  }
`;

const EyeIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #868e96;
  font-size: 1rem;

  &:hover {
    color: #198754;
  }
`;

const DetailInput = styled(Input)`
  margin-top: 8px;
`;