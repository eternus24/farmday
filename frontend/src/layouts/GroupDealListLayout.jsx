// 경로: frontend/src/layouts/GroupDealListLayout.jsx

import React from "react";

const HERO_BG_URL =
  "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// 필터 사이드바에 사용할 카테고리 목록 (이모지 + 라벨)
const CATEGORY_ITEMS = [
  { value: "과일/견과", label: "과일/견과", icon: "🍎" },
  { value: "채소/버섯", label: "채소/버섯", icon: "🥦" },
  { value: "곡물/콩류", label: "곡물/콩류", icon: "🌾" },
  { value: "수산물/해산물", label: "수산물/해산물", icon: "🐟" },
  { value: "축산물/육류", label: "축산물/육류", icon: "🥩" },
];

function GroupDealListLayout({
  dealsCount,
  categoryOptions, // props는 그대로 두되, 현재는 CATEGORY_ITEMS 사용
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortOptionChange,
  showFilter,
  onToggleFilter,
  children,
}) {
  const handleScrollToList = () => {
    const el = document.getElementById("group-deal-list");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fdf7e3",
        minHeight: "100vh",
        paddingBottom: 60,
      }}
    >
      {/* 상단 히어로 섹션 */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "0 0 32px 32px",
          backgroundColor: "#022c22",
          color: "#fff",
        }}
      >
        {/* 배경 이미지 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HERO_BG_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.7)",
          }}
        />
        {/* 오버레이 그라디언트 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(6,95,70,0.92) 0%, rgba(6,78,59,0.7) 40%, rgba(6,95,70,0.1) 100%)",
          }}
        />

        <div className="container">
          <div
            className="row"
            style={{
              paddingTop: 70,
              paddingBottom: 80,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div className="col-12 col-lg-6 d-flex flex-column justify-content-center">
              <p
                style={{
                  fontSize: "0.9rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  opacity: 0.9,
                }}
              >
                Today&apos;s Group Purchase
              </p>
              <h1
                style={{
                  fontWeight: 800,
                  fontSize: "2.1rem",
                  lineHeight: 1.25,
                  marginBottom: 12,
                  color: "#ffffff",
                }}
              >
                신선한 산지직송을
                <br />
                공동구매로 더 합리하게
              </h1>
              <p
                style={{
                  fontSize: "0.95rem",
                  maxWidth: 420,
                  marginBottom: 20,
                  opacity: 0.95,
                }}
              >
                생산자 최소 마진을 지키면서, 소비자는 시세보다 합리적인
                가격으로 신선한 농산물을 받아볼 수 있어요.
              </p>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-lg"
                  style={{
                    borderRadius: "999px",
                    padding: "10px 28px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    backgroundColor: "#14532d",
                    border: "none",
                    color: "#ffffff",
                    boxShadow: "0 10px 25px rgba(15,23,42,0.35)",
                  }}
                  onClick={handleScrollToList}
                >
                  공동구매 보러가기
                </button>
                <span
                  className="small"
                  style={{ opacity: 0.9, fontWeight: 500 }}
                >
                  진행 중인 공동구매{" "}
                  <strong>{dealsCount}</strong>건
                </span>
              </div>
            </div>

            {/* 오른쪽 여백 (디자인용) */}
            <div className="d-none d-lg-block col-lg-6" />
          </div>
        </div>
      </section>

      {/* 아래 필터 + 리스트 영역 */}
      <div className="container" style={{ marginTop: 32 }}>
        {/* 상단 필터/정렬 바 */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <h2
              className="mb-0"
              style={{ fontSize: "1.4rem", fontWeight: 800, color: "#14532d" }}
            >
              공동구매 리스트
            </h2>
            <span className="text-muted" style={{ fontSize: "0.9rem" }}>
              ({dealsCount})
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* 필터 토글 */}
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none text-dark d-flex align-items-center gap-1"
              onClick={onToggleFilter}
            >
              <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                {showFilter ? "필터 숨기기" : "필터 표시"}
              </span>
              <span style={{ fontSize: "0.9rem" }}>⚙</span>
            </button>

            {/* 정렬 기준 셀렉트 */}
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">정렬 기준</span>
              <select
                className="form-select form-select-sm fw-semibold"
                style={{
                  width: "auto",
                  paddingRight: "2rem",
                  boxShadow: "none",
                  borderRadius: "999px",
                  borderColor: "#d1d5db",
                  backgroundColor: "#ffffff",
                }}
                value={sortOption}
                onChange={(e) => onSortOptionChange(e.target.value)}
              >
                <option value="latest">최신순</option>
                <option value="ending">마감 임박순</option>
                <option value="discount">할인율순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 본문 레이아웃: 왼쪽 필터 + 오른쪽 콘텐츠(children) */}
        <div className="row" id="group-deal-list">
          {/* 왼쪽 필터 사이드바 */}
          {showFilter && (
            <div className="col-lg-3 mb-4">
              <div className="pe-lg-3">
                {/* 제목 + 아이콘 */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span
                    style={{
                      fontSize: "1.1rem",
                      lineHeight: 1,
                    }}
                  >
                    ☰
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#14532d",
                    }}
                  >
                    카테고리
                  </span>
                </div>

                {/* 카테고리 리스트 */}
                <ul className="list-unstyled small mb-0">
                  {CATEGORY_ITEMS.map((item) => {
                    const active = selectedCategory === item.value;
                    return (
                      <li key={item.value} className="mb-2">
                        <button
                          type="button"
                          onClick={() => onCategoryChange(item.value)}
                          className="w-100 d-flex align-items-center gap-2 btn btn-sm border-0 bg-transparent"
                          style={{
                            paddingLeft: 0,
                            paddingRight: 0,
                            color: active ? "#14532d" : "#6b7280",
                            fontWeight: active ? 600 : 500,
                          }}
                        >
                          {/* 체크박스 모양 */}
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              border: active
                                ? "0"
                                : "1px solid rgba(148,163,184,0.9)",
                              backgroundColor: active ? "#14532d" : "transparent",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              color: "#ffffff",
                            }}
                          >
                            {active ? "✓" : ""}
                          </span>
                          {/* 이모지 + 라벨 */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span style={{ fontSize: "0.9rem" }}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* 오른쪽 카드 리스트 영역 (children) */}
          <div className={showFilter ? "col-lg-9" : "col-12"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDealListLayout;
