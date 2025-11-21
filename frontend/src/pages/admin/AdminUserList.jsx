// src/pages/admin/AdminUserList.jsx
import { useEffect, useState } from "react";
import styled from "styled-components";

const API_BASE = "http://192.168.0.20:8080";

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [blockedFilter, setBlockedFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null); // 상세보기용
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // 날짜 포맷 공통 함수
  const formatDate = (value) => {
    if (!value) return "-";
    const str = String(value);
    const d = new Date(str.replace(" ", "T"));
    return isNaN(d.getTime()) ? str : d.toLocaleString();
  };

  // 유저 목록 가져오기
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("size", size);
      if (keyword) params.append("keyword", keyword);
      if (roleFilter) params.append("role", roleFilter);
      if (blockedFilter) params.append("blocked", blockedFilter);

      const res = await fetch(
        `${API_BASE}/api/admin/users?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
                }
              : {}),
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "유저 목록을 불러오지 못했습니다.");
      }

      const data = await res.json();
      setUsers(data.users || []);
      setTotalCount(data.totalCount ?? 0);
    } catch (err) {
      console.error("[AdminUserList] fetchUsers error:", err);
      setError(err.message || "유저 목록 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // page, size, roleFilter, blockedFilter 바뀔 때마다 재조회
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, roleFilter, blockedFilter]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / size));

  // 유저 상세 조회
  const fetchUserDetail = async (userNo) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/api/admin/users/${userNo}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: token.startsWith("Bearer ")
                  ? token
                  : `Bearer ${token}`,
              }
            : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "유저 상세 정보를 가져오지 못했습니다.");
      }

      const data = await res.json();
      setSelectedUser(data);
    } catch (err) {
      console.error("[AdminUserList] fetchUserDetail error:", err);
      alert(err.message || "유저 상세 조회 중 오류가 발생했습니다.");
    }
  };

  const openBlockModal = (user) => {
    setSelectedUser(user);
    setBlockReason("");
    setBlockModalOpen(true);
  };

  const closeBlockModal = () => {
    setBlockModalOpen(false);
  };

  // 차단/해제 요청
  const updateBlockStatus = async (userNo, type) => {
    try {
      const token = localStorage.getItem("accessToken");
      const url =
        type === "BLOCK"
          ? `${API_BASE}/api/admin/users/${userNo}/block`
          : `${API_BASE}/api/admin/users/${userNo}/unblock`;

      const body =
        type === "BLOCK"
          ? JSON.stringify({ reason: blockReason || "관리자 차단" })
          : null;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: token.startsWith("Bearer ")
                  ? token
                  : `Bearer ${token}`,
              }
            : {}),
        },
        credentials: "include",
        body,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "차단/해제 처리 중 오류가 발생했습니다.");
      }

      closeBlockModal();
      await fetchUsers(); // 목록 갱신
    } catch (err) {
      console.error("[AdminUserList] updateBlockStatus error:", err);
      alert(err.message || "차단/해제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <PageWrapper>
      <HeaderRow>
        <div>
          <Title>유저 관리</Title>
          <SubTitle>
            소비자 / 생산자 / 관리자 계정을 한 눈에 관리합니다.
          </SubTitle>
        </div>
        <CountBadge>총 {totalCount.toLocaleString()}명</CountBadge>
      </HeaderRow>

      {/* 검색 / 필터 영역 */}
      <FilterBar onSubmit={onSearchSubmit}>
        <input
          type="text"
          placeholder="아이디, 이름, 이메일 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">전체 권한</option>
          <option value="USER">소비자</option>
          <option value="ADMIN">관리자</option>
          <option value="PRODUCER_PENDING">생산자(승인대기)</option>
          <option value="PRODUCER">생산자</option>
        </select>

        <select
          value={blockedFilter}
          onChange={(e) => {
            setBlockedFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">차단 여부</option>
          <option value="N">정상</option>
          <option value="Y">차단됨</option>
        </select>

        <button type="submit">검색</button>
      </FilterBar>

      {/* 본문 */}
      <ContentRow>
        <TableCard>
          {loading ? (
            <CenterBox>로딩 중...</CenterBox>
          ) : error ? (
            <CenterBox>❌ {error}</CenterBox>
          ) : users.length === 0 ? (
            <CenterBox>조건에 맞는 사용자가 없습니다.</CenterBox>
          ) : (
            <UserTable>
              <thead>
                <tr>
                  <th>No</th>
                  <th>권한</th>
                  <th>아이디</th>
                  <th>이름</th>
                  <th>이메일</th>
                  {/* 연락처 컬럼 제거 */}
                  <th>가입일</th>
                  <th>차단</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userNo}>
                    <td>{u.userNo}</td>
                    <td>{u.role}</td>
                    <td>{u.userId}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    {/* <td>{u.phone}</td> 연락처는 리스트에서 제거 */}
                    <td>{formatDate(u.createdDate)}</td>
                    <td>
                      {u.isBlocked === "Y" ? (
                        <BlockedBadge>차단</BlockedBadge>
                      ) : (
                        <NormalBadge>정상</NormalBadge>
                      )}
                    </td>
                    <td>
                      <RowButtons>
                        <button
                          type="button"
                          onClick={() => fetchUserDetail(u.userNo)}
                        >
                          상세
                        </button>
                        {u.isBlocked === "Y" ? (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() =>
                              updateBlockStatus(u.userNo, "UNBLOCK")
                            }
                          >
                            차단 해제
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="danger"
                            onClick={() => openBlockModal(u)}
                          >
                            차단
                          </button>
                        )}
                      </RowButtons>
                    </td>
                  </tr>
                ))}
              </tbody>
            </UserTable>
          )}

          {/* 페이징 */}
          <PaginationBar>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ◀
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ▶
            </button>

            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10개씩</option>
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
            </select>
          </PaginationBar>
        </TableCard>

        {/* 우측 상세 패널 */}
        <SideCard>
          <SideTitle>유저 상세</SideTitle>
          {selectedUser ? (
            <SideContent>
              <h3>
                {selectedUser.name} <span>({selectedUser.userId})</span>
              </h3>
              <ul>
                <li>
                  <span className="label">권한</span>
                  <span className="value">{selectedUser.role}</span>
                </li>
                <li>
                  <span className="label">이메일</span>
                  <span className="value">{selectedUser.email || "-"}</span>
                </li>
                <li>
                  <span className="label">연락처</span>
                  <span className="value">{selectedUser.phone || "-"}</span>
                </li>
                <li>
                  <span className="label">주소</span>
                  <span className="value">{selectedUser.addr || "-"}</span>
                </li>
                <li>
                  <span className="label">이메일 인증</span>
                  <span className="value">
                    {selectedUser.emailVerified === "Y" ? "완료" : "미인증"}
                  </span>
                </li>
                <li>
                  <span className="label">가입일</span>
                  <span className="value">
                    {formatDate(selectedUser.createdDate)}
                  </span>
                </li>
                <li>
                  <span className="label">마지막 로그인</span>
                  <span className="value">
                    {formatDate(selectedUser.lastLoginAt)}
                  </span>
                </li>
                <li>
                  <span className="label">차단여부</span>
                  <span className="value">
                    {selectedUser.isBlocked === "Y" ? "차단" : "정상"}
                  </span>
                </li>
                {selectedUser.isBlocked === "Y" && (
                  <>
                    <li>
                      <span className="label">차단 사유</span>
                      <span className="value">
                        {selectedUser.blockReason || "-"}
                      </span>
                    </li>
                    <li>
                      <span className="label">차단일시</span>
                      <span className="value">
                        {formatDate(selectedUser.blockedAt)}
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </SideContent>
          ) : (
            <SidePlaceholder>
              왼쪽 목록에서 사용자를 선택하면 상세 정보가 표시됩니다.
            </SidePlaceholder>
          )}
        </SideCard>
      </ContentRow>

      {/* 차단 모달 */}
      {blockModalOpen && selectedUser && (
        <ModalBackdrop>
          <ModalCard>
            <h3>
              {selectedUser.name} ({selectedUser.userId}) 차단
            </h3>
            <p>차단 사유를 입력해 주세요. (선택)</p>
            <textarea
              rows={4}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="예: 악성 주문 및 반복적인 시스템 악용"
            />
            <ModalButtons>
              <button type="button" onClick={closeBlockModal}>
                취소
              </button>
              <button
                type="button"
                className="danger"
                onClick={() =>
                  updateBlockStatus(selectedUser.userNo, "BLOCK")
                }
              >
                차단하기
              </button>
            </ModalButtons>
          </ModalCard>
        </ModalBackdrop>
      )}
    </PageWrapper>
  );
}

/* ========== styled-components ========== */

const PageWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
`;

const SubTitle = styled.p`
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
`;

const CountBadge = styled.div`
  padding: 6px 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 600;
`;

const FilterBar = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;

  input {
    flex: 1;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    padding: 8px 12px;
    font-size: 13px;
  }

  select {
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    padding: 8px 10px;
    font-size: 13px;
    background: #ffffff;
  }

  button[type="submit"] {
    border: none;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    background: #4f46e5;
    color: #ffffff;
    cursor: pointer;
  }
`;

const ContentRow = styled.div`
  display: grid;
  grid-template-columns: 2.2fr 1.3fr;
  gap: 16px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const TableCard = styled.div`
  background: #ffffff;
  border-radius: 18px;
  padding: 16px 16px 8px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.04);
`;

const SideCard = styled.div`
  background: #ffffff;
  border-radius: 18px;
  padding: 16px 16px 12px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.04);
  min-height: 260px;
`;

const SideTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const SideContent = styled.div`
  h3 {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 12px;

    span {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
      margin-left: 4px;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    font-size: 13px;
    padding: 4px 0;
  }

  .label {
    width: 100px;
    color: #9ca3af;
  }

  .value {
    flex: 1;
    color: #374151;
  }
`;

const SidePlaceholder = styled.div`
  font-size: 13px;
  color: #9ca3af;
  margin-top: 12px;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  thead {
    background: #f9fafb;
  }

  th,
  td {
    padding: 6px 4px;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
    white-space: nowrap;
  }

  tbody tr:hover {
    background: #f9fafb;
  }
`;

const CenterBox = styled.div`
  width: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 13px;
`;

const BlockedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: #fee2e2;
  color: #b91c1c;
`;

const NormalBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: #dcfce7;
  color: #15803d;
`;

const RowButtons = styled.div`
  display: flex;
  gap: 4px;

  button {
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    padding: 3px 8px;
    font-size: 11px;
    cursor: pointer;
    background: #ffffff;
  }

  .secondary {
    border-color: #d1d5db;
  }

  .danger {
    border-color: #fecaca;
    background: #fee2e2;
    color: #b91c1c;
  }
`;

const PaginationBar = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
  font-size: 12px;

  button {
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    padding: 2px 8px;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  select {
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    padding: 2px 6px;
    font-size: 12px;
    background: #ffffff;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
`;

const ModalCard = styled.div`
  width: 360px;
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 18px 14px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.5);

  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  p {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 8px;
  }

  textarea {
    width: 100%;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    font-size: 13px;
    padding: 8px;
    resize: vertical;
  }
`;

const ModalButtons = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button {
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
  }

  .danger {
    background: #ef4444;
    border-color: #ef4444;
    color: #ffffff;
  }
`;