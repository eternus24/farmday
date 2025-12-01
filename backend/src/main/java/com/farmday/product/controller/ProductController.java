package com.farmday.product.controller;

import com.farmday.product.dto.ProductDTO;
import com.farmday.product.dto.ProductImageDTO;
import com.farmday.mystore.dto.MystoreDTO;
import com.farmday.mystore.service.MystoreService;
import com.farmday.product.service.ProductService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProductController {

    private final ProductService productService;
    private final MystoreService mystoreService;   

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

    // 상점 정보
    @GetMapping("/producer/{producerId}/store")
    public ResponseEntity<?> getStoreInfo(@PathVariable long producerId) {

        MystoreDTO dto = mystoreService.selectStore(producerId);

        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.status(404).body("상점 없음");
        }
    }
//전체 상품 목록
    @GetMapping("/producer/{producerId}/products")
    public ResponseEntity<?> getProducerProducts(@PathVariable long producerId) {
        return ResponseEntity.ok(productService.getProducerProducts(producerId));
    }

    @GetMapping("/producer/{producerId}/top")
    public ResponseEntity<?> getTopProducts(@PathVariable long producerId) {
        return ResponseEntity.ok(productService.getTopProducts(producerId));
    }

    @GetMapping("/producer/{producerId}/recent")
    public ResponseEntity<?> getRecentProducts(@PathVariable long producerId) {
        return ResponseEntity.ok(productService.getRecentProducts(producerId));
    }

}