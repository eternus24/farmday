// src/pages/admin/AdminProductManagePage.jsx
import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TABS = [
  { key: "ALL", label: "전체 상품" },
  { key: "STATS", label: "상품 통계" },
];

export default function AdminProductManagePage() {
  const { auth } = useContext(AuthContext);

  const token =
    auth?.accessToken ||
    auth?.token ||
    localStorage.getItem("accessToken");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const [activeTab, setActiveTab] = useState("ALL");
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [period, setPeriod] = useState(30); // 통계 기간 (일)
  const [sortKey, setSortKey] = useState("SALES"); // SALES | AMOUNT
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // 전체 상품 탭 상세용
  const [selectedStatsItem, setSelectedStatsItem] = useState(null); // 통계 탭에서 클릭한 상품
  const [currentStatsTarget, setCurrentStatsTarget] = useState(null); // 실제 패널에 표시할 통계 대상

  // ===============================
  // 탭 변경 시 리스트/통계 다시 조회
  // ===============================
  useEffect(() => {
    if (activeTab === "STATS") {
      fetchStats();
    } else {
      fetchProducts(1);
    }
  }, [activeTab]);

  // 검색어 / 페이지 변경 시
  useEffect(() => {
    if (activeTab !== "STATS") {
      fetchProducts(page);
    }
  }, [page, keyword]);

  // 통계 필터 변경 시
  useEffect(() => {
    if (activeTab === "STATS") {
      fetchStats();
    }
  }, [period, sortKey]);

  // ===============================
  // 상품 리스트 조회
  // ===============================
  const fetchProducts = async (pageToLoad = 1) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API_BASE}/api/admin/products`, {
        params: {
          keyword: keyword || "",
          page: pageToLoad,
          size: 20,
        },
        headers: authHeaders,
      });

      const data = res.data;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || pageToLoad);
    } catch (err) {
      console.error(err);
      setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 통계 조회
  // ===============================
  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API_BASE}/api/admin/products/stats`, {
        params: {
          period, // 7 / 30 / 90
          sort: sortKey, // SALES / AMOUNT
        },
        headers: authHeaders,
      });
      const list = res.data || [];
      setStats(list);

      // 새 조건으로 통계 불러올 때는 선택 초기화
      setSelectedStatsItem(null);
    } catch (err) {
      console.error(err);
      setError("통계 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 통계 대상 선택 로직
  //  - stats / selectedStatsItem 변할 때마다
  //    오른쪽 패널에 보여줄 currentStatsTarget 결정
  // ===============================
  useEffect(() => {
    if (!stats || stats.length === 0) {
      setCurrentStatsTarget(null);
      return;
    }

    if (selectedStatsItem) {
      // 클릭해서 선택한 상품이 있으면, 새 stats 리스트에서 동일 productId 찾기
      const updated = stats.find(
        (s) => s.productId === selectedStatsItem.productId
      );
      setCurrentStatsTarget(updated || stats[0]); // 없으면 1위 상품
    } else {
      // 선택 안 했으면 항상 1위 상품 기준
      setCurrentStatsTarget(stats[0]);
    }
  }, [stats, selectedStatsItem]);

  // ===============================
  // 상품 삭제 (부적절 상품 삭제)
  // ===============================
  const handleDelete = async (productId) => {
    if (
      !window.confirm(
        "이 상품을 삭제하시겠습니까?\n삭제 후에는 되돌릴 수 없습니다."
      )
    )
      return;

    setSaving(true);
    try {
      await axios.delete(`${API_BASE}/api/admin/products/${productId}`, {
        headers: authHeaders,
      });
      alert("상품이 삭제되었습니다.");
      // 삭제 후 목록 갱신
      fetchProducts(page);
      // 선택되어 있던 상품이 삭제됐으면 상세 패널도 초기화
      if (selectedProduct && selectedProduct.productId === productId) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error(err);
      alert("상품 삭제 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // 요약 카드용
  // ===============================
  const totalCount = products.length;

  const totalSalesQty = products.reduce(
    (sum, p) => sum + (p.recentSalesQty || 0),
    0
  );

  const hasNoData =
    !loading &&
    !error &&
    ((activeTab === "STATS" && stats.length === 0) ||
      (activeTab !== "STATS" && products.length === 0));

  const totalStatsSalesQty = stats.reduce(
    (sum, s) => sum + (s.salesQty || 0),
    0
  );
  const totalStatsSalesAmount = stats.reduce(
    (sum, s) => sum + (s.salesAmount || 0),
    0
  );

  const topStatsItem = stats.length > 0 ? stats[0] : null;

  // ===============================
  // 렌더링
  // ===============================
  return (
    <PageWrapper>
      <PageHeader>
        <div>
          <Title>상품 관리</Title>
          <Desc>
            등록된 상품을 조회하고, 부적절한 상품을 삭제하며,
            판매 통계를 확인하실 수 있습니다.
          </Desc>
        </div>
      </PageHeader>

      <TabList>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
              setSelectedProduct(null);
            }}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabList>

      {/* 검색/필터 영역 */}
      {activeTab !== "STATS" && (
        <FilterBar>
          <SearchInput
            placeholder="상품명 / 생산자명으로 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </FilterBar>
      )}

      {activeTab === "STATS" && (
        <FilterBar>
          <Select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
          </Select>

          <Select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="SALES">판매량 순</option>
            <option value="AMOUNT">매출 순</option>
          </Select>
        </FilterBar>
      )}

      {/* 상단 요약 카드 */}
      {activeTab !== "STATS" && (
        <SummaryRow>
          <SummaryCard>
            <SummaryTitle>현재 페이지 상품 수</SummaryTitle>
            <SummaryValue>{totalCount}</SummaryValue>
            <SummarySub>
              검색/필터 기준에 해당하는 상품 개수입니다.
            </SummarySub>
          </SummaryCard>

          <SummaryCard>
            <SummaryTitle>최근 30일 판매 요약</SummaryTitle>
            <SummaryValue>{totalSalesQty.toLocaleString()}건</SummaryValue>
            <SummarySub>
              최근 30일 기준 판매 수량 합계입니다.
            </SummarySub>
          </SummaryCard>
        </SummaryRow>
      )}

      {activeTab === "STATS" && (
        <StatsIntroCard>
          <StatsIntroTitle>상품 통계 요약</StatsIntroTitle>
          <StatsIntroText>
            기간과 정렬 기준을 변경하여 판매량·매출 기준 상위 상품을
            확인하실 수 있습니다.
          </StatsIntroText>
        </StatsIntroCard>
      )}

      {loading && <InfoText>불러오는 중입니다...</InfoText>}
      {error && <ErrorText>{error}</ErrorText>}

      {/* 메인 컨텐츠 영역 */}
      <ContentArea>
        <MainPanel>
          {!loading && !error && activeTab !== "STATS" && (
            <>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>이미지</th>
                      <th>상품명</th>
                      <th>생산자</th>
                      <th>카테고리</th>
                      <th>상태</th>
                      <th>최근30일 판매수량</th>
                      <th>등록일</th>
                      <th>액션</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={9}>
                          <EmptyStateBox>
                            <EmptyIcon>📦</EmptyIcon>
                            <EmptyTitle>
                              아직 표시할 상품이 없습니다.
                            </EmptyTitle>
                            <EmptyText>
                              신규 상품이 등록되면 이 영역에서 조회하실 수
                              있습니다.
                            </EmptyText>
                            <EmptyActions>
                              <OutlineButton
                                type="button"
                                onClick={() => {
                                  setKeyword("");
                                  setPage(1);
                                }}
                              >
                                필터 초기화
                              </OutlineButton>
                            </EmptyActions>
                          </EmptyStateBox>
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.productId}>
                          <td>{p.productId}</td>
                          <td>
                            {p.mainImage && (
                              <ThumbImg src={p.mainImage} alt={p.name} />
                            )}
                          </td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedProduct(p)}
                          >
                            {p.name}
                          </td>
                          <td>{p.producerName}</td>
                          <td>{p.baseCategoryName}</td>
                          <td>
                            <StatusBadge>{p.status}</StatusBadge>
                          </td>
                          <td>{p.recentSalesQty ?? "-"}</td>
                          <td>{p.createdDate}</td>
                          <td>
                            <ActionButton
                              disabled={saving}
                              $danger
                              onClick={() => handleDelete(p.productId)}
                            >
                              삭제
                            </ActionButton>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </TableWrapper>

              <PaginationBar>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  이전
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  다음
                </button>
              </PaginationBar>
            </>
          )}

          {!loading && !error && activeTab === "STATS" && (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>상품명</th>
                    <th>생산자</th>
                    <th>판매수량</th>
                    <th>매출액</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyStateBox>
                          <EmptyIcon>📊</EmptyIcon>
                          <EmptyTitle>
                            아직 통계 데이터가 없습니다.
                          </EmptyTitle>
                          <EmptyText>
                            주문 데이터가 쌓이면 기간별 인기 상품
                            통계를 확인하실 수 있습니다.
                          </EmptyText>
                        </EmptyStateBox>
                      </td>
                    </tr>
                  ) : (
                    stats.map((s, idx) => (
                      <tr
                        key={s.productId}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedStatsItem(s)}
                      >
                        <td>{idx + 1}</td>
                        <td>{s.name}</td>
                        <td>{s.producerName}</td>
                        <td>{s.salesQty ?? 0}</td>
                        <td>
                          {s.salesAmount
                            ? s.salesAmount.toLocaleString()
                            : 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </MainPanel>

        {/* 우측 상세 패널 */}
        <SidePanel>
          {/* STATS 탭일 때 : 통계 요약 패널 */}
          {activeTab === "STATS" ? (
            stats.length === 0 || !currentStatsTarget ? (
              <SideEmpty>
                <SideEmptyIcon>📊</SideEmptyIcon>
                <SideEmptyTitle>표시할 통계 데이터가 없습니다.</SideEmptyTitle>
                <SideEmptyText>
                  기간을 변경하거나 주문 데이터가 쌓이면
                  <br />
                  인기 상품 통계를 확인하실 수 있습니다.
                </SideEmptyText>
              </SideEmpty>
            ) : (
              <>
                <SideTitle>통계 상세</SideTitle>
                <SideProductName>{currentStatsTarget.name}</SideProductName>
                <SideProductMeta>
                  생산자 : {currentStatsTarget.producerName}
                </SideProductMeta>
                <SideProductMeta>
                  기간 : 최근 {period}일 · 정렬 기준 :{" "}
                  {sortKey === "AMOUNT" ? "매출액" : "판매수량"}
                </SideProductMeta>

                <SideSectionTitle>선택 상품 요약</SideSectionTitle>
                <SideBox>
                  <SideRow>
                    <span>판매수량</span>
                    <strong>{currentStatsTarget.salesQty ?? 0} 건</strong>
                  </SideRow>
                  <SideRow>
                    <span>매출액</span>
                    <strong>
                      {currentStatsTarget.salesAmount
                        ? currentStatsTarget.salesAmount.toLocaleString()
                        : 0}
                      원
                    </strong>
                  </SideRow>
                  <SideRow>
                    <span>전체 판매 비중</span>
                    <strong>
                      {totalStatsSalesQty > 0
                        ? (
                            ((currentStatsTarget.salesQty || 0) /
                              totalStatsSalesQty) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </strong>
                  </SideRow>
                </SideBox>

                <SideSectionTitle>전체 통계 요약</SideSectionTitle>
                <SideBox>
                  <SideRow>
                    <span>총 판매수량</span>
                    <strong>{totalStatsSalesQty.toLocaleString()} 건</strong>
                  </SideRow>
                  <SideRow>
                    <span>총 매출액</span>
                    <strong>
                      {totalStatsSalesAmount.toLocaleString()} 원
                    </strong>
                  </SideRow>
                  {topStatsItem && (
                    <SideRow>
                      <span>1위 상품</span>
                      <strong>{topStatsItem.name}</strong>
                    </SideRow>
                  )}
                </SideBox>
              </>
            )
          ) : (
            // 기존 상품 상세 패널 (ALL 탭)
            <>
              {selectedProduct ? (
                <>
                  <SideTitle>상품 상세</SideTitle>
                  <SideProductName>{selectedProduct.name}</SideProductName>
                  <SideProductMeta>
                    상품 ID : {selectedProduct.productId}
                  </SideProductMeta>
                  <SideProductMeta>
                    생산자 : {selectedProduct.producerName}
                  </SideProductMeta>
                  <SideProductMeta>
                    카테고리 : {selectedProduct.baseCategoryName}
                  </SideProductMeta>
                  <SideProductMeta>
                    상태 : {selectedProduct.status}
                  </SideProductMeta>

                  <SideSectionTitle>요약 정보</SideSectionTitle>
                  <SideBox>
                    <SideRow>
                      <span>등록일</span>
                      <strong>{selectedProduct.createdDate}</strong>
                    </SideRow>
                    <SideRow>
                      <span>최근30일 판매수량</span>
                      <strong>{selectedProduct.recentSalesQty ?? 0}</strong>
                    </SideRow>
                  </SideBox>

                  <SideFooter>
                    <OutlineButton
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                    >
                      닫기
                    </OutlineButton>
                  </SideFooter>
                </>
              ) : (
                <SideEmpty>
                  <SideEmptyIcon>🌿</SideEmptyIcon>
                  <SideEmptyTitle>
                    상품을 선택하시면 상세 정보가 표시됩니다.
                  </SideEmptyTitle>
                  <SideEmptyText>
                    왼쪽 목록에서 상품명을 클릭하시면
                    <br />
                    이 영역에서 간단한 요약 정보를 바로 확인하실 수 있습니다.
                  </SideEmptyText>
                </SideEmpty>
              )}
            </>
          )}
        </SidePanel>
      </ContentArea>

      {hasNoData && (
        <BottomHint>
          새로운 상품이 등록되면 이 페이지에서 관리 업무를 진행하실 수
          있습니다.
        </BottomHint>
      )}
    </PageWrapper>
  );
}

/* =========================
   styled-components
   ========================= */

// 전체 폭을 다시 넓게 사용 (max-width 제거)
const PageWrapper = styled.div`
  padding: 24px 32px;
  min-height: calc(100vh - 80px);
`;

// 왼쪽(테이블) 영역을 더 넓게, 오른쪽 패널은 최소 넓이만 확보
const ContentArea = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(320px, 1fr);
  column-gap: 24px;
  align-items: flex-start;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const Desc = styled.p`
  margin-top: 4px;
  color: #6b7280;
  font-size: 14px;
`;

const TabList = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const TabButton = styled.button`
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? "#2563eb" : "#e5e7eb")};
  background: ${({ $active }) => ($active ? "#2563eb" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#374151")};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background: ${({ $active }) => ($active ? "#1d4ed8" : "#f9fafb")};
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background: #ffffff;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SummaryCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
`;

const SummaryTitle = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #111827;
`;

const SummarySub = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
`;

const StatsIntroCard = styled.div`
  background: linear-gradient(135deg, #eff6ff, #fef9c3);
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid #dbeafe;
`;

const StatsIntroTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const StatsIntroText = styled.div`
  font-size: 13px;
  color: #4b5563;
`;

const MainPanel = styled.div`
  min-height: 420px;
`;

const SidePanel = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  min-height: 420px;
  position: sticky;
  top: 110px;
`;

const TableWrapper = styled.div`
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  overflow: hidden;
  min-height: 320px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead {
    background: #f9fafb;
  }

  th,
  td {
    padding: 10px 12px;
    border-bottom: 1px solid #f3f4f6;
    text-align: left;
    vertical-align: middle;
  }

  th {
    font-weight: 600;
    color: #4b5563;
    white-space: nowrap;
  }
`;

const ThumbImg = styled.img`
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e5f2ff;
  color: #2563eb;
  font-size: 11px;
  white-space: nowrap;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  margin-right: 4px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid ${({ $danger }) => ($danger ? "#fca5a5" : "#d1d5db")};
  background: ${({ $danger }) => ($danger ? "#fef2f2" : "#ffffff")};
  color: ${({ $danger }) => ($danger ? "#b91c1c" : "#374151")};
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 12px;

  button {
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    font-size: 12px;
    cursor: pointer;
  }

  span {
    font-size: 13px;
    color: #4b5563;
  }
`;

const InfoText = styled.p`
  margin: 8px 0;
  color: #6b7280;
  font-size: 13px;
`;

const ErrorText = styled.p`
  margin: 8px 0;
  color: #dc2626;
  font-size: 13px;
`;

/* Empty State */

const EmptyStateBox = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const EmptyTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const EmptyActions = styled.div`
  margin-top: 12px;
`;

const OutlineButton = styled.button`
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
`;

/* 우측 상세 패널 */

const SideTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
`;

const SideProductName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
`;

const SideProductMeta = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const SideSectionTitle = styled.div`
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const SideBox = styled.div`
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 10px 12px;
  background: #f9fafb;
`;

const SideRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #4b5563;
  & + & {
    margin-top: 4px;
  }
`;

const SideFooter = styled.div`
  margin-top: 18px;
  text-align: right;
`;

const SideEmpty = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6b7280;
`;

const SideEmptyIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const SideEmptyTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const SideEmptyText = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

const BottomHint = styled.div`
  margin-top: 12px;
  font-size: 12px;
  color: #9ca3af;
`;