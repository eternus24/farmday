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
        reviewMapper.writeReview(dto);
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