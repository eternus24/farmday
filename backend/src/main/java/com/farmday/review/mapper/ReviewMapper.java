package com.farmday.review.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.farmday.review.dto.ReviewDTO;

@Mapper
public interface ReviewMapper {
    
    //리뷰 등록
    public void insertReview(ReviewDTO dto);

    // 리뷰 리스트 조회 (검색 + 정렬)
    public List<ReviewDTO> selectReviews(Map<String, Object> params);
    
    //리뷰 삭제
    public void deleteReview(Long reviewId);

    //판매자 답글
    public void updateReply(ReviewDTO dto);



    //product_id로 store_id 찾기
    public long findStoreIdByProductId(long product_id);
}