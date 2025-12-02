// src/pages/admin/AdminNoticePage.jsx
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const IMAGE_UPLOAD_URL = "http://192.168.0.76:8080/api/images/upload";

// ✅ 작성일 예쁘게 포맷 (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return "";
  const normalized = dateString.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return dateString.substring(0, 10);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function AdminNoticePage() {
  const { auth } = useContext(AuthContext);

  const token =
    auth?.accessToken || auth?.token || localStorage.getItem("accessToken");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null); // ✅ 우측 상세 패널용
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null); // null: 신규, 객체: 수정

  const [form, setForm] = useState({
    title: "",
    content: "",
    isActive: "Y",
  });

  // 이미지 리스트: { imageId?, imageUrl, sortOrder, file? , tempId }
  const [images, setImages] = useState([]);

  // ========================
  // 공지 목록 조회
  // ========================
  const loadNotices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/notices`, {
        headers: {
          ...authHeaders,
        },
      });
      if (!res.ok) {
        throw new Error(`공지사항 목록 조회 실패: ${res.status}`);
      }
      const data = await res.json();
      // noticeId 기준 내림차순 정렬
      data.sort((a, b) => (b.noticeId || 0) - (a.noticeId || 0));
      setNotices(data);

      // ✅ 목록 불러오면 첫 번째 공지를 기본 선택
      if (data.length > 0) {
        setSelectedNotice((prev) => {
          // 기존 선택된 공지가 있으면 그대로 유지
          const stillExists = prev && data.find((n) => n.noticeId === prev.noticeId);
          return stillExists || data[0];
        });
      } else {
        setSelectedNotice(null);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "공지사항 목록 조회 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================
  // 공통 인풋 핸들러
  // ========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ========================
  // 모달 열기/닫기
  // ========================
  const openCreateForm = () => {
    setEditingNotice(null);
    setForm({
      title: "",
      content: "",
      isActive: "Y",
    });
    setImages([]);
    setIsFormOpen(true);
  };

  const openEditForm = (notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title || "",
      content: notice.content || "",
      isActive: notice.isActive || "Y",
    });
    const noticeImages = (notice.images || []).slice().sort((a, b) => {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    setImages(
      noticeImages.map((img, index) => ({
        tempId: `exist-${img.imageId}`,
        imageId: img.imageId,
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder || index + 1,
      }))
    );
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingNotice(null);
    setImages([]);
  };

  // ========================
  // 이미지 추가 (multiple)
  // ========================
  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImages((prev) => {
      const nextIndexStart = prev.length;
      const newItems = files.map((file, idx) => ({
        tempId: `new-${Date.now()}-${idx}`,
        file, // 아직 업로드 전
        imageUrl: URL.createObjectURL(file), // 미리보기용
        sortOrder: nextIndexStart + idx + 1,
      }));
      return [...prev, ...newItems];
    });

    // 같은 파일 다시 선택 가능하게 초기화
    e.target.value = "";
  };

  // 이미지 삭제
  const removeImage = (tempId) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.tempId !== tempId);
      // sortOrder 다시 매기기
      return filtered.map((img, index) => ({
        ...img,
        sortOrder: index + 1,
      }));
    });
  };

  // 이미지 순서 변경
  const moveImage = (tempId, direction) => {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.tempId === tempId);
      if (index === -1) return prev;

      const newArr = [...prev];
      if (direction === "UP" && index > 0) {
        [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
      } else if (direction === "DOWN" && index < newArr.length - 1) {
        [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
      } else {
        return prev;
      }

      // sortOrder 새로
      return newArr.map((img, idx) => ({ ...img, sortOrder: idx + 1 }));
    });
  };

  // ========================
  // 이미지 업로드 (새로 추가된 것만)
  // ========================
  const uploadImagesIfNeeded = async () => {
    const updated = [];

    for (const img of images) {
      // 이미 서버 URL이 있고 file 없으면 그대로 사용
      if (!img.file) {
        updated.push(img);
        continue;
      }

      const fd = new FormData();
      fd.append("file", img.file);

      const res = await fetch(IMAGE_UPLOAD_URL, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error(`이미지 업로드 실패: ${res.status}`);
      }

      const data = await res.json(); // { url: "..." } 가정
      updated.push({
        ...img,
        file: undefined,
        imageUrl: data.url,
      });
    }

    // sortOrder 재정렬
    return updated
      .slice()
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((img, idx) => ({
        ...img,
        sortOrder: idx + 1,
      }));
  };

  // ========================
  // 저장 (등록/수정 공통)
  // ========================
  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("공지 제목을 입력해 주세요.");
      return;
    }
    if (!form.content.trim()) {
      if (!window.confirm("내용이 비어 있습니다. 그래도 저장할까요?")) {
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const uploadedImages = await uploadImagesIfNeeded();

      const payload = {
        title: form.title,
        content: form.content,
        isActive: form.isActive,
        images: uploadedImages.map((img) => ({
          imageId: img.imageId || null,
          imageUrl: img.imageUrl,
          sortOrder: img.sortOrder,
        })),
      };

      const headers = {
        "Content-Type": "application/json",
        ...authHeaders,
      };

      let res;
      if (editingNotice) {
        // 수정
        res = await fetch(
          `${API_BASE}/api/admin/notices/${editingNotice.noticeId}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
          }
        );
      } else {
        // 신규
        res = await fetch(`${API_BASE}/api/admin/notices`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        throw new Error(`공지 저장 실패: ${res.status}`);
      }

      alert("공지사항이 저장되었습니다.");
      await loadNotices();
      closeForm();
    } catch (e) {
      console.error(e);
      setError(e.message || "공지 저장 중 오류 발생");
      alert(e.message || "공지 저장 중 오류 발생");
    } finally {
      setSaving(false);
    }
  };

  // ========================
  // 삭제
  // ========================
  const handleDelete = async (noticeId) => {
    if (!window.confirm("정말 이 공지사항을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/notices/${noticeId}`, {
        method: "DELETE",
        headers: {
          ...authHeaders,
        },
      });

      if (!res.ok) {
        throw new Error(`공지 삭제 실패: ${res.status}`);
      }

      alert("공지사항이 삭제되었습니다.");
      await loadNotices();

      // ✅ 선택되어 있던 공지를 지우면 상세 패널도 정리
      setSelectedNotice((prev) =>
        prev && prev.noticeId === noticeId ? null : prev
      );
    } catch (e) {
      console.error(e);
      alert(e.message || "공지 삭제 중 오류 발생");
    }
  };

  return (
    <PageWrapper>
      <ContentInner>
        <PageHeader>
          <div>
            <PageTitle>공지사항 관리</PageTitle>
            <SubText>관리자 공지사항을 등록·수정·삭제할 수 있습니다.</SubText>
          </div>
          <HeaderRight>
            <PrimaryButton type="button" onClick={openCreateForm}>
              + 신규 공지 등록
            </PrimaryButton>
          </HeaderRight>
        </PageHeader>

        {error && <ErrorBox>에러: {error}</ErrorBox>}

        <SectionCard>
          <SectionHeader>
            <SectionTitle>공지사항 목록</SectionTitle>
          </SectionHeader>

          <SectionBody>
            {/* ======================
                왼쪽: 목록 영역
               ====================== */}
            <ListPane>
              {loading ? (
                <EmptyState>
                  <EmptyTitle>불러오는 중...</EmptyTitle>
                  <EmptyText>잠시만 기다려 주세요.</EmptyText>
                </EmptyState>
              ) : notices.length === 0 ? (
                <EmptyState>
                  <EmptyTitle>등록된 공지사항이 없습니다.</EmptyTitle>
                  <EmptyText>
                    우측 상단의 <strong>“신규 공지 등록”</strong> 버튼을 눌러 첫
                    공지를 만들어보세요.
                  </EmptyText>
                </EmptyState>
              ) : (
                <TableWrapper>
                  <StyledTable>
                    <thead>
                      <tr>
                        <Th style={{ width: "60px" }}>번호</Th>
                        <Th>제목</Th>
                        <Th style={{ width: "70px" }}>노출</Th>
                        <Th style={{ width: "80px" }}>조회수</Th>
                        <Th style={{ width: "110px" }}>작성일</Th>
                        <Th style={{ width: "80px" }}>이미지</Th>
                        <Th style={{ width: "140px" }}>관리</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {notices.map((n, index) => {
                        const isSelected =
                          selectedNotice && selectedNotice.noticeId === n.noticeId;
                        return (
                          <Tr
                            key={n.noticeId}
                            $selected={isSelected}
                            onClick={() => setSelectedNotice(n)} // ✅ 행 클릭하면 상세 패널에 표시
                          >
                            <TdCenter>{n.noticeId || index + 1}</TdCenter>
                            <Td>
                              <NoticeTitleCell>
                                {n.isActive === "Y" && (
                                  <ActiveDot title="노출 중" />
                                )}
                                <span>{n.title}</span>
                              </NoticeTitleCell>
                            </Td>
                            <TdCenter>
                              <StatusPill $active={n.isActive === "Y"}>
                                {n.isActive === "Y" ? "Y" : "N"}
                              </StatusPill>
                            </TdCenter>
                            <TdCenter>{n.viewCount || 0}</TdCenter>
                            <TdCenter>
                              {formatDate(n.createdDate || n.createdAt)}
                            </TdCenter>
                            <TdCenter>
                              {(n.images && n.images.length) || 0}개
                            </TdCenter>
                            <Td>
                              <ActionButtonRow
                                onClick={(e) => e.stopPropagation()} // ✅ 행 선택과 분리
                              >
                                <SecondaryButton
                                  type="button"
                                  onClick={() => openEditForm(n)}
                                >
                                  수정
                                </SecondaryButton>
                                <DangerButton
                                  type="button"
                                  onClick={() => handleDelete(n.noticeId)}
                                >
                                  삭제
                                </DangerButton>
                              </ActionButtonRow>
                            </Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </StyledTable>
                </TableWrapper>
              )}
            </ListPane>

            {/* ======================
                오른쪽: 상세 영역
               ====================== */}
            <DetailPane>
              {selectedNotice ? (
                <>
                  <DetailHeader>
                    <DetailTitle>{selectedNotice.title}</DetailTitle>
                    <DetailTagRow>
                      <StatusPill $active={selectedNotice.isActive === "Y"}>
                        {selectedNotice.isActive === "Y" ? "노출 Y" : "노출 N"}
                      </StatusPill>
                    </DetailTagRow>
                  </DetailHeader>

                  <DetailMetaRow>
                    <span>
                      작성일{" "}
                      {formatDate(
                        selectedNotice.createdDate || selectedNotice.createdAt
                      )}
                    </span>
                    <span>조회수 {selectedNotice.viewCount || 0}회</span>
                  </DetailMetaRow>

                  <DetailContentBox>
                    {selectedNotice.content
                      ? selectedNotice.content
                      : "등록된 내용이 없습니다."}
                  </DetailContentBox>

                  <DetailImageSection>
                    <DetailImageTitle>이미지</DetailImageTitle>
                    {selectedNotice.images && selectedNotice.images.length > 0 ? (
                      <DetailImageGrid>
                        {selectedNotice.images
                          .slice()
                          .sort(
                            (a, b) =>
                              (a.sortOrder || 0) - (b.sortOrder || 0)
                          )
                          .map((img) => (
                            <DetailImageItem key={img.imageId}>
                              <DetailThumb
                                src={img.imageUrl}
                                alt={selectedNotice.title}
                              />
                            </DetailImageItem>
                          ))}
                      </DetailImageGrid>
                    ) : (
                      <DetailImagePlaceholder>
                        등록된 이미지가 없습니다.
                      </DetailImagePlaceholder>
                    )}
                  </DetailImageSection>
                </>
              ) : (
                <DetailEmptyState>
                  <DetailEmptyTitle>공지사항을 선택해 보세요</DetailEmptyTitle>
                  <DetailEmptyText>
                    좌측 목록에서 공지를 클릭하면 이 영역에서 상세 내용과 이미지를
                    바로 확인할 수 있습니다.
                  </DetailEmptyText>
                </DetailEmptyState>
              )}
            </DetailPane>
          </SectionBody>
        </SectionCard>
      </ContentInner>

      {/* ========================
          모달: 공지 등록/수정
         ======================== */}
      {isFormOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingNotice ? "공지사항 수정" : "신규 공지 등록"}
              </ModalTitle>
              <ModalClose onClick={closeForm}>×</ModalClose>
            </ModalHeader>

            <FormLayout>
              {/* 왼쪽: 텍스트 정보 */}
              <FormColumn>
                <FormRow>
                  <Label>제목</Label>
                  <TextInput
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="공지 제목을 입력해 주세요"
                  />
                </FormRow>

                <FormRow>
                  <Label>내용</Label>
                  <TextArea
                    name="content"
                    rows={8}
                    value={form.content}
                    onChange={handleChange}
                    placeholder="공지 내용을 입력해 주세요"
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

                <FormActions>
                  <PrimaryButton type="button" onClick={handleSave} disabled={saving}>
                    {saving ? "저장 중..." : "저장"}
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={closeForm}>
                    취소
                  </SecondaryButton>
                </FormActions>
              </FormColumn>

              {/* 오른쪽: 이미지 관리 */}
              <PreviewColumn>
                <PreviewTitle>이미지 관리</PreviewTitle>
                <FormRow>
                  <Label>이미지 업로드</Label>
                  <TextInput
                    as="input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFiles}
                  />
                  <HintText>
                    여러 장 업로드 가능하며, 순서를 조정해 노출 순서를 설정할 수 있습니다.
                  </HintText>
                </FormRow>

                <ImageListBox>
                  {images.length === 0 ? (
                    <PreviewPlaceholder>
                      등록된 이미지가 없습니다. 이미지를 추가해 보세요.
                    </PreviewPlaceholder>
                  ) : (
                    images.map((img, index) => (
                      <ImageItem key={img.tempId}>
                        <ThumbWrapper>
                          <ThumbImg src={img.imageUrl} alt={`notice-img-${index}`} />
                        </ThumbWrapper>
                        <ImageMeta>
                          <div>순서: {index + 1}</div>
                          <ImageButtons>
                            <IconButton
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveImage(img.tempId, "UP")}
                            >
                              ▲
                            </IconButton>
                            <IconButton
                              type="button"
                              disabled={index === images.length - 1}
                              onClick={() => moveImage(img.tempId, "DOWN")}
                            >
                              ▼
                            </IconButton>
                            <DangerButton
                              type="button"
                              onClick={() => removeImage(img.tempId)}
                            >
                              삭제
                            </DangerButton>
                          </ImageButtons>
                        </ImageMeta>
                      </ImageItem>
                    ))
                  )}
                </ImageListBox>
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

// ✅ 목록 + 상세를 나누는 레이아웃
const SectionBody = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 20px;
  margin-top: 8px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ListPane = styled.div`
  min-width: 0;
`;

const DetailPane = styled.div`
  min-width: 0;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 14px 16px 16px;
  background: #f9fafb;
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
  table-layout: fixed;
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
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }

  ${(props) =>
    props.$selected &&
    `
    background: #eef2ff;
  `}
`;

const Td = styled.td`
  padding: 8px 10px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
`;

const TdCenter = styled(Td)`
  text-align: center;
`;

const NoticeTitleCell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ActiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #16a34a;
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

/* 상세 패널 */

const DetailHeader = styled.div`
  margin-bottom: 8px;
`;

const DetailTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
`;

const DetailTagRow = styled.div`
  margin-top: 6px;
`;

const DetailMetaRow = styled.div`
  margin-bottom: 10px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 14px;
`;

const DetailContentBox = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
  min-height: 80px;
  white-space: pre-wrap;
`;

const DetailImageSection = styled.div`
  margin-top: 14px;
`;

const DetailImageTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 6px;
`;

const DetailImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
`;

const DetailImageItem = styled.div`
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #ffffff;
`;

const DetailThumb = styled.img`
  width: 100%;
  height: 70px;
  object-fit: cover;
`;

const DetailImagePlaceholder = styled.div`
  font-size: 12px;
  color: #9ca3af;
  padding: 10px 0;
`;

const DetailEmptyState = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 6px;
`;

const DetailEmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const DetailEmptyText = styled.div`
  font-size: 12px;
  color: #6b7280;
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
  width: 980px;
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
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 24px;
  margin-top: 10px;
  overflow-y: auto;
  padding-right: 4px;

  @media (max-width: 900px) {
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  outline: none;
  resize: vertical;
  min-height: 160px;
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

const ImageListBox = styled.div`
  border-radius: 10px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  width: 100%;
  min-height: 130px;
  max-height: 260px;
  padding: 10px;
  overflow-y: auto;
`;

const PreviewPlaceholder = styled.div`
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 12px;
`;

const ImageItem = styled.div`
  display: flex;
  gap: 10px;
  padding: 6px 4px;
  align-items: center;

  & + & {
    border-top: 1px solid #e5e7eb;
  }
`;

const ThumbWrapper = styled.div`
  width: 80px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageMeta = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #4b5563;
`;

const ImageButtons = styled.div`
  display: flex;
  gap: 4px;
`;