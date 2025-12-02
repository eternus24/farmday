// src/pages/admin/AdminProducerApprovalPage.jsx
import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminProducerApprovalPage() {
  const { auth } = useContext(AuthContext);

  const token =
    auth?.accessToken ||
    auth?.token ||
    localStorage.getItem("accessToken");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const [tab, setTab] = useState("PENDING"); // PENDING | APPROVED | REJECTED
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 승인/반려용 상태
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ==========================
  // 목록 조회
  // ==========================
  const fetchProducers = async (status = tab) => {
    if (!token) {
      setError("관리자 인증 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/producers`,
        {
          params: { status }, // PENDING / APPROVED / REJECTED
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          withCredentials: true,
        }
      );

      setProducers(res.data || []);
    } catch (err) {
      console.error("생산자 승인 목록 조회 실패:", err);
      setError("생산자 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 데이터 재조회
  useEffect(() => {
    fetchProducers(tab);
  }, [tab]);

  // ==========================
  // 승인 처리
  // ==========================
  const handleApproveClick = (producer) => {
    setApproveTarget(producer);
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);

    try {
      await axios.post(
        `${API_BASE}/api/admin/producers/${approveTarget.producerId}/approve`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          withCredentials: true,
        }
      );

      // 성공 후 리스트 새로고침
      await fetchProducers(tab);
      setApproveTarget(null);
    } catch (err) {
      console.error("생산자 승인 실패:", err);
      alert("승인 처리 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================
  // 반려 처리
  // ==========================
  const handleRejectClick = (producer) => {
    setRejectTarget(producer);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    setActionLoading(true);

    try {
      await axios.post(
        `${API_BASE}/api/admin/producers/${rejectTarget.producerId}/reject`,
        {
          rejectReason: rejectReason.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          withCredentials: true,
        }
      );

      await fetchProducers(tab);
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      console.error("생산자 반려 실패:", err);
      alert("반려 처리 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================
  // UI
  // ==========================
  const renderStatusBadge = () => {
    if (tab === "PENDING") {
      return <StatusBadge $type="pending">승인 대기</StatusBadge>;
    }
    if (tab === "APPROVED") {
      return <StatusBadge $type="approved">승인 완료</StatusBadge>;
    }
    if (tab === "REJECTED") {
      return <StatusBadge $type="rejected">반려</StatusBadge>;
    }
    return null;
  };

  return (
    <PageWrapper>
      <PageHeader>
        <h2>생산자 승인 관리</h2>
        <span className="sub">
          생산자 신청 계정을 조회하고 승인/반려를 처리할 수 있습니다.
        </span>
      </PageHeader>

      {/* 탭 영역 */}
      <TabBar>
        <TabButton
          $active={tab === "PENDING"}
          onClick={() => setTab("PENDING")}
        >
          승인 대기
        </TabButton>
        <TabButton
          $active={tab === "APPROVED"}
          onClick={() => setTab("APPROVED")}
        >
          승인 완료
        </TabButton>
        <TabButton
          $active={tab === "REJECTED"}
          onClick={() => setTab("REJECTED")}
        >
          반려 내역
        </TabButton>
      </TabBar>

      {/* 내용 영역 */}
      <ContentCard>
        {loading ? (
          <CenteredText>목록을 불러오는 중입니다... ⏳</CenteredText>
        ) : error ? (
          <CenteredText className="error">{error}</CenteredText>
        ) : producers.length === 0 ? (
          <CenteredText>해당 상태의 신청 내역이 없습니다.</CenteredText>
        ) : (
          <TableWrapper>
            <table>
              <thead>
                <tr>
                  <th>신청일</th>
                  <th>회원 ID</th>
                  <th>이름</th>
                  <th>농장명</th>
                  <th>사업자번호</th>
                  <th>연락처</th>
                  <th>상태</th>
                  <th>반려 사유</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {producers.map((p) => (
                  <tr key={p.producerId}>
                    <td>{p.createdDate || p.verifiedAt || p.updatedDate}</td>
                    <td>{p.userId}</td>
                    <td>{p.userName}</td>
                    <td>{p.bizName}</td>
                    <td>{p.bizNo}</td>
                    <td>{p.bizPhone}</td>
                    <td>{renderStatusBadge(p)}</td>
                    <td className="reason">
                      {p.rejectReason ? (
                        <ReasonText title={p.rejectReason}>
                          {p.rejectReason}
                        </ReasonText>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {tab === "PENDING" ? (
                        <ActionGroup>
                          <ActionButton
                            $type="approve"
                            onClick={() => handleApproveClick(p)}
                          >
                            승인
                          </ActionButton>
                          <ActionButton
                            $type="reject"
                            onClick={() => handleRejectClick(p)}
                          >
                            반려
                          </ActionButton>
                        </ActionGroup>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        )}
      </ContentCard>

      {/* 승인 확인 모달 (간단 confirm) */}
      {approveTarget && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>생산자 승인</ModalTitle>
            <ModalBody>
              <p>
                <strong>{approveTarget.bizName}</strong> (
                {approveTarget.userId}) 계정을<br />
                <strong>생산자(PRODUCER)</strong>로 승인하시겠습니까?
              </p>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton
                disabled={actionLoading}
                onClick={() => setApproveTarget(null)}
              >
                취소
              </SecondaryButton>
              <PrimaryButton
                disabled={actionLoading}
                onClick={confirmApprove}
              >
                {actionLoading ? "처리 중..." : "승인"}
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 반려 사유 입력 모달 */}
      {rejectTarget && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>생산자 반려</ModalTitle>
            <ModalBody>
              <p>
                <strong>{rejectTarget.bizName}</strong> (
                {rejectTarget.userId}) 신청을 반려하시겠습니까?
              </p>
              <p style={{ marginTop: "8px", fontSize: "13px", color: "#666" }}>
                반려 사유는 신청자 마이페이지에서 확인할 수 있게 저장됩니다.
              </p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="반려 사유를 입력해주세요."
              />
            </ModalBody>
            <ModalFooter>
              <SecondaryButton
                disabled={actionLoading}
                onClick={() => setRejectTarget(null)}
              >
                취소
              </SecondaryButton>
              <DangerButton
                disabled={actionLoading}
                onClick={confirmReject}
              >
                {actionLoading ? "처리 중..." : "반려"}
              </DangerButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

// ==========================
// styled-components
// ==========================

const PageWrapper = styled.div`
  width: 100%;
  padding: 0;          /* ← 좌우 여백 제거 */
`;

const PageHeader = styled.div`
  margin-bottom: 18px;

  h2 {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
  }

  .sub {
    display: inline-block;
    margin-top: 4px;
    font-size: 13px;
    color: #777;
  }
`;

const TabBar = styled.div`
  display: inline-flex;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #ddd;
  margin-bottom: 18px;
`;

const TabButton = styled.button`
  padding: 8px 18px;
  font-size: 13px;
  border: none;
  cursor: pointer;
  background: ${(p) => (p.$active ? "#2f855a" : "transparent")};
  color: ${(p) => (p.$active ? "#fff" : "#555")};
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  transition: all 0.15s ease;

  &:hover {
    background: ${(p) => (p.$active ? "#276749" : "#f5f5f5")};
  }

  & + & {
    border-left: 1px solid #ddd;
  }
`;

const ContentCard = styled.div`
  width: 100%;               /* ← 전체 폭 사용 */
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  padding: 20px 24px;        /* ← 좌우 넓게 */
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
  min-height: 260px;
  box-sizing: border-box;    /* ← 테두리 + 패딩 포함 */
`;

const CenteredText = styled.div`
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: #666;

  &.error {
    color: #e53e3e;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  thead {
    background: #f8fafc;
  }

  th, td {
    padding: 10px 12px;
    border-bottom: 1px solid #edf2f7;
    text-align: left;
    white-space: nowrap;
  }

  th {
    font-weight: 600;
    color: #4a5568;
    font-size: 12px;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;

  ${(p) =>
    p.$type === "pending" &&
    `
    background: #fffaf0;
    color: #b7791f;
    border: 1px solid #f6e05e;
  `}

  ${(p) =>
    p.$type === "approved" &&
    `
    background: #f0fff4;
    color: #2f855a;
    border: 1px solid #9ae6b4;
  `}
  
  ${(p) =>
    p.$type === "rejected" &&
    `
    background: #fff5f5;
    color: #e53e3e;
    border: 1px solid #feb2b2;
  `}
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionButton = styled.button`
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid
    ${(p) => (p.$type === "approve" ? "#38a169" : "#e53e3e")};
  background: #fff;
  color: ${(p) => (p.$type === "approve" ? "#2f855a" : "#e53e3e")};
  cursor: pointer;
  transition: 0.15s;

  &:hover {
    background: ${(p) =>
      p.$type === "approve" ? "#f0fff4" : "#fff5f5"};
  }
`;

// ===== 모달 =====

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px 16px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
`;

const ModalBody = styled.div`
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 12px;

  p {
    margin: 0 0 4px;
    line-height: 1.5;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
`;

const PrimaryButton = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: #2b6cb0;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  &:not(:disabled):hover {
    background: #2c5282;
  }
`;

const SecondaryButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  background: #fff;
  color: #4a5568;
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  &:not(:disabled):hover {
    background: #edf2f7;
  }
`;

const DangerButton = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: #e53e3e;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  &:not(:disabled):hover {
    background: #c53030;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  margin-top: 10px;
  resize: vertical;
  font-size: 13px;
  padding: 8px 9px;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  outline: none;

  &:focus {
    border-color: #3182ce;
    box-shadow: 0 0 0 1px rgba(49, 130, 206, 0.3);
  }
`;

const ReasonText = styled.span`
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;