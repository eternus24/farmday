package com.farmday.orders;

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

}
