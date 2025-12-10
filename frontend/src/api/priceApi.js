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

/**
 * 🔍 상품 이름으로 오늘 시세 카드에서 "대략" 한 개 찾아오기
 * - productName 에 사용자가 적은 이름이 포함되면 매칭
 * - 예: "꿀고구마" → "고구마/10kg" 같은 카드와 매칭
 * - 여러 개가 매칭될 때:
 *   - 기본은 kg/근/그램 같은 "무게 단위" 우선
 *   - 키워드에 "박스, 상자, box" 가 들어있으면 박스 단위 우선
 */
export async function fetchRecentPriceByName(keyword, limit = 200) {
  if (!keyword || !keyword.trim()) return null;

  const cards = await fetchMainCards(limit);

  // 이름 비교용 노멀라이즈 (공백/특수문자 제거)
  const normalizeName = (s) =>
    s
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^0-9a-zA-Z가-힣]/g, "");

  const target = normalizeName(keyword);
  if (!target) return null;

  const keywordLower = keyword.toLowerCase();
  const prefersBox = /박스|상자|box/.test(keywordLower);
  // 특별히 박스를 명시하지 않았다면 기본은 무게 단위 선호
  const prefersWeight =
    /kg|킬로|근|그램|g/.test(keywordLower) || !prefersBox;

  // 단위에 대한 점수 계산
  const unitScore = (unit) => {
    const u = (unit || "").toString().toLowerCase();
    let score = 0;

    const hasBox = /박스|상자|box/.test(u);
    const hasWeight = /kg|킬로|근|그램|g/.test(u);

    if (prefersBox && hasBox) score += 3;
    if (prefersBox && hasWeight) score += 1;

    if (prefersWeight && hasWeight) score += 3;
    if (prefersWeight && hasBox) score -= 1;

    return score;
  };

  // 이름 매칭되는 카드들만 모아서, unitScore 로 한 개 선택
  const candidates = [];
  for (const card of cards) {
    const nameNorm = normalizeName(card.productName || "");
    if (!nameNorm) continue;

    // 이름이 서로 포함 관계이면 매칭으로 본다
    if (nameNorm.includes(target) || target.includes(nameNorm)) {
      candidates.push(card);
    }
  }

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  let best = candidates[0];
  let bestScore = unitScore(candidates[0].unit);

  for (let i = 1; i < candidates.length; i++) {
    const c = candidates[i];
    const score = unitScore(c.unit);
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }

  return best;
}