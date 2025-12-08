package com.farmday.question.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmday.question.dto.QuestionDTO;
import com.farmday.question.mapper.QuestionMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService{
    
    private final QuestionMapper mapper;
    
    @Override
    @Transactional // DB 작업에 트랜잭션 적용
    public void insertQuestion(QuestionDTO dto) {
        // 1. 추가적인 비즈니스 로직 검증
        if (dto.getTitle() == null || dto.getTitle().isEmpty()) {
            throw new IllegalArgumentException("제목은 필수입니다.");
        }
    // 2. Mapper 호출
    mapper.insertQuestion(dto);
    }

    @Override
    public List<QuestionDTO> getQuestionByProduct(Long productId, String qnaCategory) {
        return mapper.getQuestionByProduct(productId, qnaCategory);
    }
    
    @Override
    public void updateQuestion(QuestionDTO dto) {
        mapper.updateQuestion(dto);
    }

    @Override
    public void deleteQuestion(Long qnaId) {
        mapper.deleteQuestion(qnaId);
    }

    @Override
    public void insertAnswer(QuestionDTO dto,String loginUserId) {
        mapper.insertAnswer(dto);
    }
    @Override
    public Long getStoreOwnerIdByQnaId(Long qnaId){
        return mapper.getStoreOwnerIdByQnaId(qnaId);
    }

    @Override
    public void updateAnswer(QuestionDTO dto) {
        mapper.updateAnswer(dto);
    }

    @Override
    public void deleteAnswer(Long qnaId) {
        mapper.deleteAnswer(qnaId);
    }

    // 1. 리스트를 조회하는 메서드 (페이징 조건 포함)
    public List<QuestionDTO> getStoreQnaList(Map<String, Object> params) {
        return mapper.getStoreQnaList(params);
    }

    // 2. 전체 개수를 조회하는 메서드
    public int getStoreQnaTotalCount(Map<String, Object> params) {
        return mapper.getStoreQnaTotalCount(params);
    }

}