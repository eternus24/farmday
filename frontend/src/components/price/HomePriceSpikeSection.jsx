// src/components/price/HomePriceSpikeSection.jsx
import React, { useEffect, useState } from "react";
import { fetchTodaySummary } from "../../api/priceApi";

function formatNumber(num) {
  if (num == null) return "-";
  return Number(num).toLocaleString("ko-KR");
}

// ✅ 홈용 RankRow – 한 줄 레이아웃 (왼쪽 품목 / 오른쪽 시세)
function RankRow({ index, item, type }) {
  const rate = item.diffRate || 0;
  const absRate = Math.abs(rate).toFixed(1);
  const isDown = type === "down";

  const accentColor = isDown ? "#16a34a" : "#f97316";
  const badgeBg = isDown
    ? "rgba(22,163,74,0.08)"
    : "rgba(249,115,22,0.08)";

  const fullName =
    item.productName + (item.unit ? ` (${item.unit})` : "");

  const shortComment = isDown
    ? "장 보시기 좋은 날이에요."
    : "급하지 않다면 조금 기다려도 좋아요.";

  return (
    <div
      style={{
        padding: "8px 0",
        borderBottom: "1px solid rgba(148,163,184,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minHeight: 52,
      }}
    >
      {/* 🔹 왼쪽: 순위 + 품목명/단위 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
        }}
      >
        {/* 순위 동그라미 */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: "999px",
            background: accentColor,
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <span
            title={fullName}
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 230,
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

      {/* 🔹 오른쪽: 변동률 + 짧은 설명 */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: accentColor,
            background: badgeBg,
            padding: "4px 10px",
            borderRadius: 999,
            minWidth: 80,
            display: "inline-flex",
            justifyContent: "center",
          }}
        >
          {isDown ? "▼" : "▲"} {absRate}%
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#6b7280",
            marginTop: 3,
            whiteSpace: "nowrap",
          }}
        >
          {shortComment}
        </div>
      </div>
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
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #d1d5db",
        paddingTop: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.7fr) minmax(0, 1.3fr)",
          columnGap: 40,
        }}
      >
        {/* ───────── 왼쪽: 공지사항 ───────── */}
        <div
          style={{
            paddingRight: 20,
            borderRight: "1px solid rgba(148,163,184,0.25)",
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

        {/* ───────── 오른쪽: 급락/급등 – 2컬럼 ───────── */}
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
              <span>오늘 급락·급등한 품목이 있나요?</span>
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

          {/* 🔥 왼쪽: 갑자기 싸진 품목 / 오른쪽: 아쉬운 품목 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: 24,
            }}
          >
            {/* 왼쪽 – 오늘 갑자기 싸진 품목 (가격 급락) */}
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

            {/* 오른쪽 – 오늘은 조금 아쉬운 품목 (가격 급등) */}
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
