// frontend/src/api/priceApi.js

// 가격 비교 API 호출 모듈
// GET /api/price/{itemId}?salePrice={salePrice}

export async function getPriceCompare(itemId, salePrice) {
  // TODO: 실제 백엔드 서버 주소로 교체 (프록시 쓰면 /api 그대로 사용)
  const url = `/api/price/${itemId}?salePrice=${encodeURIComponent(salePrice)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`API 오류: ${res.status}`);
    }

    const data = await res.json();
    // data: PriceCompareResponse(JSON)
    return data;
  } catch (error) {
    console.error("getPriceCompare 호출 실패:", error);
    throw error;
  }
}
