// src/pages/admin/AdminBannerPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import styled from "styled-components";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const IMAGE_UPLOAD_URL = "http://192.168.0.76:8080/api/images/upload";

export default function AdminBannerPage() {
  const { auth } = useContext(AuthContext);

  // accessToken 꺼내기 (프로젝트 상황에 맞게)
  const token =
    auth?.accessToken ||
    auth?.token ||
    localStorage.getItem("accessToken");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null); // null = 신규, 객체 = 수정
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false); // ✅ 모달 열림/닫힘

  const [form, setForm] = useState({
    title: "",
    linkUrl: "",
    isActive: "Y",
    startDate: "",
    endDate: "",
    imageUrl: "",
  });

  // ========================
  // 배너 목록 조회
  // ========================
  const loadBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/banners`, {
        headers: {
        ...authHeaders, // 🔹 토큰 추가
        },
      });
      if (!res.ok) {
        throw new Error(`배너 목록 조회 실패: ${res.status}`);
      }
      const data = await res.json();
      data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setBanners(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "배너 목록 조회 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const activeCount = banners.filter((b) => b.isActive === "Y").length;

  // ✅ 신규 등록 모달 열기
  const openCreateForm = () => {
    setEditingBanner(null);
    setFile(null);
    setForm({
      title: "",
      linkUrl: "",
      isActive: "Y",
      startDate: "",
      endDate: "",
      imageUrl: "",
    });
    setIsFormOpen(true);
  };

  // ✅ 수정 모달 열기
  const openEditForm = (banner) => {
    setEditingBanner(banner);
    setFile(null);
    setForm({
      title: banner.title || "",
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive || "Y",
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
      imageUrl: banner.imageUrl || "",
    });
    setIsFormOpen(true);
  };

  // 모달 닫기
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBanner(null);
    setFile(null);
  };

  const uploadImageIfNeeded = async () => {
    if (!file) {
      return form.imageUrl; // 기존 이미지 유지
    }
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(IMAGE_UPLOAD_URL, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      throw new Error(`이미지 업로드 실패: ${res.status}`);
    }
    const data = await res.json(); // { url: "..." }
    return data.url;
  };

  const handleSave = async () => {
    const willBeActive = form.isActive === "Y";
    const isEditing = !!editingBanner;

    if (willBeActive) {
      let currentActive = activeCount;
      if (isEditing && editingBanner.isActive === "Y") {
        // 원래도 Y였으면 개수 변화 없음
      } else {
        currentActive += 1;
      }
      if (currentActive > 5) {
        alert("활성 배너는 최대 5개까지만 가능합니다.");
        return;
      }
    }

    if (!form.title.trim()) {
      alert("배너 제목을 입력해 주세요.");
      return;
    }
    if (!form.linkUrl.trim()) {
      alert("링크 URL을 입력해 주세요.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const imageUrl = await uploadImageIfNeeded();

      const payload = {
        title: form.title,
        linkUrl: form.linkUrl,
        isActive: form.isActive,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        imageUrl,
      };

      let res;

      const headers = {
        "Content-Type": "application/json",
        ...authHeaders, // 🔹 토큰 추가
      };
    
      if (isEditing) {
        res = await fetch(
          `${API_BASE}/api/admin/banners/${editingBanner.bannerId}`,
          {
            method: "PUT",
            headers,                          // ✅ 여기로 교체
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`${API_BASE}/api/admin/banners`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        throw new Error(`배너 저장 실패: ${res.status}`);
      }

      alert("배너가 저장되었습니다.");
      await loadBanners();
      closeForm(); // ✅ 저장 후 모달 닫기
    } catch (e) {
      console.error(e);
      setError(e.message || "배너 저장 중 오류 발생");
      alert(e.message || "배너 저장 중 오류 발생");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm("정말 이 배너를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/banners/${bannerId}`, {
        method: "DELETE",
        headers: {
            ...authHeaders, // 🔹 토큰 추가
        },

      });
      if (!res.ok) {
        throw new Error(`배너 삭제 실패: ${res.status}`);
      }
      alert("배너가 삭제되었습니다.");
      await loadBanners();
    } catch (e) {
      console.error(e);
      alert(e.message || "배너 삭제 중 오류 발생");
    }
  };

  const moveBanner = async (bannerId, direction) => {
    const idx = banners.findIndex((b) => b.bannerId === bannerId);
    if (idx === -1) return;

    const newList = [...banners];
    if (direction === "UP" && idx > 0) {
      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    } else if (direction === "DOWN" && idx < newList.length - 1) {
      [newList[idx + 1], newList[idx]] = [newList[idx], newList[idx + 1]];
    } else {
      return;
    }

    const reordered = newList.map((b, index) => ({
      ...b,
      displayOrder: index + 1,
    }));
    setBanners(reordered);

    try {
      const bannerIds = reordered.map((b) => b.bannerId);
      const res = await fetch(`${API_BASE}/api/admin/banners/reorder`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders, // 🔹 토큰 추가
        },
        body: JSON.stringify({ bannerIds }),
      });
      if (!res.ok) {
        throw new Error(`배너 순서 저장 실패: ${res.status}`);
      }
    } catch (e) {
      console.error(e);
      alert(e.message || "배너 순서 저장 중 오류 발생");
    }
  };

  return (
  <PageWrapper>
    <ContentInner>
      <PageHeader>
        <div>
          <PageTitle>배너 관리</PageTitle>
          <SubText>
            메인 화면 배너를 최대 <strong>5개</strong>까지 노출할 수 있습니다.
          </SubText>
        </div>

        <HeaderRight>
          <ActiveBadge $danger={activeCount > 5}>
            활성 배너&nbsp;<strong>{activeCount}</strong>/5
          </ActiveBadge>
          <PrimaryButton onClick={openCreateForm} style={{ marginLeft: 12 }}>
            + 신규 배너 등록
          </PrimaryButton>
        </HeaderRight>
      </PageHeader>

      {error && <ErrorBox>에러: {error}</ErrorBox>}

      {/* 배너 목록 */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>배너 목록</SectionTitle>
        </SectionHeader>

        {loading ? (
          <EmptyState>
            <EmptyTitle>불러오는 중...</EmptyTitle>
            <EmptyText>잠시만 기다려 주세요.</EmptyText>
          </EmptyState>
        ) : banners.length === 0 ? (
          <EmptyState>
            <EmptyTitle>등록된 배너가 없습니다.</EmptyTitle>
            <EmptyText>
              우측 상단의 <strong>“신규 배너 등록”</strong> 버튼을 눌러 첫 배너를
              만들어보세요.
            </EmptyText>
          </EmptyState>
        ) : (
          <TableWrapper>
            <StyledTable>
              <thead>
                <tr>
                  <Th>순서</Th>
                  <Th>이미지</Th>
                  <Th>제목</Th>
                  <Th>링크</Th>
                  <Th>노출</Th>
                  <Th>기간</Th>
                  <Th>관리</Th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b, index) => (
                  <Tr key={b.bannerId}>
                    <TdCenter>{b.displayOrder || index + 1}</TdCenter>
                    <TdImage>
                      {b.imageUrl && (
                        <BannerThumb src={b.imageUrl} alt={b.title} />
                      )}
                    </TdImage>
                    <Td>{b.title}</Td>
                    <Td>
                      <LinkCode>{b.linkUrl}</LinkCode>
                    </Td>
                    <TdCenter>
                      <StatusPill $active={b.isActive === "Y"}>
                        {b.isActive === "Y" ? "Y" : "N"}
                      </StatusPill>
                    </TdCenter>
                    <Td>
                      {(b.startDate || "") + (b.endDate ? ` ~ ${b.endDate}` : "")}
                    </Td>
                    <Td>
                      <ActionButtonRow>
                        <SecondaryButton type="button" onClick={() => openEditForm(b)}>
                          수정
                        </SecondaryButton>
                        <DangerButton
                          type="button"
                          onClick={() => handleDelete(b.bannerId)}
                        >
                          삭제
                        </DangerButton>
                      </ActionButtonRow>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </StyledTable>
          </TableWrapper>
        )}
      </SectionCard>
      </ContentInner>

      {/* ✅ 모달: 신규/수정 배너 등록 */}
      {isFormOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingBanner ? "배너 수정" : "신규 배너 등록"}
              </ModalTitle>
              <ModalClose onClick={closeForm}>×</ModalClose>
            </ModalHeader>

            <FormLayout>
              <FormColumn>
                <FormRow>
                  <Label>제목</Label>
                  <TextInput
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="배너 제목을 입력해 주세요"
                  />
                </FormRow>

                <FormRow>
                  <Label>링크 URL</Label>
                  <TextInput
                    name="linkUrl"
                    value={form.linkUrl}
                    onChange={handleChange}
                    placeholder="/shop 또는 https://..."
                  />
                </FormRow>

                <FormRow>
                  <Label>노출 여부</Label>
                  <SelectInput
                    name="isActive"
                    value={form.isActive}
                    onChange={handleChange}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </SelectInput>
                </FormRow>

                <FormRow>
                  <Label>노출 기간</Label>
                  <InlineInputs>
                    <TextInput
                      type="date"
                      name="startDate"
                      value={form.startDate || ""}
                      onChange={handleChange}
                    />
                    <span>~</span>
                    <TextInput
                      type="date"
                      name="endDate"
                      value={form.endDate || ""}
                      onChange={handleChange}
                    />
                  </InlineInputs>
                </FormRow>

                <FormRow>
                  <Label>배너 이미지</Label>
                  <TextInput
                    as="input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {form.imageUrl && !file && (
                    <HintText>현재 등록된 이미지를 유지하는 중입니다.</HintText>
                  )}
                </FormRow>

                <FormActions>
                  <PrimaryButton type="button" onClick={handleSave} disabled={saving}>
                    {saving ? "저장 중..." : "저장"}
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={closeForm}>
                    취소
                  </SecondaryButton>
                </FormActions>
              </FormColumn>

              <PreviewColumn>
                <PreviewTitle>미리보기</PreviewTitle>
                <PreviewBox>
                  {file ? (
                    <PreviewImage src={URL.createObjectURL(file)} alt="preview" />
                  ) : form.imageUrl ? (
                    <PreviewImage src={form.imageUrl} alt="preview" />
                  ) : (
                    <PreviewPlaceholder>
                      이미지를 선택하면 미리보기가 가능합니다.
                    </PreviewPlaceholder>
                  )}
                </PreviewBox>
              </PreviewColumn>
            </FormLayout>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

/* ============================
   styled-components
   ============================ */

const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 32px 40px 40px;
`;
const ContentInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const SubText = styled.p`
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
`;

const SectionCard = styled.section`
  width: 100%;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  padding: 22px 24px 20px;
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const EmptyState = styled.div`
  padding: 40px 24px 36px;
  text-align: center;
  border-radius: 14px;
  border: 1px dashed #d1d5db;
  background: linear-gradient(135deg, #f9fafb 0%, #eff6ff 100%);
  margin-top: 8px;
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const ActiveBadge = styled.div`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  background: ${(props) => (props.$danger ? "#ffe5e5" : "#e6f4ff")};
  color: ${(props) => (props.$danger ? "#c53030" : "#1a73e8")};
  border: 1px solid
    ${(props) => (props.$danger ? "#feb2b2" : "rgba(26, 115, 232, 0.3)")};
`;

const ErrorBox = styled.div`
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #ffe5e5;
  border-radius: 8px;
  color: #c53030;
  font-size: 13px;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
  color: #6b7280;
  font-weight: 600;
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`;

const Td = styled.td`
  padding: 8px 10px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
`;

const TdCenter = styled(Td)`
  text-align: center;
`;

const TdRight = styled(Td)`
  text-align: right;
`;

const TdImage = styled(Td)`
  width: 140px;
`;

const BannerThumb = styled.img`
  width: 120px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
`;

const LinkCode = styled.code`
  font-size: 12px;
  color: #4b5563;
  word-break: break-all;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) => (props.$active ? "#ecfdf3" : "#f3f4f6")};
  color: ${(props) => (props.$active ? "#166534" : "#6b7280")};
  border: 1px solid
    ${(props) => (props.$active ? "#bbf7d0" : "rgba(107, 114, 128, 0.4)")};
`;

const ActionButtonRow = styled.div`
  display: flex;
  gap: 6px;
`;

const BaseButton = styled.button`
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const PrimaryButton = styled(BaseButton)`
  background: #16a34a;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #15803d;
  }
`;

const SecondaryButton = styled(BaseButton)`
  background: #e5e7eb;
  color: #374151;

  &:hover:not(:disabled) {
    background: #d1d5db;
  }
`;

const DangerButton = styled(BaseButton)`
  background: #fee2e2;
  color: #b91c1c;

  &:hover:not(:disabled) {
    background: #fecaca;
  }
`;

const IconButton = styled.button`
  border: none;
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 999px;
  cursor: pointer;
  margin: 0 2px;
  transition: 0.15s ease;

  &:hover:not(:disabled) {
    background: #d1d5db;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

/* 모달 */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`;

const ModalContent = styled.div`
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
  padding: 20px 22px 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const ModalClose = styled.button`
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    color: #111827;
  }
`;

const FormLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  gap: 24px;
  margin-top: 10px;
  overflow-y: auto;
  padding-right: 4px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const FormColumn = styled.div``;

const PreviewColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormRow = styled.div`
  margin-bottom: 14px;
`;

const Label = styled.div`
  font-size: 13px;
  margin-bottom: 4px;
  font-weight: 500;
  color: #4b5563;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 1px rgba(22, 163, 74, 0.15);
  }
`;

const SelectInput = styled.select`
  width: 120px;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 1px rgba(22, 163, 74, 0.15);
  }
`;

const InlineInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-size: 13px;
    color: #6b7280;
  }
`;

const HintText = styled.div`
  margin-top: 4px;
  font-size: 11px;
  color: #9ca3af;
`;

const FormActions = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 8px;
`;

const PreviewTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
`;

const PreviewBox = styled.div`
  border-radius: 10px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  width: 100%;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
`;

const PreviewPlaceholder = styled.div`
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 0 12px;
`;
