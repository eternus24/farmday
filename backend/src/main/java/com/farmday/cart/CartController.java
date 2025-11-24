// ==============================================
// backend/src/main/java/com/farmday/cart/CartController.java
// ==============================================
package com.farmday.cart;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class CartController {

    private final CartService cartService;
    public CartController(CartService cartService) { this.cartService = cartService; }

    // 사용자ID로 장바구니 데이터 가져오기
    @GetMapping("/cart/findCartByUserId")
    public List<CartDTO> findCartByUserId(@RequestParam("user_id") String user_id) throws Exception {
        return cartService.findCartByUserId(user_id);
    }

    // 장바구니에 상품 담기
    @PostMapping(value = "/cart/insertCart/{user_id}", consumes = "application/json")
    public ResponseEntity<Void> insertCart(
            @PathVariable("user_id") String user_id,
            @RequestBody List<CartDTO> items
    ) throws Exception {
        if (user_id == null || user_id.isEmpty() || items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        for (CartDTO it : items) {
            if (it == null) continue;
            int product_id = it.getProduct_id();
            int quantity = Math.max(1, Math.min(999, it.getQuantity()));
            cartService.insertCart(user_id, product_id, quantity);
        }
        // return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.noContent().build();
    }




    // 장바구니 수량 변경됐을 때 업데이트
    @PostMapping(value = "/cart/updateCart/{user_id}", consumes = "application/json")
    public ResponseEntity<Void> updateCart(
            @PathVariable("user_id") String user_id,
            @RequestBody List<CartDTO> items
    ) throws Exception {
        if (user_id == null || user_id.isEmpty() || items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        for (CartDTO it : items) {
            if (it == null) continue;
            int product_id = it.getProduct_id();
            int quantity = Math.max(1, Math.min(999, it.getQuantity()));
            cartService.updateCartQuantity(user_id, product_id, quantity);
        }
        return ResponseEntity.noContent().build(); // 204
    }


    // 장바구니 품목 삭제
    @GetMapping(value = "/cart/deleteCart/{cart_id}")
    public ResponseEntity<Void> deleteCart(@PathVariable("cart_id")int cart_id) throws Exception {
        if (cart_id == 0) {
            return ResponseEntity.badRequest().build();
        }
        cartService.deleteCart(cart_id);
        return ResponseEntity.noContent().build();
    }

    // 위의 코드로도 작동(삭제)은 하지만, 이 코드가 좀 더 안전하고 RESTful한 코드
    // @DeleteMapping("/cart/{cart_id}")
    // public ResponseEntity<Void> deleteCartItem(@PathVariable int cart_id) throws Exception {
    //     if (cart_id <= 0) return ResponseEntity.badRequest().build();

    //     boolean removed = cartService.deleteCart(cart_id);
    //     return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    // }

}
