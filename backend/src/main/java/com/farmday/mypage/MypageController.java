package com.farmday.mypage;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.orders.DeliveryDTO;

import org.springframework.web.bind.annotation.PostMapping;



@RestController
public class MypageController {
    
    private final MypageService mypageService;
    public MypageController(MypageService mypageService) { 
        this.mypageService = mypageService;
    }
    

    @GetMapping("/mypage/isWishlistExist")
    public boolean isWishlistExist(
        @RequestParam("user_id")String user_id,
        @RequestParam("product_id")int product_id
    ) throws Exception {
        return (mypageService.isWishlistExist(user_id, product_id)>0);
    }

    @PostMapping("/mypage/clickWishlistBtn")
    public void clickWishlistBtn(
        @RequestParam("user_id")String user_id,
        @RequestParam("product_id")int product_id
    ) throws Exception {

        // Wishlist에 등록되어있으면 삭제하고, 없으면 등록
        boolean isWishlistExist = (mypageService.isWishlistExist(user_id, product_id)>0);

        if (isWishlistExist) {
            mypageService.deleteWishlist(user_id, product_id);
        } else {
            WishlistDTO wishlist = new WishlistDTO();
            wishlist.setUser_id(user_id);
            wishlist.setProduct_id(product_id);

            mypageService.insertWishlist(wishlist);
        }
    }

    @GetMapping("/mypage/findWishlistByUserId")
    public List<WishlistDTO> findWishlistByUserId(@RequestParam("user_id") String user_id) throws Exception {
        return mypageService.findWishlistByUserId(user_id);
    }

    @GetMapping("/mypage/deleteWishlist")
    public void deleteWishlist(
        @RequestParam("user_id")String user_id,
        @RequestParam("product_id")int product_id
    ) throws Exception {
        mypageService.deleteWishlist(user_id, product_id);
    }



    @GetMapping("/mypage/findReviewByUserId")
    public List<MyReviewDTO> findReviewByUserId(@RequestParam("user_id") String user_id) throws Exception {
        return mypageService.findReviewByUserId(user_id);
    }

    @GetMapping("/mypage/findCanceledOrderByUserId")
    public List<OrdersCanceledDTO> findCanceledOrderByUserId(@RequestParam("user_id") String user_id) throws Exception {
        return mypageService.findCanceledOrderByUserId(user_id);
    }
    
    @GetMapping("/mypage/findDeliveryInfo")
    public DeliveryDTO findDeliveryInfo(@RequestParam("order_item_id") int order_item_id) throws Exception {
        return mypageService.findDeliveryInfo(order_item_id);
    }





    @PostMapping("/mypage/awstestInsert")
    public void awstestInsert(
        @RequestParam("product_id") int product_id,
        @RequestParam("image_url") String image_url
    ) throws Exception {
        mypageService.awstestInsert(product_id, image_url);
    }
    
    @GetMapping("/mypage/awstestSelect")
    public String awstestSelect(
        @RequestParam("product_id") int product_id
    ) throws Exception {
        return mypageService.awstestSelect(product_id);
    }

}