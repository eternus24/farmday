package com.farmday.cart;

import lombok.Data;

@Data
public class CartDTO {
    private int cart_id;
    private String user_id;
    private int product_id;
    private int quantity;
    private String created_date;



    //ProductDTO (join용)
    private int producer_id;
    private int base_category_id;
    private String product_name;
    private String main_image;
    private String summary;
    private String status;
    private String product_created_date;
    private String product_updated_date;

    //Product_DetailDTO (join용)
    private int detail_id;
    private String grade;
    private String unit_name;
    private int price;
    private int stock_qty;
    private String origin_region;
    private String harvest_date;
    private String expire_date;
    private String detail_desc;
    private String product_detail_created_date;
    private String product_detail_updated_date;

}