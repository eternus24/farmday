package com.farmday.orders;

import lombok.Data;

@Data
public class OrdersItemDTO {
    private int order_item_id;
    private int order_id;
    private int product_id;
    private String product_name;
    private int discount_amount;
    private int price_at_order;
    private int quantity;
    private int line_total_amount;
    private String created_date;

    
}
