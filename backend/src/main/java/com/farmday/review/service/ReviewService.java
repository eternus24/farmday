package com.farmday.review.service;

import java.util.List;
import java.util.Map;

import com.farmday.review.dto.ReviewDTO;

public interface ReviewService {

    //리뷰 작성
    public void writeReview(ReviewDTO dto);

    //리뷰 조회
    public List<ReviewDTO> getReviews(Long productId, String sort, String keyword, Long userNo);

    //리뷰 삭제
    public void deleteReview(Long reviewId);
    
    //판매자 답글
    public void updateReply(ReviewDTO dto);

    //product_id로 store_id 찾기
    public long findStoreIdByProductId(long product_id);

    //전체 리뷰 조회
    public List<ReviewDTO> getStoreReviews(Long storeId);

    //리뷰
    public Map<String, Object> toggleLike(Long reviewId, Long userNo);

}