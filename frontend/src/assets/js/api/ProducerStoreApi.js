import api from "./ShopApi";

export const getStoreByProducer = async (producerId) => {
  return (await api.get(`/api/products/producer/${producerId}`)).data;
};
