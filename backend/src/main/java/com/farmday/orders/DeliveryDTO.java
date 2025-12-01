package com.farmday.orders;

import lombok.Data;

@Data
public class DeliveryDTO {
    
    private int delivery_id;
    private int order_item_id;
    private String carrier_name;
    private String tracking_number;
    private String delivery_status;
    private String shipped_at;
    private String delivered_at;
    private String created_date;
    private String updated_date;
    private String expected_delivery_at;

    // orders join용
    private String toss_orderid;
    private String receiver_name;
    private String receiver_phone;
    private String receiver_addr;
    private String delivery_message;

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
    private String detail_desc;

    // users join용
    private String user_id;
    private String user_name;



}
