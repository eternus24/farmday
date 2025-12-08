package com.farmday.question.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.question.dto.QuestionDTO;
import com.farmday.question.service.QuestionService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService service;

    //질문 작성
    @PostMapping
    public ResponseEntity<?> insert(@RequestBody QuestionDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String loginUser = auth.getName();
        dto.setWriterUserId(loginUser);

        dto.setStatus("WAITING");
        service.insertQuestion(dto);
        return ResponseEntity.ok("등록 완료");
}


    // 질문 리스트 (상품별 + 카테고리 필터)
    @GetMapping("/{productId}")
    public List<QuestionDTO> list(@PathVariable Long productId,
                                @RequestParam(required = false) String qnaCategory) {
        return service.getQuestionByProduct(productId, qnaCategory);
    }

    //스토어 전체 QnA 조회 (생산자 페이지)
    @GetMapping("/store")
    public ResponseEntity<Map<String, Object>> getStoreQnaList(
        @RequestParam long storeId,
        @RequestParam(required = false) String qnaCategory,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String keyword
    ) {
        Map<String, Object> params = new HashMap<>();
        params.put("storeId", storeId);
        params.put("qnaCategory", qnaCategory);
        params.put("status", status);
        params.put("keyword", keyword);

        // 전체 리스트 조회 (페이징 없음)
        List<QuestionDTO> qnaList = service.getStoreQnaList(params);

        // 전체 개수
        int totalCount = qnaList.size();

        // 프론트가 기대하는 구조 그대로
        Map<String, Object> response = new HashMap<>();
        response.put("content", qnaList);
        response.put("totalElements", totalCount);

        return ResponseEntity.ok(response);
    }


    //수정 & 삭제
    @PutMapping("/{qnaId}")
    public ResponseEntity<String> updateQuestion(@PathVariable Long qnaId, @RequestBody QuestionDTO dto){
        dto.setQnaId(qnaId);
        service.updateQuestion(dto);
        return ResponseEntity.ok("수정 완료");
    }

    @DeleteMapping("/{qnaId}")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long qnaId){
        service.deleteQuestion(qnaId);
        return ResponseEntity.ok("삭제 완료");
    }

    // 답변 작성
    @PostMapping("/{qnaId}/answer")
    public ResponseEntity<String> insertAnswer(
            @PathVariable Long qnaId,
            @RequestBody QuestionDTO dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String loginUserId = auth.getName();   // 로그인한 사용자 ID

        dto.setQnaId(qnaId);

        // ✔ 로그인한 유저 ID를 서비스로 같이 넘김
        service.insertAnswer(dto, loginUserId);

        return ResponseEntity.ok("답변 등록 완료");
    }


    @DeleteMapping("/{qnaId}/answer")
    public ResponseEntity<String> deleteAnswer(@PathVariable Long qnaId) {
        service.deleteAnswer(qnaId);
        return ResponseEntity.ok("답변 삭제 완료");
    }

}