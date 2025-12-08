// src/components/price/PricePageContent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchTodaySummary } from "../../api/priceApi";
import "./price.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatNumber(num) {
  if (num == null) return "-";
  return Number(num).toLocaleString("ko-KR");
}

function PriceCard({ card }) {
  const up = card.up;
  const diffRate = card.diffRate || 0;
  const diffPrice = card.diffPrice || 0;

  const diffClass =
    diffRate === 0 ? "" : up ? "price-up" : "price-down";

  return (
    <div className="price-card">
      <div className="price-card-title">{card.productName}</div>
      <div className="price-card-unit">{card.unit}</div>
      <div className="price-card-price">
        {formatNumber(card.todayPrice)}원
      </div>
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

export default function PricePageContent() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

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

  // 🔹 칩 클릭 시 해당 섹션으로 스크롤
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const falling = summary?.topFallingItems || [];
  const rising = summary?.topRisingItems || [];
  const allItems = summary?.allItems || [];

  // 그래프용 데이터 (아줌마 눈에 한방에 들어가는 바차트)
  const fallingChartData = useMemo(
    () =>
      falling.map((item) => ({
        name: item.productName,
        rate: Math.abs(item.diffRate || 0),
      })),
    [falling]
  );

  const risingChartData = useMemo(
    () =>
      rising.map((item) => ({
        name: item.productName,
        rate: item.diffRate || 0,
      })),
    [rising]
  );

  if (error) {
    return (
      <div className="price-page">
        <h2 className="price-section-title">농산물 시세</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="price-page">
        <h2 className="price-section-title">농산물 시세</h2>
        <p>시세 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="price-page">
      {/* 1. 오늘 아줌마가 궁금한 질문 → 한 줄 요약 */}
      <h2 className="price-section-title">오늘 뭐 사야 이득일까요?</h2>
      <p className="price-section-sub">
        오늘 가격이 많이 내려간 품목을 먼저 보여드리고, 전체 시세를 한 번에
        확인할 수 있게 구성했습니다.
      </p>

      {/* 아줌마용 질문 태그 */}
      <div className="price-chip-group">
        <button
          type="button"
          className="price-chip price-chip-strong"
          onClick={() => scrollToSection("section-falling")}
        >
          오늘 꼭 장바구니에 넣어야 할 품목은?
        </button>
        <button
          type="button"
          className="price-chip"
          onClick={() => scrollToSection("section-falling")}
        >
          지금 사면 이득인가요?
        </button>
        <button
          type="button"
          className="price-chip"
          onClick={() => scrollToSection("section-rising")}
        >
          오늘은 어느 품목이 많이 올랐나요?
        </button>
        <button
          type="button"
          className="price-chip"
          onClick={() => scrollToSection("section-all")}
        >
          전체 시세 분위기가 어떤가요?
        </button>
      </div>

      {/* 2. 추천 장보기 + 급락 그래프 */}
      <div
        id="section-falling"
        className="price-row"
        style={{ marginTop: 10 }}
      >
        <div className="price-column">
          <div className="price-section-title" style={{ fontSize: 16 }}>
            🛒 오늘의 추천 장보기
          </div>
          <div className="price-section-sub">
            최근보다 가격이 많이 내려간, 오늘 사기 좋은 품목이에요.
          </div>
          {falling.length === 0 ? (
            <div style={{ fontSize: 12 }}>오늘은 크게 내려간 품목이 없어요.</div>
          ) : (
            <div className="price-grid">
              {falling.map((card) => (
                <PriceCard key={card.productName + card.unit} card={card} />
              ))}
            </div>
          )}
        </div>

        <div className="price-column">
          <div className="price-section-title" style={{ fontSize: 16 }}>
            📉 오늘 많이 내려간 품목 순위
          </div>
          <div className="price-section-sub">
            퍼센트가 클수록 어제보다 확실히 더 싸진 품목입니다.
          </div>
          {fallingChartData.length === 0 ? (
            <div style={{ fontSize: 12 }}>표시할 데이터가 없습니다.</div>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart
                  data={fallingChartData}
                  margin={{ top: 10, right: 5, left: -20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  {/* 🔹 기본 검정 대신 색 지정 */}
                  <Bar dataKey="rate" fill="#2db46b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 3. 오늘 많이 오른 품목 + 급등 그래프 */}
      <div
        id="section-rising"
        className="price-row"
        style={{ marginTop: 24 }}
      >
        <div className="price-column">
          <div className="price-section-title" style={{ fontSize: 16 }}>
            😥 오늘은 조금 아쉬운 품목
          </div>
          <div className="price-section-sub">
            가격이 많이 올라서, 급하지 않다면 조금 기다려도 좋은 품목이에요.
          </div>
          {rising.length === 0 ? (
            <div style={{ fontSize: 12 }}>오늘은 큰 폭으로 오른 품목이 없어요.</div>
          ) : (
            <div className="price-grid">
              {rising.map((card) => (
                <PriceCard key={card.productName + card.unit} card={card} />
              ))}
            </div>
          )}
        </div>

        <div className="price-column">
          <div className="price-section-title" style={{ fontSize: 16 }}>
            📈 오늘 많이 오른 품목 순위
          </div>
          <div className="price-section-sub">
            가격이 많이 오른 순서예요. 필요한 만큼만 가볍게 장보시는 걸 추천드려요.
          </div>
          {risingChartData.length === 0 ? (
            <div style={{ fontSize: 12 }}>표시할 데이터가 없습니다.</div>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart
                  data={risingChartData}
                  margin={{ top: 10, right: 5, left: -20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  {/* 🔹 여기도 색 지정 */}
                  <Bar dataKey="rate" fill="#ff8c1a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 4. 전체 시세 카드 리스트 */}
      <div id="section-all" style={{ marginTop: 28 }}>
        <div className="price-section-title">오늘 전체 시세 한눈에 보기</div>
        <div className="price-section-sub">
          오늘 조사된 주요 품목들의 가격을 한 번에 정리했습니다.
        </div>
        {allItems.length === 0 ? (
          <div style={{ fontSize: 12 }}>표시할 시세가 없습니다.</div>
        ) : (
          <div className="price-grid">
            {allItems.map((card) => (
              <PriceCard key={card.productName + card.unit} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
