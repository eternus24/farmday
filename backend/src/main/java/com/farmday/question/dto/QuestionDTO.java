package com.farmday.question.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QuestionDTO {
    
    private Long qnaId; // 상품 문의 ID
    private Long productId; // 상품 ID
    private Long storeId; // 스토어 ID
    private String writerUserId; // 문의 작성자
    private String title; // 문의 제목
    private String content; // 문의 내용
    private String qnaCategory;// 문의 카테고리
    
    private String isPrivate; // 비밀글 여부 (Y/N → 변환 필요)
    
    private String status; // 상태( WAITING / ANSWERED / CLOSED 등 )

    private String answerUserId; // 답변자
    private String answerContent; // 답변 내용

    private LocalDateTime answeredAt; // 답변 일시
    private LocalDateTime createdDate; // 작성일
    private LocalDateTime updatedDate; // 수정일
}