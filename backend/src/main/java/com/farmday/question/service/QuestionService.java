package com.farmday.question.service;

import java.util.List;
import java.util.Map;

import com.farmday.question.dto.QuestionDTO;

public interface QuestionService {

    //질문 부분
    public void insertQuestion(QuestionDTO dto);
    //상품 + 옵션 카테고리
    public List<QuestionDTO> getQuestionByProduct(Long productId, String qnaCategory);
    public void updateQuestion(QuestionDTO dto);
    public void deleteQuestion(Long qnaId);
    
    //답변
    public void insertAnswer(QuestionDTO dto);
    public Long getStoreOwnerIdByQnaId(Long qnaId);

    public void updateAnswer(QuestionDTO dto);
    public void deleteAnswer(Long qnaId);

    public int getStoreQnaTotalCount(Map<String, Object> params);

    //생산자 페이지용 문의 관리
    public List<QuestionDTO> getStoreQnaList(Map<String, Object> params);

}