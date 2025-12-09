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
            background: index === 0 ? "#ff8c1a" : "rgba(255,140,26,0.12)",
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

export default function HomePriceSpikeSection({
  notices = [],
  loadingNotices = false,
  onNoticeClick, // 🔥 부모에서 내려주는 콜백
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

  // 공지 상단 박스에서 보여줄 개수 (예: 3개만)
  const topNotices = (notices || []).slice(0, 3);

  if (error) return null;

  return (
    <div
      className="container"
      style={{ marginTop: 16, marginBottom: 24, maxWidth: 1120 }}
    >
      {/* 🔸 여기서부터 카드 2개를 좌우로 배치 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.25fr)",
          gap: 20,
        }}
      >
        {/* ───────── 왼쪽: 공지사항 카드 ───────── */}
        <div
          style={{
            borderRadius: 16,
            background: "#ffffff",
            padding: "16px 18px 14px",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span role="img" aria-label="notice">
              📢
            </span>
            <span>공지사항</span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
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
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // 🔥 페이지 이동 대신 부모 콜백 호출
                    if (onNoticeClick) {
                      onNoticeClick(n);
                    }
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

        {/* ───────── 오른쪽: 급락·급등 카드 ───────── */}
        <div
          style={{
            borderRadius: 16,
            background: "#ffffff",
            padding: "16px 18px 14px",
          }}
        >
          {/* 카드 제목은 여기! 공지와 완전히 분리 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
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
                  opacity: 0.8,
                }}
              >
                오늘 기준 농산물 시세 요약이에요
              </div>
            )}
          </div>

          {/* 안쪽은 다시 2컬럼: 좌(급락) / 우(급등) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: 20,
            }}
          >
            {/* 오늘 갑자기 싸진 품목 */}
            <div
              style={{
                borderRight: "1px solid rgba(0,0,0,0.06)",
                paddingRight: 12,
              }}
            >
              <div
                style={{
                  marginBottom: 6,
                  fontWeight: 600,
                  fontSize: 14,
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
                  marginBottom: 6,
                  fontWeight: 600,
                  fontSize: 14,
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