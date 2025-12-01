package com.farmday.mypage;

import lombok.Data;

@Data
public class WishlistDTO {
  
    private int wishlist_id;
    private String user_id;
    private int product_id;
    private String alert_enabled;
    private String created_date;

}
