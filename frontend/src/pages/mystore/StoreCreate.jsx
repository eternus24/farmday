// src/pages/mystore/StoreCreate.jsx
import React, { useContext, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;              // → 192.168.0.20
const IMAGE_UPLOAD_BASE = "http://192.168.0.76:8080";            // → 이미지 서버

// ====================== styled-components ======================

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 16px;
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const PageDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.1fr);
  gap: 32px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const FormCard = styled.div`
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  padding: 24px 24px 28px;
  border: 1px solid #f0f0f0;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const Section = styled.div`
  & + & {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px dashed #eee;
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
`;

const RequiredMark = styled.span`
  color: #ff4d4f;
  font-size: 14px;
  margin-top: -1px;
`;

const HelpText = styled.span`
  font-size: 12px;
  color: #999;
`;

const ReadonlyBox = styled.div`
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #fafafa;
  border: 1px dashed #ddd;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.15);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
  resize: vertical;
  min-height: 90px;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.15);
  }
`;

const CharCount = styled.div`
  font-size: 11px;
  color: #999;
  text-align: right;
  margin-top: 2px;
`;

const FileInput = styled.input`
  font-size: 13px;
`;

const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 6px;
`;

const Select = styled.select`
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 13px;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.15);
  }
`;

const ToggleWrap = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const SecondaryButton = styled.button`
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid #ddd;
  background-color: #fff;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background-color: #fafafa;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  min-width: 140px;

  &:hover {
    opacity: 0.96;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const ErrorText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #ff4d4f;
`;

// ----- Preview -----

const PreviewCardWrap = styled.div`
  position: sticky;
  top: 80px;

  @media (max-width: 960px) {
    position: static;
    margin-top: 16px;
  }
`;

const PreviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const PreviewCard = styled.div`
  background-color: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid #f2f2f2;
`;

const PreviewThumbnail = styled.div`
  width: 100%;
  height: 180px;
  background-color: #f3f3f3;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
      -45deg,
      #f5f5f5,
      #f5f5f5 8px,
      #e9e9e9 8px,
      #e9e9e9 16px
    );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  gap: 4px;
`;

const PreviewBody = styled.div`
  padding: 14px 16px 16px;
`;

const PreviewHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;

  ${({ status }) =>
    status === "OPEN"
      ? `
    background-color: #e8f5e9;
    color: #2e7d32;
  `
      : `
    background-color: #f5f5f5;
    color: #777;
  `}
`;

const ActiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 4px;
  ${({ active }) =>
    active
      ? `background-color: #4caf50;`
      : `background-color: #bbb;`}
`;

const PreviewStoreName = styled.h4`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
`;

const PreviewOwner = styled.div`
  font-size: 11px;
  color: #999;
  margin-bottom: 8px;
`;

const PreviewDescription = styled.p`
  font-size: 13px;
  color: #555;
  min-height: 40px;
  margin-bottom: 12px;
`;

const PreviewFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const GhostButton = styled.button`
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #c8e6c9;
  background-color: #f1faf2;
  color: #2e7d32;
  cursor: default;
`;

// ====================== Component ======================

export default function StoreCreate() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("READY"); // READY | OPEN
  const [isActive, setIsActive] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 auth 구조: { loggedIn, name, photo, userNo, role }
  const ownerUserId = auth?.userId || "";
  const producerId = auth?.producerId || auth?.producer_id || null;
  const userNo = auth?.userNo || null;

  // ================= 이미지 업로드 (192.168.0.76) =================
  async function uploadImageFile(file) {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${IMAGE_UPLOAD_BASE}/api/images/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`이미지 업로드 실패: HTTP ${res.status}`);
    }

    const data = await res.json(); // { url: "https://s3..." }
    return data.url;
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };

  const validate = () => {
    if (!storeName.trim()) {
      setErrorMsg("스토어명을 입력해 주세요.");
      return false;
    }
    if (description.length > 1000) {
      setErrorMsg("스토어 소개는 1000자 이내로 입력해 주세요.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setSubmitting(true);

      // 1) 썸네일 이미지 → 이미지 서버(S3) 업로드
      let thumbnailUrl = null;
      if (thumbnailFile) {
        thumbnailUrl = await uploadImageFile(thumbnailFile);
      }

      // 2) 스토어 생성 JSON payload → 메인 API(192.168.0.20)
      const payload = {
        storeName: storeName.trim(),
        description: description.trim(),
        status,
        isActive: isActive ? "Y" : "N",
        ownerUserId: ownerUserId || null,
        producerId: producerId || null,   // 있으면 백엔드에서 그대로 사용
        userNo,                           // 🔹 백엔드 fallback용
        thumbnailUrl,                     // S3 URL
      };

      const res = await fetch(`${API_BASE}/api/stores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("store create error:", text);
        throw new Error("스토어 생성에 실패했습니다.");
      }

      alert("스토어가 생성되었어요! 이제 상품을 등록해볼까요?");
      navigate("/producer"); // 필요하면 스토어 마이페이지로 변경
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "스토어 생성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTempSave = () => {
    alert(
      "임시 저장 버튼이에요. 필요하면 나중에 localStorage나 별도 API로 진짜 임시 저장 로직을 붙여도 돼요 🙂"
    );
  };

  const previewDesc = description
    ? description.length > 80
      ? description.slice(0, 80) + "..."
      : description
    : "스토어 소개 문구가 여기 표시됩니다.";

  return (
    <PageWrapper>
      <PageTitle>내 스토어 만들기</PageTitle>
      <PageDescription>
        스토어 기본 정보를 먼저 설정해 주세요. 작성한 내용은 나중에 언제든지
        수정할 수 있어요.
      </PageDescription>

      <LayoutGrid>
        {/* 왼쪽: 폼 */}
        <FormCard as="form" onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>기본 정보</SectionTitle>

            <FormRow>
              <LabelRow>
                <Label htmlFor="storeName">스토어명</Label>
                <RequiredMark>*</RequiredMark>
              </LabelRow>
              <Input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="예) 초록이네 유기농 농장"
                maxLength={200}
              />
              <HelpText>
                사이트 곳곳에 표시되는 이름이에요. 브랜드를 잘 나타낼 수 있는
                이름으로 설정해 주세요.
              </HelpText>
            </FormRow>

            <FormRow>
              <LabelRow>
                <Label>연결 계정</Label>
              </LabelRow>
              <ReadonlyBox>
                <div>로그인 아이디: {ownerUserId || "알 수 없음"}</div>
                {producerId && <div>생산자 ID: {producerId}</div>}
                <HelpText>
                  로그인한 생산자 계정 기준으로 스토어가 생성됩니다. 이 정보는
                  수정할 수 없어요.
                </HelpText>
              </ReadonlyBox>
            </FormRow>
          </Section>

          <Section>
            <SectionTitle>스토어 소개</SectionTitle>

            <FormRow>
              <LabelRow>
                <Label htmlFor="description">스토어 소개 문구</Label>
              </LabelRow>
              <TextArea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`예) 강원도 평창에서 자란 제철 채소를 직접 수확해 보내드립니다.\n20년 경력 농부가 농약은 줄이고, 맛과 신선도는 높였습니다.`}
                maxLength={1000}
              />
              <CharCount>{description.length} / 1000자</CharCount>
            </FormRow>
          </Section>

          <Section>
            <SectionTitle>대표 이미지</SectionTitle>

            <FormRow>
              <LabelRow>
                <Label htmlFor="thumbnail">대표 이미지 업로드</Label>
              </LabelRow>
              <FileInput
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              <HelpText>
                1:1 또는 4:3 비율의 이미지를 권장해요. 스토어 목록과 상단 배너에
                사용됩니다.
              </HelpText>
            </FormRow>
          </Section>

          <Section>
            <SectionTitle>운영 설정</SectionTitle>

            <StatusRow>
              <div>
                <HelpText>운영 상태</HelpText>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="READY">준비중</option>
                  <option value="OPEN">오픈</option>
                </Select>
              </div>

              <div>
                <HelpText>공개 설정</HelpText>
                <ToggleWrap>
                  <ToggleInput
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>{isActive ? "스토어 활성화" : "비활성화"}</span>
                </ToggleWrap>
              </div>
            </StatusRow>
          </Section>

          {errorMsg && <ErrorText>{errorMsg}</ErrorText>}

          <ButtonRow>
            <SecondaryButton
              type="button"
              onClick={handleTempSave}
              disabled={submitting}
            >
              임시 저장
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "생성 중..." : "스토어 생성하기"}
            </PrimaryButton>
          </ButtonRow>
        </FormCard>

        {/* 오른쪽: 미리보기 */}
        <PreviewCardWrap>
          <PreviewTitle>스토어 미리보기</PreviewTitle>
          <PreviewCard>
            <PreviewThumbnail>
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="스토어 대표 이미지" />
              ) : (
                <ThumbnailPlaceholder>
                  <span>대표 이미지가 없어요</span>
                  <span>왼쪽에서 이미지를 업로드해 주세요</span>
                </ThumbnailPlaceholder>
              )}
            </PreviewThumbnail>
            <PreviewBody>
              <PreviewHeaderRow>
                <StatusBadge status={status}>
                  <ActiveDot active={isActive} />
                  {status === "OPEN" ? "오픈" : "준비중"}
                </StatusBadge>
              </PreviewHeaderRow>

              <PreviewStoreName>
                {storeName || "스토어 이름을 입력해 주세요"}
              </PreviewStoreName>
              <PreviewOwner>
                {ownerUserId
                  ? `운영 계정: ${ownerUserId}`
                  : "로그인 정보 기준으로 운영 계정이 표시됩니다."}
              </PreviewOwner>

              <PreviewDescription>{previewDesc}</PreviewDescription>

              <PreviewFooter>
                <GhostButton>스토어 메인 보기</GhostButton>
              </PreviewFooter>
            </PreviewBody>
          </PreviewCard>
        </PreviewCardWrap>
      </LayoutGrid>
    </PageWrapper>
  );
}