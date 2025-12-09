package com.farmday.orders;

import lombok.Data;

@Data
public class OrdersItemDTO {
    private int order_item_id;
    private int order_id;
    private int product_id;
    private String product_name;
    private int group_deal_id;
    private int price_at_order;
    private int quantity;
    private int line_total_amount;
    private String created_date;
    private String order_status;


    // orders join용
    private String user_id;
    private String toss_orderid;

    // product join용
    private String main_image;

    // product_detail join용
    private String grade;
    private String unit_name;
    private String origin_region;

    // delivery join용
    private String delivery_status;

    // store join용
    private String store_name;
}
