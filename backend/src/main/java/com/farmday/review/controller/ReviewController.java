package com.farmday.review.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.orders.OrdersService;
import com.farmday.review.dto.ReviewDTO;
import com.farmday.review.service.ReviewService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
@CrossOrigin("*")
public class ReviewController {

    private final ReviewService reviewService;
    private final OrdersService ordersService;

    // 리뷰 등록
    @PostMapping("/write")
    public ResponseEntity<?> writeReview(@RequestBody ReviewDTO dto) throws Exception {

        String orderStatus = ordersService.findOrdersItemById(dto.getOrderItemId().intValue()).getOrder_status();

        if (!orderStatus.equals("E1") && !orderStatus.equals("E2")) {
            return ResponseEntity.badRequest().body("리뷰를 등록할 수 없는 상태입니다.");
        }

        try{
            dto.setStoreId(reviewService.findStoreIdByProductId(dto.getProductId()));
            reviewService.writeReview(dto);
            ordersService.changeOrdersItemStatus(dto.getOrderItemId().intValue(),"E3");
            return ResponseEntity.ok("리뷰 등록 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("리뷰 등록 실패" + e.getMessage());
        }
    }

    //리뷰 조회
    @GetMapping("/{productId}")
    public ResponseEntity<?> getReviews(
        @PathVariable Long productId,
        @RequestParam(required = false, defaultValue = "latest") String sort,
        @RequestParam(required = false, defaultValue = "") String keyword) {
        try{
            List<ReviewDTO> reviews = reviewService.getReviews(productId, sort, keyword);
            return ResponseEntity.ok(reviews);
        }catch (Exception e) {
            return ResponseEntity.badRequest().body("리뷰 조회 실패" + e.getMessage());
        }
    }
    
    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try{
            reviewService.deleteReview(reviewId);
            return ResponseEntity.ok("리뷰 삭제 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("리뷰 삭제 실패" + e.getMessage());
        }
    }

    //판매자 리뷰
    @PatchMapping("/{reviewId}/reply")
    public ResponseEntity<?> updateReply(
            @PathVariable Long reviewId,
            @RequestBody ReviewDTO dto
    ) {
        dto.setReviewId(reviewId);
        reviewService.updateReply(dto);
        return ResponseEntity.ok("판매자 답글 저장 완료");
    }

    
}