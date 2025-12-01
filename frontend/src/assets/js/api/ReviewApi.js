import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL, 
});

// 리뷰 목록
export const fetchReviews = (productId, sort = "latest", keyword = "") =>
  api.get(`/api/reviews/${productId}`, {
    params: { sort, keyword },
  });

// 리뷰 작성
export const writeReview = (reviewData) =>
  api.post(`/api/reviews/write`, reviewData);

// 리뷰 삭제
export const deleteReview = (reviewId) =>
  api.delete(`/api/reviews/${reviewId}`);



export default api;