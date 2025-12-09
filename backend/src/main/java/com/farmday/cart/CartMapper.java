package com.farmday.cart;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CartMapper {

    List<CartDTO> findCartByUserId(String user_id) throws Exception;

    int findCartAmountByUserId(String user_id) throws Exception;


    int insertCart(
        @Param("user_id")String user_id,
        @Param("product_id")int product_id,
        @Param("quantity")int quantity       
    ) throws Exception;

    int updateCartQuantity(
        @Param("user_id")String user_id,
        @Param("product_id")int product_id,
        @Param("quantity")int quantity
    ) throws Exception;

    boolean deleteCart(int cart_id) throws Exception;

}