package com.farmday.product.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import com.farmday.product.dto.ProductDTO;
import com.farmday.product.dto.ProductImageDTO;
import com.farmday.product.dto.StoreDTO;

public interface ProductService {

    //조건 기반 상품 리스트 조회
    public List<ProductDTO> getProductList(String keyword,List<Integer> categories,Integer price, String sort);

    //상품 상세 조회
    public ProductDTO getProductDetail(long productId);
    public List<ProductImageDTO> getProductImages(long productId);

    // 상점 조회
    public StoreDTO getStoreByProducer(long producerId);

    //상품 등록
    public void insertData(ProductDTO dto, MultipartFile upload);

    //상품 수정
    public void updateProduct(ProductDTO dto, MultipartFile upload);

    //상품 삭제
    public void deleteProduct(long productId);

}
