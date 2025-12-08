// src/api/priceApi.js

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(path, params = {}) {
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

// 메인 티커용 카드
export function fetchMainCards(limit = 10) {
  return request("/api/price/main-cards", { limit });
}

// 시세 페이지 요약
export function fetchTodaySummary() {
  return request("/api/price/today-summary");
}

//개별 품목 시세 상세
export function fetchPriceDetail(item) {
  return request("/api/price/detail", { item });
}