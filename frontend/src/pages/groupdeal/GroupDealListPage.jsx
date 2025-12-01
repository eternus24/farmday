import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getGroupDealList } from "../../api/groupDealApi";
import GroupDealListLayout from "../../layouts/GroupDealListLayout";
import BarProgress from "./components/BarProgress";

// 가격 포맷
function formatPrice(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

// 남은 시간 포맷
function formatRemainingTime(endAt) {
  if (!endAt) return "마감일 미정";

  const end = new Date(endAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return "마감";

  const diffSec = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSec / (60 * 60 * 24));
  const hours = Math.floor((diffSec % (60 * 60 * 24)) / (60 * 60));

  if (days > 0) return `D-${days} · ${hours}시간 남음`;
  if (hours > 0) return `오늘 마감 · ${hours}시간 남음`;
  return "곧 마감";
}

// 카드 상단 뱃지 텍스트
function getBadge(deal, remainingText) {
  if (remainingText.startsWith("곧 마감") || remainingText.startsWith("오늘")) {
    return "마감 임박";
  }
  if (deal.discountRate >= 20) return "특가 공동구매";
  return "공동구매";
}

// 정렬
function sortDeals(deals, sortOption) {
  const copy = [...deals];
  if (sortOption === "ending") {
    return copy.sort((a, b) => new Date(a.endAt) - new Date(b.endAt));
  }
  if (sortOption === "discount") {
    return copy.sort((a, b) => (b.discountRate || 0) - (a.discountRate || 0));
  }
  return copy; // latest: 일단 그대로
}

const CATEGORY_OPTIONS = ["전체"]; // 추후 과일/채소 등으로 확장 가능

function GroupDealListPage() {
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState("ending");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const list = await getGroupDealList("OPEN");
        setDeals(list || []);
      } catch (e) {
        console.error(e);
        setError("공동구매 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSortedDeals = useMemo(() => {
    let result = [...deals];

    // 카테고리 필터 (추후 상품 카테고리 연동 시 수정)
    if (selectedCategory !== "전체") {
      result = result.filter(
        (d) =>
          (d.title || "").includes(selectedCategory) ||
          (d.subTitle || "").includes(selectedCategory)
      );
    }

    return sortDeals(result, sortOption);
  }, [deals, selectedCategory, sortOption]);

  const handleCardClick = (groupDealId) => {
    navigate(`/group-deals/${groupDealId}`);
  };

  return (
    <GroupDealListLayout
      dealsCount={filteredAndSortedDeals.length}
      categoryOptions={CATEGORY_OPTIONS}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      sortOption={sortOption}
      onSortOptionChange={setSortOption}
      showFilter={showFilter}
      onToggleFilter={() => setShowFilter((v) => !v)}
    >
      {loading && (
        <div className="py-5 text-center text-muted">불러오는 중입니다...</div>
      )}

      {error && !loading && (
        <div className="alert alert-danger my-4" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filteredAndSortedDeals.length === 0 && (
        <div className="py-5 text-center text-muted">
          현재 진행 중인 공동구매가 없습니다.
        </div>
      )}

      {!loading && !error && filteredAndSortedDeals.length > 0 && (
        <div className="row g-4">
          {filteredAndSortedDeals.map((deal) => {
            const remainingText = formatRemainingTime(deal.endAt);
            const badgeText = getBadge(deal, remainingText);

            return (
              <div
                key={deal.groupDealId}
                className="col-12 col-md-6 col-lg-4 d-flex"
              >
                <div
                  className="card border-0 w-100 h-100"
                  style={{
                    borderRadius: "22px",
                    overflow: "hidden",
                    cursor: "pointer",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 12px 32px rgba(15,23,42,0.06)",
                    transition:
                      "transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease",
                  }}
                  onClick={() => handleCardClick(deal.groupDealId)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 46px rgba(15,23,42,0.13)";
                    e.currentTarget.style.backgroundColor = "#fefcf5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 32px rgba(15,23,42,0.06)";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  {/* 이미지 영역 */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "90%", // ✅ 세로 크게
                      backgroundColor: "#f3f4f6",
                    }}
                  >
                    {deal.thumbnailImageUrl && (
                      <img
                        src={deal.thumbnailImageUrl}
                        alt={deal.title}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    {/* 상단 배지 */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        padding: "4px 12px",
                        borderRadius: "999px",
                        backgroundColor:
                          badgeText === "마감 임박" ? "#b91c1c" : "#14532d",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        boxShadow: "0 6px 14px rgba(15,23,42,0.2)",
                      }}
                    >
                      {badgeText}
                    </div>
                  </div>

                  {/* 본문 */}
                  <div className="card-body d-flex flex-column">
                    {/* 제목/부제 영역 */}
                    <div className="mb-3">
                      <div
                        className="text-truncate"
                        style={{
                          fontWeight: 800,
                          fontSize: "1.05rem",
                          letterSpacing: "0.01em",
                          color: "#111827",
                        }}
                      >
                        {deal.title}
                      </div>
                      {deal.subTitle && (
                        <div
                          className="text-truncate"
                          style={{
                            fontSize: "0.86rem",
                            color: "#6b7280",
                            marginTop: 4,
                            lineHeight: 1.45,
                          }}
                        >
                          {deal.subTitle}
                        </div>
                      )}
                    </div>

                    {/* 가격 영역 */}
                    <div className="mb-3">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        {deal.discountRate != null && (
                          <span
                            style={{
                              fontSize: "1.8rem",
                              fontWeight: 800,
                              color: "#b91c1c", // 🔴 할인율 레드
                            }}
                          >
                            {`${Math.round(deal.discountRate)}%`}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "#166534", // ✅ 메인 가격 그린
                          }}
                        >
                          {formatPrice(deal.dealPrice)}
                        </span>
                        {deal.originPrice != null && (
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "#9ca3af",
                              textDecoration: "line-through",
                            }}
                          >
                            {formatPrice(deal.originPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 진행률 바 */}
                    <BarProgress
                      currentQuantity={deal.currentQuantity || 0}
                      minMemberCount={deal.minMemberCount || 0}
                    />

                    {/* 하단 정보 */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color:
                            remainingText === "마감"
                              ? "#9ca3af"
                              : remainingText.startsWith("곧 마감") ||
                                remainingText.startsWith("오늘")
                              ? "#b91c1c" // 🔴 임박은 레드
                              : "#16a34a", // ✅ 여유는 그린
                        }}
                      >
                        {remainingText}
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          borderRadius: "999px",
                          backgroundColor: "#14532d",
                          border: "none",
                          padding: "7px 16px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#ffffff",
                          boxShadow: "0 8px 20px rgba(15,23,42,0.18)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(deal.groupDealId);
                        }}
                      >
                        공동구매 상세보기
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GroupDealListLayout>
  );
}

export default GroupDealListPage;
