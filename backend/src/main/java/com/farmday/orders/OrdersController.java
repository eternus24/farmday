// backend/src/main/java/com/farmday/testtable/TestTableController.java
package com.farmday.orders;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.cart.CartDTO;
import com.farmday.cart.CartService;

import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class OrdersController {

    private final OrdersService ordersService;
    private final CartService cartService;
    public OrdersController(OrdersService ordersService, CartService cartService) { 
        this.ordersService = ordersService; 
        this.cartService = cartService;
    }


    @GetMapping("/orders/findUserInfoForOrder")
    public UsersDTO findUserInfoForOrder(@RequestParam("user_id")String user_id) throws Exception {
        return ordersService.findUserInfoForOrder(user_id);
    }
    

    @PostMapping(value = "/orders/insertOrders/{user_id}", consumes = "application/json")
    public ResponseEntity<Void> insertCart(
            @PathVariable("user_id") String user_id,
            @RequestBody OrdersDTO item
    ) throws Exception {
        if (user_id == null || user_id.isEmpty() || item == null) {
            return ResponseEntity.badRequest().build();
        }
        item.setOrder_status("A");
        item.setProduct_total_amount(item.getSubtotal());

        String toss_orderid = item.getToss_orderid();
        ordersService.insertOrders(item);

        int order_id = ordersService.findOrdersByTossOrderId(toss_orderid).getOrder_id();

        List<CartDTO> cartList = cartService.findCartByUserId(user_id);

        for (CartDTO cart : cartList) {
            OrdersItemDTO ordersItem = new OrdersItemDTO();
            ordersItem.setOrder_id(order_id);
            ordersItem.setProduct_id(cart.getProduct_id());
            ordersItem.setProduct_name(cart.getProduct_name());
            ordersItem.setDiscount_amount(0);
            ordersItem.setPrice_at_order(cart.getPrice());
            ordersItem.setQuantity(cart.getQuantity());
            ordersItem.setLine_total_amount(cart.getPrice()*cart.getQuantity());

            ordersService.insertOrdersItem(ordersItem);
        }

        

        // return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.noContent().build();
    }



    

    @GetMapping("/orders/findAllOrdersByUserId")
    public List<OrdersDTO> findAllOrdersByUserId(@RequestParam("user_id")String user_id) throws Exception {
        return ordersService.findAllOrdersByUserId(user_id);
    }

    @GetMapping("/orders/findOrdersItemByOrderId")
    public List<OrdersItemDTO> findOrdersItemByOrderId(@RequestParam("order_id")int order_id) throws Exception {
        return ordersService.findOrdersItemByOrderId(order_id);
    }
    
}
