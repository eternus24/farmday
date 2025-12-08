// 경로: frontend/src/api/groupDealQnaApi.js
import axios from "axios";

// 🔹 QnA API 백엔드 베이스 URL
// 필요하면 .env(VITE_API_BASE_URL)로 빼도 됨
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE}/api/group-deal-qna`;

// ✅ QnA 전용 axios 인스턴스
const qnaAxios = axios.create({
  baseURL: BASE_URL,
});

// ✅ 요청 나갈 때마다 accessToken → Authorization 자동 세팅
qnaAxios.interceptors.request.use((config) => {
  let token = localStorage.getItem("accessToken");

  if (token) {
    // "Bearer "가 안 붙어 있으면 붙여주기
    if (!token.startsWith("Bearer ")) {
      token = `Bearer ${token}`;
    }

    config.headers = config.headers || {};
    config.headers.Authorization = token;
  }

  return config;
});

// 🔹 공동구매별 QnA 리스트 조회
export const fetchGroupDealQnaList = async (groupDealId) => {
  const res = await qnaAxios.get(`/deal/${groupDealId}`);
  return res.data;
};

// 🔹 질문 등록 (로그인 필요)
export const createGroupDealQna = async (groupDealId, payload) => {
  const res = await qnaAxios.post(`/deal/${groupDealId}`, payload);
  return res.data;
};

// 🔹 질문 수정
export const updateGroupDealQna = async (qnaId, payload) => {
  const res = await qnaAxios.put(`/${qnaId}`, payload);
  return res.data;
};

// 🔹 질문 삭제
export const deleteGroupDealQna = async (qnaId) => {
  const res = await qnaAxios.delete(`/${qnaId}`);
  return res.data;
};

// 🔹 답변 등록/수정 (관리자/생산자용 – 필요시 사용)
export const answerGroupDealQna = async (qnaId, payload) => {
  const res = await qnaAxios.post(`/${qnaId}/answer`, payload);
  return res.data;
};