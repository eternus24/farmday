// src/components/price/HomePriceSpikeSection.jsx
import React, { useEffect, useState } from "react";
import { fetchTodaySummary } from "../../api/priceApi";

function formatNumber(num) {
  if (num == null) return "-";
  return Number(num).toLocaleString("ko-KR");
}

// 급락·급등 한 줄
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

  // 전체 이름(툴팁용)
  const fullName =
    item.productName +
    (item.unit ? ` (${item.unit})` : "");

  return (
    <div
      style={{
        padding: "8px 0",
        borderBottom: "1px solid rgba(148,163,184,0.18)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 75,
        justifyContent: "space-between",
      }}
    >
      {/* 🔥 윗줄: 순위 뱃지 + (이름 …) + 퍼센트 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {/* 순위 동그라미 */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: "999px",
            background: index === 0 ? "#ff8c1a" : "rgba(255,140,26,0.06)",
            color: index === 0 ? "#fff" : "#ff8c1a",
            fontSize: 11,
            fontWeight: 700,
            marginRight: 4,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>

        {/* 🔥 이름+단위 영역: 여기서 ... 처리 */}
        <span
          title={fullName} // 마우스 올리면 전체 이름 보이게
          style={{
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <b>{item.productName}</b>
          {item.unit && (
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              {" "}
              ({item.unit})
            </span>
          )}
        </span>

        {/* 퍼센트 */}
        <span
          style={{
            fontSize: 12,
            marginLeft: 4,
            color: type === "down" ? "#16a34a" : "#f97316",
            flexShrink: 0,
          }}
        >
          {type === "down" ? "-" : "+"}
          {absRate}%
        </span>
      </div>

      {/* 설명 문장 */}
      <div style={{ fontSize: 12, opacity: 0.85 }}>{line}</div>
    </div>
  );
}

export default function HomePriceSpikeSection({
  notices = [],
  loadingNotices = false,
  onNoticeClick,
}) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingSummary(true);

    fetchTodaySummary()
      .then((data) => {
        if (!mounted) return;
        setSummary(data);
        setLoadingSummary(false);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError("시세 정보를 불러오지 못했습니다.");
        setLoadingSummary(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const falling = summary?.topFallingItems || [];
  const rising = summary?.topRisingItems || [];
  const fallingRank = falling.slice(0, 3);
  const risingRank = rising.slice(0, 3);

  const topNotices = (notices || []).slice(0, 3);

  if (error) return null;

  return (
    <div
      className="container"
      style={{
        marginTop: 24,
        marginBottom: 16,
        maxWidth: 1120,
        borderTop: "1px solid #e5e7eb", // 섹션 위에만 라인
        borderBottom: "1px solid #d1d5db",   // 🔥 아래 라인 추가
        paddingTop: 16,
      }}
    >
      {/* 🔸 카드 느낌 줄이고, 그냥 2컬럼 섹션처럼 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.7fr) minmax(0, 1.3fr)",
          columnGap: 40,
        }}
      >
        {/* ───────── 왼쪽: 공지사항 영역 ───────── */}
        <div
          style={{
            paddingRight: 20,
            borderRight: "1px solid rgba(148,163,184,0.25)", // 가운데만 살짝
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span role="img" aria-label="notice">
                📢
              </span>
              <span>공지사항</span>
            </div>
            {/* 필요하면 더보기 버튼 나중에 추가 가능 */}
          </div>

          <div
            style={{
              fontSize: 12,
              opacity: 0.75,
              marginBottom: 6,
            }}
          >
            배송·서비스 관련 안내를 확인해 주세요.
          </div>

          {loadingNotices ? (
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              공지사항을 불러오는 중입니다...
            </div>
          ) : topNotices.length === 0 ? (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 13,
              }}
            >
              {topNotices.map((n) => (
                <li
                  key={n.noticeId || n.id}
                  style={{
                    padding: "6px 0",
                    borderBottom: "1px solid rgba(148,163,184,0.18)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (onNoticeClick) onNoticeClick(n);
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 2,
                    }}
                  >
                    {(n.createdDate || n.regDate || "").slice(0, 10)}
                  </div>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {n.title}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ───────── 오른쪽: 급락·급등 영역 ───────── */}
        <div style={{ paddingLeft: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span role="img" aria-label="graph">
                📊
              </span>
              <span>오늘 급락·급등 품목이 있나요?</span>
            </div>
            {!loadingSummary && (
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.75,
                }}
              >
                오늘 기준 농산물 시세 요약이에요
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: 24,
            }}
          >
            {/* 오늘 갑자기 싸진 품목 */}
            <div>
              <div
                style={{
                  marginBottom: 4,
                  fontWeight: 600,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span role="img" aria-label="down">
                  🧾
                </span>
                <span>오늘 갑자기 싸진 품목</span>
              </div>
              {loadingSummary ? (
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  시세 불러오는 중입니다...
                </div>
              ) : fallingRank.length === 0 ? (
                <div style={{ fontSize: 12, opacity: 0.85 }}>
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
            </div>

            {/* 오늘은 조금 아쉬운 품목 */}
            <div>
              <div
                style={{
                  marginBottom: 4,
                  fontWeight: 600,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span role="img" aria-label="up">
                  ✅
                </span>
                <span>오늘은 조금 아쉬운 품목</span>
              </div>
              {loadingSummary ? (
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  시세 불러오는 중입니다...
                </div>
              ) : risingRank.length === 0 ? (
                <div style={{ fontSize: 12, opacity: 0.85 }}>
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
        </div>
      </div>
    </div>
  );
}