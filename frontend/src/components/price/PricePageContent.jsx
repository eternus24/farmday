// src/components/price/PricePageContent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchTodaySummary } from "../../api/priceApi";
import "./price.css";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";


const PRICE_HERO_BG_URL = "https://themewagon.github.io/organic/images/banner-1.jpg";

function formatNumber(num) {
  if (num == null) return "-";
  return Number(num).toLocaleString("ko-KR");
}

// 상단 추천 큰 카드
function BigRecommendationCard({ card }) {
  const rate = card.diffRate ?? 0;
  const absRate = Math.abs(rate).toFixed(1);

  let line2 = "오늘은 조금 싸요 🙂";
  let line3 = `평소보다 ${absRate}% 내려갔어요`;
  let line4 = "지금 사두셔도 괜찮아요.";

  if (rate <= -20) {
    line2 = "오늘 엄청 싸요 👍";
    line3 = `평소보다 ${absRate}% 내려갔어요`;
    line4 = "지금 사면 정말 이득이에요!";
  } else if (rate <= -10) {
    line2 = "오늘 많이 싸요 👍";
    line3 = `평소보다 ${absRate}% 내려갔어요`;
    line4 = "장 볼 때 같이 담기 좋아요.";
  } else if (rate <= -5) {
    line2 = "오늘은 조금 싸요 🙂";
    line3 = `평소보다 ${absRate}% 내려갔어요`;
    line4 = "지금 사두셔도 괜찮아요.";
  } else {
    line2 = "가격이 많이 나쁘지 않아요 🙂";
    line3 = "평소와 비슷한 편이에요.";
    line4 = "필요하시면 오늘 구매해도 괜찮아요.";
  }

  return (
    <div
      style={{
        borderRadius: "16px",
        background:
          "linear-gradient(135deg, rgba(45,180,107,0.12), rgba(255,140,26,0.08))",
        padding: "14px 14px 12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 110,
      }}
    >
      <div style={{ fontSize: "15px", fontWeight: 700 }}>
        {card.productName}{" "}
        {card.unit && (
          <span style={{ fontSize: "12px", opacity: 0.85 }}>({card.unit})</span>
        )}
      </div>
      <div style={{ fontSize: "13px" }}>{line2}</div>
      <div style={{ fontSize: "13px" }}>{line3}</div>
      <div style={{ fontSize: "13px" }}>{line4}</div>
    </div>
  );
}

// 전체 시세 카드
function PriceCard({ card }) {
  const up = card.up;
  const diffRate = card.diffRate || 0;
  const diffPrice = card.diffPrice || 0;

  const diffClass = diffRate === 0 ? "" : up ? "price-up" : "price-down";

  return (
    <div className="price-card">
      <div className="price-card-title">{card.productName}</div>
      <div className="price-card-unit">{card.unit}</div>
      <div className="price-card-price">{formatNumber(card.todayPrice)}원</div>
      <div className={`price-card-diff ${diffClass}`}>
        <span className="price-arrow-circle">
          {diffRate === 0 ? "·" : up ? "▲" : "▼"}
        </span>
        {diffRate === 0 ? (
          <span>보합 (0%)</span>
        ) : (
          <>
            <span>
              {(up ? "" : "-") + formatNumber(diffPrice)}
              원
            </span>
            <span>({diffRate.toFixed(1)}%)</span>
          </>
        )}
      </div>
    </div>
  );
}

// 미니 추세 그래프 툴팁
function TrendTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "10px",
        padding: "8px 10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: "12px",
        color: "#222",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>최근 추세</div>
      <div>지수: {formatNumber(value)}</div>
    </div>
  );
}

// 공통 섹션 카드
function SectionCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        borderRadius: "16px",
        background: "#ffffff",
        padding: "18px 18px 14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          marginBottom: subtitle ? 4 : 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <p
          className="price-section-sub"
          style={{ marginBottom: 10, marginTop: 0 }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

// 랭킹 리스트 아이템
function RankRow({ index, item, type }) {
  const rate = item.diffRate || 0;
  const absRate = Math.abs(rate).toFixed(1);

  let line = "";
  if (type === "down") {
    line =
      "오늘은 가격이 많이 내려가서 장 볼 때 같이 담기 좋은 날이에요.";
  } else {
    line = "오늘은 가격이 올라서, 급하지 않다면 조금 기다려도 좋아요.";
  }

  return (
    <div
      style={{
        padding: "7px 0",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: "999px",
            background:
              index === 0 ? "#ff8c1a" : "rgba(255,140,26,0.12)",
            color: index === 0 ? "#fff" : "#ff8c1a",
            fontSize: 12,
            fontWeight: 700,
            marginRight: 8,
          }}
        >
          {index + 1}
        </span>
        <b>{item.productName}</b>{" "}
        {item.unit && (
          <span style={{ fontSize: 12, opacity: 0.8 }}>({item.unit})</span>
        )}
        <span
          style={{
            fontSize: 12,
            marginLeft: 6,
            color: type === "down" ? "#2db46b" : "#ff8c1a",
          }}
        >
          {type === "down" ? "-" : "+"}
          {absRate}%
        </span>
      </div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>{line}</div>
    </div>
  );
}

// 카테고리별 리스트
function CategoryBlock({ title, emoji, items }) {
  if (!items.length) return null;

  return (
    <div
      style={{
        borderRadius: 16,
        background: "#ffffff",
        padding: "14px 16px 12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 8,
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>{emoji}</span>
        <span>{title}</span>
      </div>
      <div style={{ fontSize: 13 }}>
        {items.map((card) => (
          <div
            key={card.productName + card.unit}
            style={{
              padding: "6px 0",
              borderBottom: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <div>
              <b>{card.productName}</b>{" "}
              {card.unit && (
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  ({card.unit})
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              {formatNumber(card.todayPrice)}원{" "}
              {card.diffRate != null && card.diffRate !== 0 && (
                <span
                  style={{
                    marginLeft: 4,
                    color: card.up ? "#ff8c1a" : "#2db46b",
                  }}
                >
                  {card.up ? "▲" : "▼"}
                  {Math.abs(card.diffRate).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricePageContent() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchTodaySummary()
      .then((data) => {
        if (mounted) setSummary(data);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError("시세 정보를 불러오지 못했습니다.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const falling = summary?.topFallingItems || [];
  const rising = summary?.topRisingItems || [];
  const allItems = summary?.allItems || [];

  // 절약액 계산용 (상위 3개 하락품목)
  const savingItems = falling.slice(0, 3);
  const totalSaved = savingItems.reduce((sum, item) => {
    if (item && !item.up && item.diffPrice) {
      return sum + item.diffPrice;
    }
    return sum;
  }, 0);

  // 하락/상승 랭킹
  const fallingRank = falling.slice(0, 3);
  const risingRank = rising.slice(0, 3);

  // 미니 추세 그래프용 더미 데이터
  const miniDownTrend = [
    { t: 1, v: 120 },
    { t: 2, v: 110 },
    { t: 3, v: 100 },
    { t: 4, v: 90 },
    { t: 5, v: 80 },
  ];
  const miniUpTrend = [
    { t: 1, v: 80 },
    { t: 2, v: 90 },
    { t: 3, v: 105 },
    { t: 4, v: 115 },
    { t: 5, v: 130 },
  ];

  // 카테고리 분류 (이름 기준 간단 매핑)
  const categoryGroups = useMemo(() => {
    const groups = {
      vegetable: [],
      fruit: [],
      grain: [],
      meat: [],
      other: [],
    };

    allItems.forEach((card) => {
      const name = card.productName || "";
      let key = "other";

      // 채소류
      if (
        ["배추", "양파", "대파", "상추", "오이", "무", "고추", "파", "깻잎"].some(
          (k) => name.indexOf(k) !== -1
        )
      ) {
        key = "vegetable";
      }
      // 과일류
      else if (
        ["사과", "배", "딸기", "귤", "포도", "바나나", "오렌지", "참외"].some(
          (k) => name.indexOf(k) !== -1
        )
      ) {
        key = "fruit";
      }
      // 식량작물
      else if (
        ["쌀", "현미", "보리", "옥수수", "감자", "고구마"].some(
          (k) => name.indexOf(k) !== -1
        )
      ) {
        key = "grain";
      }
      // 축산물
      else if (
        ["소고기", "돼지고기", "닭고기", "계란", "계란(특란)", "목심", "삼겹"].some(
          (k) => name.indexOf(k) !== -1
        )
      ) {
        key = "meat";
      }

      groups[key].push(card);
    });

    return groups;
  }, [allItems]);

  const handleScrollToMain = () => {
    const el = document.getElementById("price-main-content");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (error) {
    return (
      <div className="price-page">
        <h2 className="price-section-title">농산물 시세</h2>
        <p>{error}</p>
      </div>
    );
  }

  // ───────────────── 로딩 상태 ─────────────────
  if (!summary) {
    return (
      <>
        {/* 로딩 중에도 히어로는 보여줌 */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "0 0 32px 32px",
            // 🔸 노랑+오렌지 톤 베이스
            backgroundColor: "#f97316",
            color: "#fff",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${PRICE_HERO_BG_URL})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.9)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              // 🔸 왼쪽은 진한 오렌지, 중간에 초록, 오른쪽은 투명 → 노란 배경이 보이게
              background:
                "linear-gradient(90deg, rgba(249,115,22,0.96) 0%, rgba(34,197,94,0.88) 32%, rgba(255,255,255,0.0) 100%)",
            }}
          />

          <div className="container">
            <div
              className="row"
              style={{
                paddingTop: 70,
                paddingBottom: 70,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div className="col-12 col-lg-7 d-flex flex-column justify-content-center">
                <p
                  style={{
                    fontSize: "0.9rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    opacity: 0.9,
                  }}
                >
                  Today&apos;s Market
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
                  오늘 장보러 가기 전에
                  <br />
                  농산물 시세부터 확인해 보세요
                </h1>
                <p
                  style={{
                    fontSize: "0.95rem",
                    maxWidth: 460,
                    marginBottom: 20,
                    opacity: 0.95,
                  }}
                >
                  지금 사면 이득인 품목과, 전체 가격 분위기를 한눈에
                  정리해드려요. 복잡한 차트 대신, 아줌마 눈높이에 맞춘
                  친절한 설명으로 보여드릴게요.
                </p>
                <div className="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-lg"
                    style={{
                      borderRadius: "999px",
                      padding: "10px 26px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      backgroundColor: "#22c55e",
                      border: "none",
                      color: "#ffffff",
                      boxShadow: "0 10px 24px rgba(15,23,42,0.3)",
                    }}
                    onClick={handleScrollToMain}
                  >
                    오늘 시세 살펴보기
                  </button>
                  <span
                    className="small"
                    style={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    오늘 장바구니에{" "}
                    <strong>얼마나 아낄 수 있는지</strong> 알려드려요
                  </span>
                </div>
              </div>
              <div className="d-none d-lg-block col-lg-5" />
            </div>
          </div>
        </section>

        <div className="price-page">
          <h2 className="price-section-title">농산물 시세</h2>
          <p>시세 불러오는 중입니다...</p>
        </div>
      </>
    );
  }

  // ───────────────── 실제 데이터 렌더링 ─────────────────
  return (
    <>
      {/* 상단 히어로 섹션 */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "0 0 32px 32px",
          backgroundColor: "#f97316",
          color: "#fff",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${PRICE_HERO_BG_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.9)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(249,115,22,0.96) 0%, rgba(34,197,94,0.88) 32%, rgba(255,255,255,0.0) 100%)",
          }}
        />

        <div className="container">
          <div
            className="row"
            style={{
              paddingTop: 70,
              paddingBottom: 70,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div className="col-12 col-lg-7 d-flex flex-column justify-content-center">
              <p
                style={{
                  fontSize: "0.9rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  opacity: 0.9,
                }}
              >
                Today&apos;s Market
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
                신선한 장보기,
                <br />
                오늘 가격부터 먼저 확인해요
              </h1>
              <p
                style={{
                  fontSize: "0.95rem",
                  maxWidth: 460,
                  marginBottom: 20,
                  opacity: 0.95,
                }}
              >
                오늘 뭐 사면 이득인지, 어느 품목이 많이 올랐는지,
                전체적으로 싼 날인지까지 한 번에 볼 수 있도록 정리해 두었어요.
              </p>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-lg"
                  style={{
                    borderRadius: "999px",
                    padding: "10px 26px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    backgroundColor: "#22c55e",
                    border: "none",
                    color: "#ffffff",
                    boxShadow: "0 10px 24px rgba(15,23,42,0.3)",
                  }}
                  onClick={handleScrollToMain}
                >
                  오늘 시세 살펴보기
                </button>
                <span
                  className="small"
                  style={{ opacity: 0.9, fontWeight: 500 }}
                >
                  오늘 기준으로 <strong>추천 장보기</strong>도 같이 보여드려요
                </span>
              </div>
            </div>
            <div className="d-none d-lg-block col-lg-5" />
          </div>
        </div>
      </section>

      {/* 메인 시세 컨텐츠 */}
      <div className="price-page" id="price-main-content">
        {/* 이하 나머지 부분은 이전과 동일 */}
        {/* 상단 인트로 문단 */}
        <div style={{ marginBottom: 12 }}>
          <h2 className="price-section-title" style={{ marginBottom: 4 }}>
            오늘 뭐가 궁금하세요?
          </h2>
          <p className="price-section-sub" style={{ marginBottom: 4 }}>
            오늘 장 보러 가기 전에, 지금 사면 이득인 품목과 전체 분위기를
            한눈에 볼 수 있게 정리해 드렸어요.
          </p>
          <div
            style={{
              fontSize: 13,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 4,
            }}
          >
            <span>🛒 오늘 뭐 사면 이득일까요?</span>
            <span>· 💸 오늘 얼마나 아낄 수 있을까요?</span>
            <span>· 📉📈 오늘 급락·급등한 품목이 있나요?</span>
            <span>· 🙂 오늘은 전체적으로 어떤 분위기인가요?</span>
          </div>
        </div>

        {/* Q1: 오늘 뭐 사면 이득일까요? */}
        <SectionCard
          title="🛒 오늘 뭐 사면 이득일까요?"
          subtitle="오늘 가격이 많이 내려간 품목을 먼저 보여드리고, 장바구니에 담기 좋은 품목을 한눈에 볼 수 있도록 구성했어요."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
              gap: "14px",
            }}
          >
            {falling.slice(0, 4).map((card) => (
              <BigRecommendationCard
                key={card.productName + card.unit}
                card={card}
              />
            ))}
            {falling.length === 0 && (
              <div style={{ fontSize: 13 }}>
                오늘은 눈에 띄게 많이 내려간 품목이 없어요.
              </div>
            )}
          </div>
        </SectionCard>

        {/* Q2 + Q3: 2컬럼 배치 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)",
            gap: 18,
            marginBottom: 8,
          }}
        >
          {/* Q2: 오늘 얼마나 아낄 수 있을까요? */}
          <SectionCard
            title="💸 오늘 얼마나 아낄 수 있을까요?"
            subtitle="추천드린 품목 몇 가지만 장바구니에 담으셔도, 어제보다 아낄 수 있는 금액을 계산해 드릴게요."
          >
            {savingItems.length === 0 ? (
              <div style={{ fontSize: 13 }}>
                하락 폭이 큰 품목이 적어서, 오늘은 절약액 계산이 어려워요.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  예를 들어, 오늘 아래 품목들을 1개씩만 사셔도…
                </div>
                <div style={{ fontSize: 13 }}>
                  {savingItems.map((item) => (
                    <div
                      key={item.productName + item.unit}
                      style={{
                        padding: "4px 0",
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <span>
                        {item.productName}{" "}
                        {item.unit && (
                          <span style={{ fontSize: 11, opacity: 0.8 }}>
                            ({item.unit})
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: 12 }}>
                        어제보다{" "}
                        <b>{formatNumber(item.diffPrice || 0)}원</b> 절약
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0b3b2a",
                  }}
                >
                  오늘은 대략{" "}
                  <span style={{ color: "#ff8c1a" }}>
                    {formatNumber(totalSaved)}원
                  </span>{" "}
                  정도 아끼실 수 있어요 🙂
                </div>
              </>
            )}
          </SectionCard>

          {/* Q3: 오늘 급락·급등한 품목이 있나요? */}
          <SectionCard title="📉📈 오늘 급락·급등한 품목이 있나요?">
            <div style={{ fontSize: 14 }}>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>
                📉 오늘 갑자기 싸진 품목
              </div>
              {fallingRank.length === 0 ? (
                <div style={{ fontSize: 12, marginBottom: 10 }}>
                  급격히 내려간 품목은 아직 없어요.
                </div>
              ) : (
                fallingRank.map((item, idx) => (
                  <RankRow
                    key={item.productName + item.unit}
                    index={idx}
                    item={item}
                    type="down"
                  />
                ))
              )}

              <div
                style={{
                  marginTop: 12,
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                📈 오늘은 조금 아쉬운 품목
              </div>
              {risingRank.length === 0 ? (
                <div style={{ fontSize: 12 }}>
                  눈에 띄게 많이 오른 품목은 아직 없어요.
                </div>
              ) : (
                risingRank.map((item, idx) => (
                  <RankRow
                    key={item.productName + item.unit}
                    index={idx}
                    item={item}
                    type="up"
                  />
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Q4: 전체 분위기 + 미니 그래프 */}
        <SectionCard
          title="🙂 오늘은 전체적으로 어떤 분위기인가요?"
          subtitle="그래프는 어렵게 보지 마시고, 요즘 가격이 대체로 내려가는지 올라가는지만 가볍게 확인해 보시면 돼요."
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "18px",
            }}
          >
            <div style={{ flex: "1", minWidth: "280px" }}>
              <div style={{ height: 90 }}>
                <ResponsiveContainer>
                  <LineChart data={miniDownTrend}>
                    <Tooltip
                      content={<TrendTooltip />}
                      cursor={{
                        stroke: "rgba(0,0,0,0.1)",
                        strokeWidth: 1,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: 14, marginTop: 8 }}>
                요즘 전체적으로는{" "}
                <b style={{ color: "#22c55e" }}>조금 내려가는 편</b>이에요 👍
                <br />
                기본 식재료 위주로 장을 보시기에는 나쁘지 않은 날이에요.
              </div>
            </div>

            <div style={{ flex: "1", minWidth: "280px" }}>
              <div style={{ height: 90 }}>
                <ResponsiveContainer>
                  <LineChart data={miniUpTrend}>
                    <Tooltip
                      content={<TrendTooltip />}
                      cursor={{
                        stroke: "rgba(0,0,0,0.1)",
                        strokeWidth: 1,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: 14, marginTop: 8 }}>
                다만 일부 신선식품은{" "}
                <b style={{ color: "#f97316" }}>조금씩 올라가는 중</b>이에요 😥
                <br />
                급하지 않은 재료라면 조금 더 지켜보셨다가 구입하셔도
                괜찮아요.
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 전체 시세 접기/펼치기 */}
        <div style={{ marginTop: 10 }}>
          <div className="price-section-title" style={{ marginBottom: 6 }}>
            🔍 자세히 보고 싶으시면
          </div>
          <div className="price-section-sub" style={{ marginBottom: 10 }}>
            채소, 과일, 식량작물, 축산물별로 오늘 시세를 한 번에 모아드렸어요.
            필요하실 때만 아래 버튼을 눌러서 펼쳐보셔도 됩니다.
          </div>
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            style={{
              background: "#f97316",
              color: "#ffffff",
              borderRadius: "999px",
              padding: "10px 22px",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            {showAll ? "전체 시세 접기 ▲" : "오늘 전체 시세 펼쳐서 보기 ▼"}
          </button>
        </div>

        {showAll && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                gap: 16,
              }}
            >
              <CategoryBlock
                title="채소류"
                emoji="🥬"
                items={categoryGroups.vegetable}
              />
              <CategoryBlock
                title="과일류"
                emoji="🍎"
                items={categoryGroups.fruit}
              />
              <CategoryBlock
                title="식량작물"
                emoji="🍚"
                items={categoryGroups.grain}
              />
              <CategoryBlock
                title="축산물"
                emoji="🥩"
                items={categoryGroups.meat}
              />
              <CategoryBlock
                title="기타 품목"
                emoji="🧺"
                items={categoryGroups.other}
              />
            </div>
            {!allItems.length && (
              <div style={{ fontSize: 12, marginTop: 10 }}>
                표시할 시세가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
