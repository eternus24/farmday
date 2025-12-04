package com.farmday.mypage;

import lombok.Data;

@Data
public class WishlistDTO {
  
    private int wishlist_id;
    private String user_id;
    private int product_id;
    private String alert_enabled;
    private String created_date;


    // product join용
    private String name;
    private String main_image;

    // product_detail join용
    private String grade;
    private String unit_name;
    private String origin_region;
    private int price;

    // store join용
    private String store_name;

}
