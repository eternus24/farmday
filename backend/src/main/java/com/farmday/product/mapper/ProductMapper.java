package com.farmday.product.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.farmday.mystore.dto.MystoreDTO;
import com.farmday.product.dto.ProductDTO;
import com.farmday.product.dto.ProductImageDTO;

@Mapper
public interface ProductMapper {
    
    //조건 기반 상품 리스트 조회
    public List<ProductDTO> getProductList(Map<String,Object> params);

    //상품 상세 조회
    public ProductDTO getProductDetail(long id);
    public List<ProductImageDTO> getProductImages(long productId);

    // 상점 조회
    public MystoreDTO getStoreByProducer(long producerId);

    public List<ProductDTO> getProducerProducts(long producerId);
    public List<ProductDTO> getRecentProducts(long producerId);
    
    //********   ai 기능 *********/
    public List<ProductDTO> searchProducts(
        @Param("keyword") String keyword,
        @Param("maxPrice") Integer maxPrice,
        @Param("sort") String sort
    );
    
}