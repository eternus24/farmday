// src/components/price/PriceTicker.jsx
import React, { useEffect, useState } from "react";
import { fetchMainCards } from "../../api/priceApi";
import "./price.css";

function formatNumber(num) {
  if (num == null) return "-";
  return Number(num).toLocaleString("ko-KR");
}

export default function PriceTicker() {
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchMainCards(12)
      .then((data) => {
        if (mounted) setCards(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError("시세 정보를 불러오지 못했습니다.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="price-ticker-wrapper">
        <div style={{ padding: "8px 16px", fontSize: 12 }}>{error}</div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="price-ticker-wrapper">
        <div style={{ padding: "8px 16px", fontSize: 12 }}>
          오늘의 시세를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  // 자연스러운 무한 스크롤을 위해 2번 반복
  const loopCards = [...cards, ...cards];

  return (
    <div className="price-ticker-wrapper">
      <div className="price-ticker-inner">
        {loopCards.map((card, idx) => {
          const up = card.up;
          const diffRate = card.diffRate || 0;
          const diffPrice = card.diffPrice || 0;

          const diffClass =
            diffRate === 0 ? "" : up ? "price-up" : "price-down";

          return (
            <div key={idx} className="price-card">
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
        })}
      </div>
    </div>
  );
}
