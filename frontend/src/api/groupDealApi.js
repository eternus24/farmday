// 경로: frontend/src/api/groupDealApi.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 공통: 인증 헤더
 * - localStorage.accessToken 이용 (JWT)
 */
function authHeader() {
  const token = localStorage.getItem("accessToken");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * 공통: fetch 래퍼 (JSON 전용)
 */
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `요청 실패: ${res.status}`);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------------- */
/*  소비자 / 공통: 공동구매 목록 & 상세                                  */
/* --------------------------------------------------------------------- */

/**
 * 공동구매 리스트 조회
 * - status: "OPEN" 등 필터 (없으면 전체)
 */
export async function getGroupDealList(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request(`${API_BASE_URL}/api/group-deals${query}`, {
    method: "GET",
  });
}

/**
 * 공동구매 상세 조회
 * - GET /api/group-deals/{groupDealId}
 * - 응답: GroupDealDetailResponseDto
 */
export async function getGroupDealDetail(groupDealId) {
  return request(`${API_BASE_URL}/api/group-deals/${groupDealId}`, {
    method: "GET",
  });
}

/**
 * 공동구매 참여 (소비자)
 * - POST /api/group-deals/{groupDealId}/join
 * - body: { quantity }
 * - userId는 백엔드에서 JWT Principal 로 처리
 */
export async function joinGroupDeal(groupDealId, quantity) {
  return request(`${API_BASE_URL}/api/group-deals/${groupDealId}/join`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}

/* --------------------------------------------------------------------- */
/*  생산자: 공동구매 등록 관련 API                                       */
/* --------------------------------------------------------------------- */

/**
 * 상품 목록 조회 (공동구매 등록 시 상품 선택용)
 * - GET /api/products
 */
export async function getProductList() {
  return request(`${API_BASE_URL}/api/products`, {
    method: "GET",
  });
}

/**
 * 공동구매 등록 (생산자)
 * - POST /api/seller/group-deals
 * - body: GroupDealCreateRequestDto 와 1:1
 *
 * {
 *   productId,
 *   title,
 *   subTitle,
 *   detail,
 *   originPrice,
 *   dealPrice,
 *   discountRate,
 *   minMemberCount,
 *   maxMemberCount,
 *   perUserLimitQty,
 *   startAt,
 *   endAt,
 *   shippingStartDate,
 *   shippingEndDate,
 *   imageUrls: [ ... ]   // 백엔드에서 /uploads/groupdeal/... 형식의 상대경로 사용
 * }
 */
export async function createGroupDeal(createDto) {
  return request(`${API_BASE_URL}/api/seller/group-deals`, {
    method: "POST",
    body: JSON.stringify(createDto),
  });
}

/* --------------------------------------------------------------------- */
/*  이미지 업로드 (일반 파일 업로드 방식)                                */
/* --------------------------------------------------------------------- */

/**
 * 공동구매 이미지 업로드
 *
 * - POST /api/group-deals/image/upload
 * - Content-Type: multipart/form-data (브라우저 자동 설정)
 * - Request: file (FormData)
 * - Response: { imageUrl: "/uploads/groupdeal/파일명" }
 *
 * imageUrl 은 백엔드 기준 상대 경로이므로
 * 실제 img src 는 `${API_BASE_URL}${imageUrl}` 로 사용
 */
export async function uploadGroupDealImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/group-deals/image/upload`, {
    method: "POST",
    headers: {
      // Content-Type 은 브라우저가 boundary 포함해서 자동 설정해야 함
      ...authHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `이미지 업로드 실패: ${res.status}`);
  }

  return res.json(); // { imageUrl: "/uploads/groupdeal/..." }
}

/* --------------------------------------------------------------------- */
/*  생산자: 공동구매 대시보드 조회                                      */
/* --------------------------------------------------------------------- */

/**
 * 생산자: 공동구매 대시보드 조회
 * - GET /api/producer/group-deals/{groupDealId}/dashboard
 */
export async function getProducerGroupDealDashboard(groupDealId) {
  return request(
    `${API_BASE_URL}/api/producer/group-deals/${groupDealId}/dashboard`,
    {
      method: "GET",
    }
  );
}