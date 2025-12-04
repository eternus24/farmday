import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL, 
  //각자 서버에 맞춰 설정!
});
//상품 리스트
export const getProductList = async (params) => {
  return (await api.get("/api/products", { params })).data;
};

//상품 상세
export const getProductDetail = async (id) => {
  return (await api.get(`/api/products/${id}`)).data;
};

//상품 이미지
export const getProductImage = async (id) => {
  return (await api.get(`/api/products/${id}/images`)).data;
}

//상점 정보
export const getStoreInfo = async (producerId) => {
  return (await api.get(`/api/products/producer/${producerId}/store`)).data;
}

//전체 상품 목록
export const getProducerProducts = async (producerId) => {
  return (await api.get(`/api/products/producer/${producerId}/products`)).data;
}

//생산자 최근 등록/판매 상품
export const getRecentProducts = async (producerId) => {
  return (await api.get(`/api/products/producer/${producerId}/recent`)).data;
};

/*********** ai 기능 ***********/
export const searchProducts = async(params) => {
  return(await api.get("/api/products/search",{params})).data;
}

export default api;