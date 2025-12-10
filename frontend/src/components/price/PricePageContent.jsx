// src/components/price/PricePageContent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchTodaySummary } from "../../api/priceApi";
import "./price.css";
import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Cell,
} from "recharts";

const PRICE_HERO_BG_URL =
  "https://themewagon.github.io/organic/images/banner-1.jpg";

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
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
        {card.productName}{" "}
        {card.unit && (
          <span style={{ fontSize: "12px", opacity: 0.85 }}>({card.unit})</span>
        )}
      </div>
      <div style={{ fontSize: "13px", color: "#111827" }}>{line2}</div>
      <div style={{ fontSize: "13px", color: "#111827" }}>{line3}</div>
      <div style={{ fontSize: "13px", color: "#111827" }}>{line4}</div>
    </div>
  );
}

// 티커용 전체 시세 카드 (CSS price-card 사용) – 필요시 사용
function PriceCard({ card }) {
  const up = card.up;
  const diffRate = card.diffRate || 0;
  const diffPrice = card.diffPrice || 0;

  const diffClass =
    diffRate === 0 ? "price-neutral" : up ? "price-up" : "price-down";

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
          fontWeight: 800,
          marginBottom: subtitle ? 4 : 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#111827",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <p
          className="price-section-sub"
          style={{ marginBottom: 10, marginTop: 0, color: "#4b5563" }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

// 랭킹 리스트 아이템 (급락/급등)
function RankRow({ index, item, type }) {
  const rate = item.diffRate || 0;
  const absRate = Math.abs(rate).toFixed(1);
  const isDown = type === "down";

  const accentColor = isDown ? "#16a34a" : "#f97316";
  const badgeBg = isDown
    ? "rgba(22,163,74,0.08)"
    : "rgba(249,115,22,0.08)";

  let line = "";
  if (isDown) {
    line =
      "오늘은 가격이 많이 내려가서 장 볼 때 같이 담기 좋은 날이에요.";
  } else {
    line = "오늘은 가격이 올라서, 급하지 않다면 조금 기다려도 좋아요.";
  }

  return (
    <div
      style={{
        padding: "8px 0",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {/* 1줄: 순위 + 품목 + 변동률 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* 순위 동그라미 */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "999px",
              background: accentColor,
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {item.productName}{" "}
              {item.unit && (
                <span
                  style={{
                    fontSize: 12,
                    opacity: 0.8,
                    marginLeft: 4,
                  }}
                >
                  ({item.unit})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 변동률 뱃지 */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: accentColor,
            background: badgeBg,
            padding: "4px 10px",
            borderRadius: 999,
            minWidth: 80,
            textAlign: "center",
          }}
        >
          {isDown ? "▼" : "▲"} {absRate}%
        </div>
      </div>

      {/* 2줄: 설명 */}
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
        }}
      >
        {line}
      </div>
    </div>
  );
}

// 펼치기용 카테고리별 카드 (맨 아래 "전체 시세"용)
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
          color: "#111827",
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
            <div style={{ color: "#111827" }}>
              <b>{card.productName}</b>{" "}
              {card.unit && (
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  ({card.unit})
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, color: "#111827" }}>
              {formatNumber(card.todayPrice)}원{" "}
              {card.diffRate != null && card.diffRate !== 0 && (
                <span
                  style={{
                    marginLeft: 4,
                    color: card.up ? "#dc2626" : "#16a34a",
                    fontWeight: 600,
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

/* ============================
   💸 섹션용 카테고리 탭 정의
   ============================ */
const categoryTabs = [
  { key: "vegetable", label: "채소류", emoji: "🥒" },
  { key: "fruit", label: "과일류", emoji: "🍓" },
  { key: "grain", label: "식량작물", emoji: "🍚" },
  { key: "meat", label: "축산물", emoji: "🥩" },
  { key: "other", label: "기타 품목", emoji: "🧺" },
];

// 💸 섹션 안에서 쓰는 탭 패널 (상단 탭 + 5개 리스트)
function CategoryTabPanel({ title, emoji, items }) {
  const top5 = (items || []).slice(0, 5);

  if (!top5.length) {
    return (
      <div style={{ fontSize: 13, color: "#6b7280" }}>
        아직 이 분류에는 시세가 등록된 품목이 없어요.
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          marginBottom: 8,
          color: "#4b5563",
        }}
      >
        {emoji} {title} 중에서 오늘 시세가 등록된 품목이에요.
      </div>

      {top5.map((item, idx) => {
        const diffPrice = item.diffPrice || 0;
        const isDown = !item.up && diffPrice > 0;
        const rightText =
          diffPrice === 0
            ? "어제와 거의 비슷해요"
            : isDown
            ? `어제보다 ${formatNumber(diffPrice)}원 절약`
            : `어제보다 ${formatNumber(diffPrice)}원 상승`;

        return (
          <div
            key={item.productName + item.unit}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {/* 왼쪽: 순번 + 품목 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: "999px",
                  border: "1px solid #d1d5db",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#111827",
                  backgroundColor: "#f9fafb",
                }}
              >
                {idx + 1}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 220,
                  }}
                >
                  {item.productName}
                </span>
                {item.unit && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    ({item.unit})
                  </span>
                )}
              </div>
            </div>

            {/* 오른쪽: 절약/상승 문장 */}
            <div
              style={{
                fontSize: 12,
                textAlign: "right",
                color: "#111827",
                whiteSpace: "nowrap",
              }}
            >
              {rightText}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 메인 컴포넌트
export default function PricePageContent() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false); // 맨 아래 전체 시세 펼치기용
  const [selectedCategory, setSelectedCategory] = useState("vegetable"); // 💸 탭 선택

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

  // ✅ 월별 제철 품목 키워드 (필요시 사용)
  const SEASONAL_KEYWORDS_BY_MONTH = {
    1: ["딸기", "한라봉", "감귤", "귤", "배추", "무"],
    2: ["딸기", "한라봉", "감귤", "귤"],
    3: ["딸기", "한라봉", "감귤", "귤", "시금치"],
    4: ["상추", "시금치", "딸기"],
    5: ["오이", "토마토", "상추", "참외"],
    6: ["오이", "토마토", "참외", "수박"],
    7: ["수박", "참외", "토마토", "고추"],
    8: ["수박", "참외", "토마토", "고추"],
    9: ["배", "사과", "고구마", "감자"],
    10: ["배", "사과", "고구마", "감자", "무", "배추"],
    11: ["배", "사과", "귤", "감귤", "무", "배추"],
    12: ["귤", "감귤", "한라봉", "배추", "무"],
  };

  // ✅ 오늘 기준 제철 아이템 목록 (API 부족 보정 + 카테고리 기반 필터링)
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const seasonalItems = useMemo(() => {
    if (!allItems || allItems.length === 0) return [];

    const month = new Date().getMonth() + 1; // 1~12

    // 🔥 월별 제철군 정의
    const SEASONAL_GROUP = {
      12: {
        fruit: ["감귤", "귤", "한라봉", "천혜향", "레드향"],
        vegetable: ["배추", "무"],
      },
      1: {
        fruit: ["딸기", "한라봉", "감귤", "귤"],
        vegetable: ["배추", "무"],
      },
      2: {
        fruit: ["딸기", "한라봉", "감귤", "귤"],
        vegetable: [],
      },
      3: {
        fruit: ["딸기", "감귤"],
        vegetable: ["시금치"],
      },
      // 필요하면 계속 추가 가능
    };

    const seasonal = SEASONAL_GROUP[month] || { fruit: [], vegetable: [] };

    const normalize = (str) => (str || "").toLowerCase().replace(/\s+/g, "");

    // 🔍 제철 키워드 기반 필터
    const matched = allItems.filter((item) => {
      const name = normalize(item.productName);

      return (
        seasonal.fruit.some((k) => name.includes(normalize(k))) ||
        seasonal.vegetable.some((k) => name.includes(normalize(k)))
      );
    });

    // 🔥 만약 매칭되는 제철 품목이 없으면 → fallback로 가격 많이 내려간 품목 추천
    if (matched.length === 0) {
      const fallback = allItems
        .filter((i) => i.diffRate != null)
        .sort((a, b) => (a.diffRate ?? 0) - (b.diffRate ?? 0));

      return fallback.slice(0, 4);
    }

    // 🔥 제철군 매칭 결과가 있으면 → 가격 좋은 순으로 4개
    matched.sort((a, b) => (a.diffRate ?? 0) - (b.diffRate ?? 0));

    return matched.slice(0, 4);
  }, [allItems]);

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

  // 카테고리 분류 (이름 기준 간단 매핑) – 💸 탭 + 아래 펼치기 둘 다 사용
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

      // 🥬 채소류
      if (
        [
          "배추",
          "양파",
          "대파",
          "파",
          "상추",
          "오이",
          "무",
          "고추",
          "깻잎",
          "파프리카",
          "브로콜리",
          "시금치",
          "당근",
          "애호박",
          "가지",
        ].some((k) => name.includes(k))
      ) {
        key = "vegetable";
      }

      // 🍎 과일류
      else if (
        [
          "사과",
          "배",
          "딸기",
          "귤",
          "감귤",
          "포도",
          "바나나",
          "오렌지",
          "참외",
          "수박",
          "한라봉",
          "천혜향",
          "레몬",
          "키위",
          "자두",
          "복숭아",
        ].some((k) => name.includes(k))
      ) {
        key = "fruit";
      }

      // 🍚 식량작물
      else if (
        ["쌀", "현미", "보리", "옥수수", "감자", "고구마", "콩"].some((k) =>
          name.includes(k)
        )
      ) {
        key = "grain";
      }

      // 🥩 축산물
      else if (
        [
          "소고기",
          "돼지고기",
          "닭고기",
          "계란",
          "달걀",
          "삼겹",
          "목심",
          "등심",
          "안심",
          "우유",
        ].some((k) => name.includes(k))
      ) {
        key = "meat";
      }

      groups[key].push(card);
    });

    return groups;
  }, [allItems]);

  // Q4 도넛그래프용 데이터 (지표/문구용) – 그래프에는 사용 안 하지만 분위기 텍스트 계산에 사용
  const upDownDistribution = useMemo(() => {
    let upCount = 0;
    let downCount = 0;
    let flatCount = 0;

    allItems.forEach((item) => {
      if (item.diffRate == null) return;
      if (item.diffRate > 0) upCount += 1;
      else if (item.diffRate < 0) downCount += 1;
      else flatCount += 1;
    });

    return [
      { name: "내린 품목", value: downCount },
      { name: "오른 품목", value: upCount },
      { name: "변화 없음", value: flatCount },
    ];
  }, [allItems]);

  const DONUT_COLORS = ["#22c55e", "#ef4444", "#9ca3af"];

  const downCount = upDownDistribution[0]?.value ?? 0;
  const upCount = upDownDistribution[1]?.value ?? 0;
  const flatCount = upDownDistribution[2]?.value ?? 0;
  // eslint-disable-next-line no-unused-vars
  const totalCount = downCount + upCount + flatCount;

  let moodLabel = "보통 날";
  let moodSentence = "전체적으로는 크게 오르지도 내리지도 않은 편이에요.";
  let actionSentence =
    "급하게 필요하신 것만 골라서 구매하셔도 괜찮은 날이에요.";

  if (downCount > upCount * 1.3) {
    moodLabel = "조금 싼 날";
    moodSentence =
      "내린 품목이 오른 품목보다 더 많아서, 전체적으로는 살짝 내려간 편이에요.";
    actionSentence = "기본 식재료 위주로 장 보시기 좋은 날이에요 👍";
  } else if (upCount > downCount * 1.3) {
    moodLabel = "조금 비싼 날";
    moodSentence =
      "오른 품목이 내린 품목보다 더 많아서, 전체적으로는 살짝 오른 편이에요.";
    actionSentence = "급하지 않은 재료는 며칠 더 지켜보셔도 괜찮아요.";
  }

  // Q4 막대그래프용: 어제 / 1주 전 / 1달 전 대비 평균 변화율 (%)
  const periodCompareData = [
    {
      label: "어제",
      key: "yesterday",
      value: summary?.avgDiffYesterdayPercent ?? -2.3,
    },
    {
      label: "1주 전",
      key: "week",
      value: summary?.avgDiffWeekAgoPercent ?? 1.1,
    },
    {
      label: "1달 전",
      key: "month",
      value: summary?.avgDiffMonthAgoPercent ?? 3.4,
    },
  ];

  // ✅ 카테고리별 평균 변동률 (diffRate) – A안
  const categoryAvgDiffData = useMemo(() => {
    const order = [
      { key: "vegetable", label: "채소류" },
      { key: "fruit", label: "과일류" },
      { key: "grain", label: "식량작물" },
      { key: "meat", label: "축산물" },
      { key: "other", label: "기타" },
    ];

    return order.map(({ key, label }) => {
      const items = categoryGroups[key] || [];
     const valid = items.filter(
        (i) => typeof i.diffRate === "number" && !Number.isNaN(i.diffRate)
      );
      if (!valid.length) {
        return { key, label, value: 0 };
      }
      const sum = valid.reduce((s, it) => s + (it.diffRate ?? 0), 0);
      const avg = sum / valid.length;
      return { key, label, value: Number(avg.toFixed(1)) };
    });
  }, [categoryGroups]);

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

  // ───────── 로딩 상태 ─────────
  if (!summary) {
    return (
      <>
        {/* 로딩 중에도 히어로는 보여줌 */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "0 0 32px 32px",
            backgroundImage: `url(${PRICE_HERO_BG_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#064e3b",
            marginBottom: 24,
          }}
        >
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
                    color: "#064e3b",
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
                      backgroundColor: "#15803d",
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
                    style={{ opacity: 0.9, fontWeight: 600 }}
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

  // ───────── 실제 렌더링 ─────────
  return (
    <>
      {/* 상단 히어로 섹션 */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "0 0 32px 32px",
          backgroundImage: `url(${PRICE_HERO_BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#064e3b",
          marginBottom: 24,
        }}
      >
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
                  color: "#064e3b",
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
                    backgroundColor: "#15803d",
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
                  style={{ opacity: 0.9, fontWeight: 600 }}
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
        {/* 상단 인트로 */}
        <div style={{ marginBottom: 12 }}>
          <h2
            className="price-section-title"
            style={{ marginBottom: 4, color: "#111827" }}
          ></h2>
        </div>

        {/* Q1: 오늘의 제철 아이템 */}
        <SectionCard
          title="🍊 오늘의 제철 아이템"
          subtitle="요즘 제철이라 맛과 식감이 가장 좋은 채소·과일 중에서, 오늘 가격까지 함께 괜찮은 품목을 먼저 보여드려요."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
              gap: "14px",
            }}
          >
            {seasonalItems.length > 0 &&
              seasonalItems.map((card) => (
                <BigRecommendationCard
                  key={card.productName + card.unit}
                  card={card}
                />
              ))}

            {seasonalItems.length === 0 &&
              falling.slice(0, 4).map((card) => (
                <BigRecommendationCard
                  key={card.productName + card.unit}
                  card={card}
                />
              ))}

            {seasonalItems.length === 0 && falling.length === 0 && (
              <div style={{ fontSize: 13 }}>
                오늘은 제철 품목이나 눈에 띄게 내려간 품목 데이터가 아직 없어요.
                아래 전체 시세를 참고해 주세요.
              </div>
            )}
          </div>
        </SectionCard>

        {/* ✅ Q2 + Q3: 같은 라인 2컬럼 배치 */}
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
            subtitle="채소, 과일, 식량작물, 축산물 중에서 궁금한 분류를 고르시면, 오늘 기준으로 어느 품목이 얼마나 싸졌는지 한눈에 보여드릴게요."
          >
            {/* 상단 탭 */}
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 6,
                borderBottom: "1px solid #e5e7eb",
                marginBottom: 10,
              }}
            >
              {categoryTabs.map((tab) => {
                const active = selectedCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedCategory(tab.key)}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "6px 10px",
                      borderRadius: "999px 999px 0 0",
                      borderBottom: active
                        ? "3px solid #111827"
                        : "3px solid transparent",
                      fontSize: 13,
                      fontWeight: active ? 800 : 600,
                      color: active ? "#111827" : "#6b7280",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ marginRight: 4 }}>{tab.emoji}</span>
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 선택된 카테고리 상위 5개 + 절약/상승 문구 */}
            <CategoryTabPanel
              title={
                categoryTabs.find((t) => t.key === selectedCategory)?.label ||
                ""
              }
              emoji={
                categoryTabs.find((t) => t.key === selectedCategory)?.emoji ||
                ""
              }
              items={categoryGroups[selectedCategory] || []}
            />

            {/* 전체 절약 합계 문장 */}
            <div
              style={{
                marginTop: 10,
                fontSize: 14,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              오늘은 대략{" "}
              <span style={{ color: "#f97316" }}>
                {formatNumber(totalSaved)}원
              </span>{" "}
              정도 아끼실 수 있어요 🙂{/*  */}
            </div>
          </SectionCard>

          {/* Q3: 오늘 급락·급등한 품목이 있나요? */}
          <SectionCard title="오늘 급락·급등한 품목이 있나요?">
            <div style={{ fontSize: 14 }}>
              {/* 급락 그룹 헤더 */}
              <div
                style={{
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: "rgba(22,163,74,0.08)",
                      color: "#15803d",
                      fontWeight: 700,
                    }}
                  >
                    가격 급락
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    📉 오늘 갑자기 싸진 품목
                  </span>
                </div>
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

              {/* 급등 그룹 */}
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "1px dashed rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "rgba(249,115,22,0.08)",
                        color: "#f97316",
                        fontWeight: 700,
                      }}
                    >
                      가격 급등
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      📈 오늘은 조금 아쉬운 품목
                    </span>
                  </div>
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
            </div>
          </SectionCard>
        </div>

        {/* Q4: 전체 분위기 + 2개의 막대 그래프 */}
        <SectionCard
          title="🙂 오늘은 전체적으로 어떤 분위기인가요?"
          subtitle="그래프만 어려우시면, 아래 글자로만 보셔도 괜찮아요. 오늘이 ‘사기 좋은 날인지, 조금 비싼 날인지’를 먼저 알려드릴게요."
        >
          {/* 한 줄 요약 박스 */}
          <div
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 10,
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 13,
              color: "#111827",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
              오늘 한 줄 요약
            </div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              {moodLabel} 입니다.
            </div>
            <div>{moodSentence}</div>
            <div style={{ color: "#4b5563" }}>{actionSentence}</div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)",
              gap: 18,
            }}
          >
            {/* 왼쪽: 어제 / 1주전 / 1달전 비교 막대그래프 */}
            <div style={{ minWidth: 260 }}>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={periodCompareData}
                    margin={{ top: 24, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${Number(value).toFixed(1)}%`,
                        "변화율",
                      ]}
                      labelFormatter={(label) => `${label} 대비`}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {periodCompareData.map((entry, index) => (
                        <Cell
                          key={`cell-period-${index}`}
                          fill={entry.value >= 0 ? "#ef4444" : "#22c55e"}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(v) => `${Number(v).toFixed(1)}%`}
                        style={{ fontSize: 11 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  fontSize: 13,
                  marginTop: 8,
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                막대가{" "}
                <b style={{ color: "#22c55e" }}>0% 아래로 내려가 있으면</b>{" "}
                예전보다 가격이 내려간 날이고,{" "}
                <b style={{ color: "#ef4444" }}>0% 위로 올라가 있으면</b>{" "}
                예전보다 오른 날이에요.
                <br />
                왼쪽부터 순서대로{" "}
                <b>어제 · 1주 전 · 1달 전과 비교한 평균 변화율</b>이에요.
              </div>
            </div>

            {/* 오른쪽: 카테고리별 평균 변동률 막대그래프 */}
            <div style={{ minWidth: 260 }}>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={categoryAvgDiffData}
                    margin={{ top: 24, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${Number(value).toFixed(1)}%`,
                        `${props.payload.label} 평균 변화율`,
                      ]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {categoryAvgDiffData.map((entry, index) => (
                        <Cell
                          key={`cell-cat-${index}`}
                          fill={entry.value >= 0 ? "#ef4444" : "#22c55e"}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(v) => `${Number(v).toFixed(1)}%`}
                        style={{ fontSize: 11 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  fontSize: 13,
                  marginTop: 8,
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                오늘 기준으로{" "}
                <b>채소 · 과일 · 식량작물 · 축산물 · 기타</b>가 전체적으로
                얼마나 올랐는지 / 내렸는지를 한 번에 보여주는 그래프예요.
                <br />
                막대가{" "}
                <b style={{ color: "#22c55e" }}>0% 아래면 평균적으로 내려간</b>{" "}
                카테고리,{" "}
                <b style={{ color: "#ef4444" }}>0% 위면 평균적으로 오른</b>{" "}
                카테고리라고 보시면 됩니다.
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 🔻 아래: 예전처럼 전체 시세 펼치기 (카테고리 카드 그리드) */}
        <div
          style={{
            marginTop: 10,
            marginBottom: 32, // 여백 추가
          }}
        >
          <div
            className="price-section-title"
            style={{ marginBottom: 6, color: "#111827" }}
          >
            🔍 자세히 보고 싶으시면
          </div>
          <div
            className="price-section-sub"
            style={{ marginBottom: 10, color: "#4b5563" }}
          >
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