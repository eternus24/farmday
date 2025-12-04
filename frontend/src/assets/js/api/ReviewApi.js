import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL, 
});

// 리뷰 목록
export const fetchReviews = (productId, sort = "latest", keyword = "",userNo) =>
  api.get(`/api/reviews/${productId}`, {
    params: { sort, keyword,userNo },
  });

// 리뷰 작성
export const writeReview = (reviewData) =>
  api.post(`/api/reviews/write`, reviewData);

// 리뷰 삭제
export const deleteReview = (reviewId) =>
  api.delete(`/api/reviews/${reviewId}`);

//해당 스토어 전체 리뷰 조회
export const getStoreReviews = (storeId) =>
  api.get(`/api/reviews/store/${storeId}`).then((res) => res.data)

//리뷰 좋아요
export const likeReview = (reviewId,userNo) =>
  api.post(`/api/reviews/${reviewId}/like?userNo=${userNo}`);

//판매자 답글 등록
export const updateReply = (reviewId,reply) => 
  api.patch(`/api/reviews/${reviewId}/reply`, {reply});

export default api;