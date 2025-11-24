import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL, // 또는 네 스프링 서버 IP
  //각자 서버에 맞춰 설정!
});

export const getProductList = async (params) => {
  return (await api.get("/api/products", { params })).data;
};

export const getProductDetail = async (id) => {
  return (await api.get(`/api/products/${id}`)).data;
};

export default api;