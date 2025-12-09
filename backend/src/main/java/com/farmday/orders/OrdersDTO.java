package com.farmday.orders;

import java.util.List;

import lombok.Data;

@Data
public class OrdersDTO {
    private int order_id;
    private String user_id;
    private String order_status;
    private String order_date;
    private int product_total_amount;
    private int shipping_fee;
    private int discount_amount;
    private int order_total_amount;
    private String receiver_name;
    private String receiver_phone;
    private String receiver_addr;
    private String delivery_message;
    private String order_type;
    private int group_deal_id;
    private String created_date;
    private String updated_date;

    private String toss_orderid;
    private String toss_paymentkey;


    private int used_points;
    private int subtotal;

    private int order_amount;
    private String thumbnail_name;
    private String thumbnail_img;
    private int thumbnail_id;

    private List<OrdersImgListDTO> orders_img_list;

    private int couponId;
}
