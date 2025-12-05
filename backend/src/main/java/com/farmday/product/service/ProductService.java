package com.farmday.product.service;

import java.util.List;

import com.farmday.mystore.dto.MystoreDTO;
import com.farmday.product.dto.ProductDTO;
import com.farmday.product.dto.ProductImageDTO;

public interface ProductService {

    //조건 기반 상품 리스트 조회
    public List<ProductDTO> getProductList(String keyword,List<Integer> categories,Integer price, String sort);

    //상품 상세 조회
    public ProductDTO getProductDetail(long productId);
    public List<ProductImageDTO> getProductImages(long productId);

    // 상점 조회
    public MystoreDTO getStoreByProducer(long producerId);

    public List<ProductDTO> getProducerProducts(long producerId);
    public List<ProductDTO> getRecentProducts(long producerId);
    
    //********   ai 기능 *********/
    public List<ProductDTO> searchProducts(String keyword, Integer minPrice, Integer maxPrice,String sort);

}