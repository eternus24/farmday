package com.farmday.question.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.farmday.question.dto.QuestionDTO;

@Mapper
public interface QuestionMapper {

    //질문 부분
    public void insertQuestion(QuestionDTO dto);
    // 상품 + (옵션) 카테고리
    List<QuestionDTO> getQuestionByProduct(
            @Param("productId") Long productId,
            @Param("qnaCategory") String qnaCategory
    );
    public void updateQuestion(QuestionDTO dto);
    public void deleteQuestion(Long qnaId);
    
    //답변
    public void insertAnswer(QuestionDTO dto);
    public Long getStoreOwnerIdByQnaId(long qnaId);

    public void updateAnswer(QuestionDTO dto);
    public void deleteAnswer(Long qnaId);

    // 상태 업데이트
    public void updateStatus(@Param("qnaId") Long qnaId, @Param("status") String status);

    // 생산자 페이지용 전체 리스트 + (옵션) 카테고리
    public List<QuestionDTO> selectQuestionList(@Param("qnaCategory") String qnaCategory);

    //생산자용 질문 리스트
    public List<QuestionDTO> getStoreQnaList(Map<String,Object> params);
    public int getStoreQnaTotalCount(Map<String,Object> params);
}