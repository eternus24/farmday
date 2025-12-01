package com.farmday.review.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmday.review.dto.ReviewDTO;
import com.farmday.review.mapper.ReviewMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewMapper reviewMapper;

    // 리뷰 작성
    @Override
    public void writeReview(ReviewDTO dto) {
        reviewMapper.insertReview(dto);
    }

    // 리뷰 조회
    @Override
    public List<ReviewDTO> getReviews(Long productId, String sort, String keyword) {
        Map<String, Object> params = new HashMap<>();
        params.put("productId", productId);
        params.put("sort", sort);
        params.put("keyword", keyword);

    return reviewMapper.selectReviews(params);
}

    // 리뷰 삭제
    @Override
    public void deleteReview(Long reviewId) {
        reviewMapper.deleteReview(reviewId);
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
}