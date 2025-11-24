// src/pages/groupdeal/GroupDealListPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GroupDealTimer from "../../components/groupdeal/GroupDealTimer";
import { getGroupDealList } from "../../api/groupDealApi";

const PRIMARY_DEEP_GREEN = "#166534";
const ACCENT_ORANGE = "#E65100";

function GroupDealListPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortOption, setSortOption] = useState("latest"); // latest | ending | discount

  // 리스트 조회 + 정규화 (가격/이미지/인원)
  useEffect(() => {
    async function fetchList() {
      try {
        setLoading(true);
        setError(null);

        const data = await getGroupDealList();

        const normalized = (data || []).map((deal) => {
          const originPrice =
            deal.originPrice != null ? Number(deal.originPrice) : 0;
          const dealPrice =
            deal.dealPrice != null ? Number(deal.dealPrice) : 0;
          const discountRate =
            deal.discountRate != null ? Number(deal.discountRate) : 0;

          const legacyMainImage =
            deal.mainImagePath || deal.imagePath || deal.imageUrl || null;

          const imageUrls =
            deal.imageUrls && deal.imageUrls.length > 0
              ? deal.imageUrls
              : legacyMainImage
              ? [legacyMainImage]
              : [];

          const mainImagePath =
            imageUrls.length > 0 ? imageUrls[0] : legacyMainImage;

          const maxMemberCount =
            deal.maxMemberCount != null
              ? Number(deal.maxMemberCount)
              : deal.minMemberCount != null
              ? Number(deal.minMemberCount)
              : 0;

          const currentMemberCount =
            deal.currentMemberCount != null
              ? Number(deal.currentMemberCount)
              : 0;

          return {
            ...deal,
            originPrice,
            dealPrice,
            discountRate,
            tags: deal.tags || [],
            imageUrls,
            mainImagePath,
            maxMemberCount,
            currentMemberCount,
          };
        });

        setDeals(normalized);
      } catch (e) {
        console.error(e);
        setError(e.message || "공동구매 리스트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchList();
  }, []);

  // 품목(카테고리) 목록: tags[0] 기준
  const categoryOptions = [
    "전체",
    ...Array.from(
      new Set(
        deals
          .map((deal) =>
            deal.tags && deal.tags.length > 0 ? deal.tags[0] : null
          )
          .filter(Boolean)
      )
    ),
  ];

  // 필터 + 정렬 적용된 리스트
  const visibleDeals = [...deals]
    .filter((deal) =>
      selectedCategory === "전체"
        ? true
        : deal.tags && deal.tags.includes(selectedCategory)
    )
    .sort((a, b) => {
      if (sortOption === "latest") {
        return (b.groupDealId || 0) - (a.groupDealId || 0);
      }
      if (sortOption === "ending") {
        return new Date(a.endAt) - new Date(b.endAt);
      }
      if (sortOption === "discount") {
        return (b.discountRate || 0) - (a.discountRate || 0);
      }
      return 0;
    });

  const sortLabel = {
    latest: "최신순",
    ending: "마감 임박순",
    discount: "할인율순",
  }[sortOption];

  if (loading) {
    return (
      <div className="container my-4">
        <p>공동구매 리스트를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* 상단 타이틀 + 필터/정렬 바 */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">
          공동구매{" "}
          <span className="text-muted" style={{ fontSize: "0.9rem" }}>
            ({visibleDeals.length})
          </span>
        </h2>

        <div className="d-flex align-items-center gap-3">
          {/* 필터 토글 */}
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none text-dark d-flex align-items-center gap-1"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <span className="fw-semibold">
              {showFilter ? "필터 숨기기" : "필터 표시"}
            </span>
            <span style={{ fontSize: "0.9rem" }}>⚙</span>
          </button>

          {/* 정렬 기준 셀렉트 */}
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">정렬 기준:</span>
            <select
              className="form-select form-select-sm border-0 fw-semibold"
              style={{
                width: "auto",
                paddingRight: "2rem",
                boxShadow: "none",
                backgroundColor: "transparent",
              }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="ending">마감 임박순</option>
              <option value="discount">할인율순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 본문 레이아웃: 왼쪽 필터 + 오른쪽 카드 리스트 */}
      <div className="row">
        {/* 왼쪽 필터 사이드바 */}
        {showFilter && (
          <div className="col-lg-3 mb-4">
            <div className="border-end pe-3">
              <h6 className="fw-bold mb-3">품목</h6>
              <ul className="list-unstyled small mb-0">
                {categoryOptions.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <li key={cat} className="mb-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={
                          active
                            ? "w-100 text-start fw-semibold btn btn-sm"
                            : "w-100 text-start btn btn-sm btn-light"
                        }
                        style={
                          active
                            ? {
                                background:
                                  "linear-gradient(90deg, #81c408, #a3e635)",
                                borderColor: "transparent",
                                color: "#1f2933",
                              }
                            : {
                                backgroundColor: "#f8f9fa",
                                borderColor: "transparent",
                              }
                        }
                      >
                        {cat}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* 오른쪽 카드 리스트 영역 */}
        <div className={showFilter ? "col-lg-9" : "col-12"}>
          <div className="row">
            {visibleDeals.length === 0 && (
              <div className="col-12">
                <p className="text-muted small mb-0">
                  조건에 맞는 공동구매가 없습니다.
                </p>
              </div>
            )}

            {visibleDeals.map((deal) => {
              const {
                groupDealId,
                productName,
                region,
                originPrice,
                dealPrice,
                discountRate,
                rating,
                reviewCount,
                endAt,
                tags,
                mainImagePath,
                currentMemberCount,
                maxMemberCount,
              } = deal;

              const soloPrice = originPrice;
              const groupPrice = dealPrice;

              const saveAmount =
                typeof soloPrice === "number" &&
                typeof groupPrice === "number" &&
                soloPrice > groupPrice
                  ? soloPrice - groupPrice
                  : 0;

              const savePercent =
                saveAmount > 0
                  ? Math.round((saveAmount / soloPrice) * 100)
                  : discountRate;

              const progressPercent =
                maxMemberCount && maxMemberCount > 0
                  ? (currentMemberCount / maxMemberCount) * 100
                  : 0;

              const image =
                mainImagePath ||
                deal.imagePath ||
                deal.imageUrl ||
                deal.mainImagePath ||
                null;

              return (
                <div key={groupDealId} className="col-md-4 mb-4">
                  <Link
                    to={`/groupdeal/${groupDealId}`}
                    className="text-decoration-none text-dark"
                  >
                    <div className="card h-100 shadow-sm">
                      {/* 이미지 */}
                      <div className="position-relative">
                        <div className="ratio ratio-1x1 bg-light">
                          {mainImagePath && (
                            <img
                              src={mainImagePath}
                              alt={deal.productName}
                              style={{ objectFit: "cover", width: "100%", height: "100%" }}
                            />
                          )}
                        </div>
                        {savePercent > 0 && (
                          <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-danger text-white small rounded">
                            {savePercent}% OFF
                          </div>
                        )}
                      </div>

                      {/* 내용 */}
                      <div className="card-body d-flex flex-column">
                        <div className="small text-muted mb-1">{region}</div>
                        <h6 className="card-title mb-1">{productName}</h6>

                        {/* 가격 + 할인 퍼센트 (디테일 스타일 맞추기) */}
                        <div className="mb-1 d-flex align-items-baseline">
                          {savePercent > 0 && (
                            <span
                              className="fw-bold me-2"
                              style={{
                                color: ACCENT_ORANGE,
                                fontSize: "1.1rem",
                                letterSpacing: "-0.03em",
                              }}
                            >
                              {savePercent}%
                            </span>
                          )}
                          <span
                            className="fw-bold"
                            style={{
                              fontSize: "1.1rem",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            {groupPrice.toLocaleString()}원
                          </span>
                        </div>
                        <div className="text-muted small mb-2">
                          <span className="text-decoration-line-through me-2">
                            {soloPrice.toLocaleString()}원
                          </span>
                          {saveAmount > 0 && (
                            <span>
                              함께 구매 시 {saveAmount.toLocaleString()}원 절약
                            </span>
                          )}
                        </div>

                        {/* 태그 */}
                        {tags && tags.length > 0 && (
                          <div className="mb-2">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="badge bg-light text-dark border me-1 small"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 진행 바 + 인원/마감일 (디테일 스타일 공유) */}
                        <div className="mb-2">
                          <div
                            className="progress mb-1"
                            style={{
                              height: "6px",
                              backgroundColor: "#f1f1f1",
                              borderRadius: "10px",
                            }}
                          >
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${progressPercent}%`,
                                background:
                                  "linear-gradient(90deg, #166534 0%, #15803d 50%, #4ade80 100%)",
                                borderRadius: "10px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                          <div className="d-flex justify-content-between small text-muted">
                            <span>
                              {currentMemberCount}/{maxMemberCount}명 참여중
                            </span>
                            {endAt && (
                              <span>
                                마감:{" "}
                                {endAt.includes("T")
                                  ? endAt.split("T")[0]
                                  : endAt}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 하단: 평점 + 타이머 */}
                        <div className="mt-auto d-flex justify-content-between align-items-center small text-muted">
                          <span>
                            ⭐ {rating ?? "-"} ({reviewCount ?? 0})
                          </span>
                          {endAt && <GroupDealTimer endAt={endAt} />}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDealListPage;
