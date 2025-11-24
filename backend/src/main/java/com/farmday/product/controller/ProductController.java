package com.farmday.product.controller;

import com.farmday.product.dto.ProductDTO;
import com.farmday.product.dto.ProductImageDTO;
import com.farmday.product.dto.StoreDTO;
import com.farmday.product.service.ProductService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProductController {

    private final ProductService productService;

    //상품 등록 (생산자)
    @PostMapping("/upload")
    public ResponseEntity<?> productUpload(
            @RequestPart("data") ProductDTO dto,
            @RequestPart(value = "upload", required = false) MultipartFile upload
    ) {
        try {
            productService.insertData(dto, upload);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("상품 등록 오류: " + e.getMessage());
        }
    }

    // 조건 기반 상품 조회(API) ShopMain.jsx → getProductList(params)
    @GetMapping("")
    public ResponseEntity<?> list(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "categories", required = false) List<Integer> categories,
            @RequestParam(value = "price", required = false) Integer price,
            @RequestParam(value = "sort", required = false) String sort
    ) {
        List<ProductDTO> list = productService.getProductList(keyword, categories, price, sort);
        return ResponseEntity.ok(list);
    }

    //1. 상품 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetail(@PathVariable long id) {
        ProductDTO dto = productService.getProductDetail(id);

        if (dto != null) return ResponseEntity.ok(dto);
        else return ResponseEntity.status(404).body("상품 없음");
    }
    //2. 상품 이미지 목록
    @GetMapping("/{id}/images")
    public ResponseEntity<?> getProductImages(@PathVariable long id) {
        List<ProductImageDTO> list = productService.getProductImages(id);
        return ResponseEntity.ok(list);
    }

    // 상점 조회
    @GetMapping("/producer/{producerId}")
    public ResponseEntity<?> getProductsByProducer(@PathVariable long producerId) {
        StoreDTO dto = productService.getStoreByProducer(producerId);

        if(dto!= null){
            return ResponseEntity.ok(dto);
        }else{
            return ResponseEntity.status(404).body("상점 없음");
        }
    }

    // 상품 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable long id,
            @RequestPart("data") ProductDTO dto,
            @RequestPart(value = "upload", required = false) MultipartFile upload
    ) {
        try {
            dto.setProductId(id);
            productService.updateProduct(dto, upload);
            return ResponseEntity.ok("updated");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("수정 오류: " + e.getMessage());
        }
    }

    //상품 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("deleted");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("삭제 오류: " + e.getMessage());
        }
    }
}
