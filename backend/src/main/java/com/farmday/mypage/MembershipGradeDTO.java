package com.farmday.mypage;

import lombok.Data;

@Data
public class MembershipGradeDTO {
  
    private String grade_code;
    private String grade_name;
    private int min_amount;
    private int max_amount;
    private double discount_rate;
    private double point_rate;
    private int free_shipping_cnt;
    private String birthday_coupon_yn;
    private String is_active;
    private int sort_order;
    private String created_date;
    private String updated_date;

}
