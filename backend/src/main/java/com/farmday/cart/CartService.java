package com.farmday.cart;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartService {
    
    @Autowired
    CartMapper cartMapper;

    public List<CartDTO> findCartByUserId(String user_id) throws Exception {
        return cartMapper.findCartByUserId(user_id);
    }

    public int insertCart(String user_id, int product_id, int quantity) throws Exception {
        return cartMapper.insertCart(user_id, product_id, quantity);
    }

    public int updateCartQuantity(String user_id, int product_id, int quantity) throws Exception {
        return cartMapper.updateCartQuantity(user_id, product_id, quantity);
    }

    public boolean deleteCart(int cart_id) throws Exception {
        return cartMapper.deleteCart(cart_id);
    }

}
