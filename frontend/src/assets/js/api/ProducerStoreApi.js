import api from "./ShopApi";

export const getStoreByProducer = async (producerId) => {
  return (await api.get(`/api/products/producer/${producerId}`)).data;
};

//상점 리스트
export const getProducerStoreList = async () => {
  return (await api.get("/api/mystore/list")).data;
};
export default api;