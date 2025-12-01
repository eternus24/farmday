import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 스토어 정보 조회 API
export const getStoreInfo = (producerId) => {
  return api.get(`/api/mystore/${producerId}`);
};


export default api;