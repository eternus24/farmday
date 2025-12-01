package com.farmday.mypage;

import lombok.Data;

@Data
public class OrdersCanceledDTO {
  
  private int orders_canceled_id;
  private String user_id;
  private int order_item_id;
  private int product_id;
  private String cancel_reason;
  private int refund_amount;
  private String created_date;

  // orders join용
  private String toss_orderid;

  // orders_item join용
  private int price_at_order;
  private int quantity;
  private String order_status;
  private String order_created_date;

  // product join용
  private String name;
  private String main_image;

  // product_detail join용
  private String grade;
  private String unit_name;
  private String origin_region;

  // store join용
  private String store_name;

}
