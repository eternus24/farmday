package com.farmday.review.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmday.orders.OrdersItemDTO;
import com.farmday.orders.OrdersService;
import com.farmday.review.dto.ReviewDTO;
import com.farmday.review.mapper.ReviewMapper;
import com.farmday.review.mapper.UserPointMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewMapper reviewMapper;
    private final UserPointMapper userPointMapper;
    private final OrdersService ordersService;

    // 리뷰 작성
    @Override
    public int writeReview(ReviewDTO dto) throws Exception {

        reviewMapper.writeReview(dto);

        ordersService.changeOrdersItemStatus(
            dto.getOrderItemId().intValue(), "E3"
        );

        OrdersItemDTO item =
            ordersService.findOrdersItemById(dto.getOrderItemId().intValue());

        int totalPrice = item.getPrice_at_order() * item.getQuantity();
        int earnPoint = (int)(totalPrice * 0.1);

        Long userNo =
            ordersService.findUserNoByOrderItemId(dto.getOrderItemId().intValue());

        Map<String, Object> param = new HashMap<>();
        param.put("userNo", userNo);
        param.put("pointAmount", earnPoint);
        param.put("pointType", "REVIEW");
        param.put("relatedId", dto.getOrderItemId());
        param.put("description", "리뷰 작성 적립");

        userPointMapper.insertUserPoint(param);
        userPointMapper.updateUserPoint(param);

        return earnPoint;   // ✅ 프론트로 내려줄 포인트
    }

    //리뷰 수정
    @Override
    public void updateReview(ReviewDTO dto) {

        //기존 리뷰 먼저 조회
        ReviewDTO origin = reviewMapper.findByReviewId(dto.getReviewId());

        if (origin == null) {
            throw new IllegalArgumentException("리뷰가 존재하지 않습니다.");
        }

        // 수정값만 덮어쓰기
        origin.setTitle(dto.getTitle());
        origin.setContent(dto.getContent());

        reviewMapper.updateReview(origin);
    }

    @Override
    public ReviewDTO findByReviewId(Long reviewId){
        return reviewMapper.findByReviewId(reviewId);
    }

    // 리뷰 조회
    @Override
    public List<ReviewDTO> getReviews(Long productId, String sort, String keyword, Long userNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("productId", productId);
        params.put("sort", sort);
        params.put("keyword", keyword);
        params.put("userNo", userNo);

    return reviewMapper.selectReviews(params);
}

    //판매자 답글
    @Override
    public void updateReply(ReviewDTO dto){
        reviewMapper.updateReply(dto);
    }


    //product_id로 store_id 찾기
    @Override
    public long findStoreIdByProductId(long product_id) {
        return reviewMapper.findStoreIdByProductId(product_id);
    }

    //전체 리뷰 조회
    @Override
    public List<ReviewDTO> getStoreReviews(Long storeId){
        return reviewMapper.getStoreReviews(storeId);
    }

    @Override
    public Map<String, Object> toggleLike(Long reviewId, Long userNo) {

        Map<String, Object> params = new HashMap<>();
        params.put("reviewId", reviewId);
        params.put("userNo", userNo);

        // 이미 좋아요 눌렀는지 체크
        Integer exists = reviewMapper.checkLike(params);

        Map<String, Object> result = new HashMap<>();

        if (exists != null) {
            // 이미 누른 상태 → 삭제
            reviewMapper.deleteLike(params);
            result.put("liked", false);
            result.put("message", "좋아요를 취소했습니다.");
        } else {
            // 처음 누름 → 저장
            reviewMapper.saveLike(params);
            result.put("liked", true);
            result.put("message", "좋아요를 눌렀습니다.");
        }

        // 현재 좋아요 수
        int count = reviewMapper.countLike(reviewId);
        result.put("likeCount", count);

        return result;
    }

}