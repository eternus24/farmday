package com.farmday.product.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import com.farmday.product.dto.ProductDTO;
import com.farmday.product.dto.ProductImageDTO;
import com.farmday.product.dto.StoreDTO;

@Mapper
public interface ProductMapper {
    
    //조건 기반 상품 리스트 조회
    public List<ProductDTO> getProductList(Map<String,Object> params);

    //상품 상세 조회
    public ProductDTO getProductDetail(long id);
    public List<ProductImageDTO> getProductImages(long productId);

    // 상점 조회
    public StoreDTO getStoreByProducer(long producerId);

    //상품 등록
    public int insertData(ProductDTO dto);

    //상품 수정
    public int updateProduct(ProductDTO dto);

    //상품 삭제
    public int deleteProduct(long productId);
    
    
}
