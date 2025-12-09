// ==============================================
// backend/src/main/java/com/farmday/cart/CartController.java
// ==============================================
package com.farmday.cart;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.farmday.orders.OrdersService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
public class CartController {

    private final CartService cartService;
    private final OrdersService ordersService;

    public CartController(CartService cartService, OrdersService ordersService) { 
        this.cartService = cartService; 
        this.ordersService = ordersService;
    }

    // 사용자ID로 장바구니 데이터 가져오기
    @GetMapping("/cart/findCartByUserId")
    public List<CartDTO> findCartByUserId(@RequestParam("user_id") String user_id) throws Exception {
        return cartService.findCartByUserId(user_id);
    }

    @GetMapping("/cart/findCartAmountByUserId")
    public int findCartAmountByUserId(@RequestParam("user_id") String user_id) throws Exception {
        return cartService.findCartAmountByUserId(user_id);
    }

    // 장바구니에 상품 담기
    @PostMapping(value = "/cart/insertCart/{user_id}", consumes = "application/json")
    public ResponseEntity<String> insertCart(
            @PathVariable("user_id") String user_id,
            @RequestBody List<CartDTO> items
    ) throws Exception {
        if (user_id == null || user_id.isEmpty() || items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        //현재 장바구니 목록을 가져온다.
        List<CartDTO> currentCartList = cartService.findCartByUserId(user_id);
        boolean isCartEmpty = false;

        //새로운 Set을 만들어서 현재 장바구니에 있는 상품들의 product_id를 넣음
        Set<Integer> cartProductSet = new HashSet<Integer>();

        if (currentCartList == null || currentCartList.isEmpty()) {
            isCartEmpty = true;
        } else {
            for (CartDTO dto : currentCartList) {
                cartProductSet.add(dto.getProduct_id());
            }
        }

        for (CartDTO it : items) {
            if (it == null) continue;
            int product_id = it.getProduct_id();
            int quantity = Math.max(1, Math.min(999, it.getQuantity()));

            if (!isCartEmpty && cartProductSet.contains(product_id)) {
                return ResponseEntity
                    .badRequest()
                    .body("ALREADY_IN_CART");
            }

            cartService.insertCart(user_id, product_id, quantity);
        }
        // return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.ok("");
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
            int stock_qty = ordersService.findProductStockQty(product_id);
            int quantity = Math.max(1, Math.min(999, it.getQuantity()));

            if (quantity > stock_qty) {
                quantity = stock_qty;
            }

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


    // 구매 성공 시 장바구니 품목 모두 삭제




    // 위의 코드로도 작동(삭제)은 하지만, 이 코드가 좀 더 안전하고 RESTful한 코드
    // @DeleteMapping("/cart/{cart_id}")
    // public ResponseEntity<Void> deleteCartItem(@PathVariable int cart_id) throws Exception {
    //     if (cart_id <= 0) return ResponseEntity.badRequest().build();

    //     boolean removed = cartService.deleteCart(cart_id);
    //     return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    // }

}