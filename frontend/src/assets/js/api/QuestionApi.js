import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 질문 등록
export const insertQuestion = (questionData) =>
  api.post(`/api/questions`, questionData);

// QnA 리스트 조회 (상품별 + 카테고리 옵션)
export const getQnaApi = (productId, qnaCategory) =>
  api.get(`/api/questions/${productId}`, {
    params: qnaCategory ? { qnaCategory } : {},
  });

//질문 수정
export const updateQuestion = (questionData) =>
  api.put(`/api/questions/${questionData.qnaId}`, questionData);

//질문 삭제
export const deleteQuestion = (qnaId) =>
  api.delete(`/api/questions/${qnaId}`);

//카테고리 조회 
export const getQnaByCategoryApi = (productId, qnaCategory) =>
  api.get(`/api/questions/${productId}`, {
    params: { qnaCategory },
  });

  // ********************* 생산자용 API ********************* //
  //스토어 전체 문의 조회
  export const getStoreList = (params) =>
  api.get(`/api/questions/store`, { params: params });

  //답변 수정
  export const writeAnswer = (qnaId, answerData) =>
    api.post(`/api/questions/${qnaId}/answer`, answerData);
  
  //답변 삭제
  export const deleteAnswer = (qnaId) =>
    api.delete(`/api/questions/${qnaId}/answer`);


export default api;