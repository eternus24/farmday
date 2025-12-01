package com.farmday.product.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.farmday.mystore.dto.MystoreDTO;
import com.farmday.product.dto.ProductDTO;
import com.farmday.product.dto.ProductImageDTO;
import com.farmday.product.mapper.ProductMapper;
import com.farmday.review.dto.ReviewDTO;
import com.farmday.review.mapper.ReviewMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductMapper productMapper;
    private final ReviewMapper reviewMapper;

    @Override
    public List<ProductDTO> getProductList(String keyword, List<Integer> categories, Integer price, String sort) {
    Map<String, Object> params = new HashMap<>();
    params.put("keyword", keyword);
    params.put("categories", categories);
    params.put("price", price);
    params.put("sort", sort);

    return productMapper.getProductList(params);
}

    @Override
    public ProductDTO getProductDetail(long productId) {
    ProductDTO product = productMapper.getProductDetail(productId);

    if(product != null){

        // 리뷰 Map 조회로 변경
        Map<String, Object> params = new HashMap<>();
        params.put("productId", productId);
        params.put("sort", "latest");
        params.put("keyword", "");

        List<ReviewDTO> reviews = reviewMapper.selectReviews(params);
        product.setReviews(reviews);
    }

    return product;
}
    
    //상세 이미지
    @Override
    public List<ProductImageDTO> getProductImages(long productId) {
        return productMapper.getProductImages(productId);
    }

    // 상점 조회
    @Override
    public MystoreDTO getStoreByProducer(long producerId) {
        return productMapper.getStoreByProducer(producerId);
    }

    @Override
    public List<ProductDTO> getProducerProducts(long producerId) {
        return productMapper.getProducerProducts(producerId);
    }

    //top 인기 상품
    @Override
    public List<ProductDTO> getTopProducts(long producerId) {
        return productMapper.getTopProducts(producerId);
    }

    //recent 최근 등록/판매 상품
    @Override
    public List<ProductDTO> getRecentProducts(long producerId) {
        return productMapper.getRecentProducts(producerId);
    }

}