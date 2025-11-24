package com.farmday.product.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.farmday.product.dto.ProductDTO;
import com.farmday.product.dto.ProductImageDTO;
import com.farmday.product.dto.StoreDTO;
import com.farmday.product.mapper.ProductMapper;
import com.farmday.product.util.FileUploadUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductMapper productMapper;
    private final FileUploadUtil fileUploadUtil;

    private final String uploadDir = "E:/upload/product"; 

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
    public ProductDTO getProductDetail(long id) {
        return productMapper.getProductDetail(id);
    }

    //상세 이미지
    @Override
    public List<ProductImageDTO> getProductImages(long productId) {
        return productMapper.getProductImages(productId);
    }

    // 상점 조회
    @Override
    public StoreDTO getStoreByProducer(long producerId) {
        return productMapper.getStoreByProducer(producerId);
    }

    @Override
    public void insertData(ProductDTO dto, MultipartFile upload) {
        try {
            if (upload != null && !upload.isEmpty()) {
                String fileName = fileUploadUtil.saveFile(uploadDir, upload);
                dto.setMainImage(fileName);
            }

            productMapper.insertData(dto);

        } catch (Exception e) {
            log.error("상품 등록 오류", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public void updateProduct(ProductDTO dto, MultipartFile upload) {
        try {
            // 기존 이미지 삭제하고 새 이미지 저장
            if (upload != null && !upload.isEmpty()) {
                // 기존 이미지 삭제
                if (dto.getMainImage() != null) {
                    fileUploadUtil.deleteFile(uploadDir, dto.getMainImage());
                }

                // 새 이미지 저장
                String newFile = fileUploadUtil.saveFile(uploadDir, upload);
                dto.setMainImage(newFile);
            }

            productMapper.updateProduct(dto);

        } catch (Exception e) {
            log.error("상품 수정 오류", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public void deleteProduct(long productId) {
        productMapper.deleteProduct(productId);
    }
}
