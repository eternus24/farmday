package com.farmday.groupdeal.qna.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.farmday.groupdeal.qna.dto.GroupDealQnaDTO;
import com.farmday.groupdeal.qna.service.GroupDealQnaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/group-deal-qna")
@RequiredArgsConstructor
public class GroupDealQnaController {

    private final GroupDealQnaService service;

    // ✅ 공동구매별 QnA 리스트
    @GetMapping("/deal/{groupDealId}")
    public List<GroupDealQnaDTO> listByGroupDeal(@PathVariable Long groupDealId) {
        return service.getQnaByGroupDeal(groupDealId);
    }

    // ✅ 질문 등록
    @PostMapping("/deal/{groupDealId}")
    public ResponseEntity<String> insert(
            @PathVariable Long groupDealId,
            @RequestBody GroupDealQnaDTO dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String loginUserId = (auth != null ? auth.getName() : null);

        // 🔒 로그인 체크
        if (loginUserId == null || "anonymousUser".equals(loginUserId)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요한 요청입니다.");
        }

        // 🔍 유효성 검증 (Java 8 스타일)
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("제목은 필수입니다.");
        }

        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("내용은 필수입니다.");
        }

        dto.setGroupDealId(groupDealId);
        dto.setUserId(loginUserId);
        dto.setIsPrivate(dto.getIsPrivate() != null ? dto.getIsPrivate() : "N");
        dto.setStatus("WAITING");

        service.insertQuestion(dto);
        return ResponseEntity.ok("등록 완료");
    }

    // ✅ 질문 수정
    @PutMapping("/{qnaId}")
    public ResponseEntity<String> update(
            @PathVariable Long qnaId,
            @RequestBody GroupDealQnaDTO dto) {

        dto.setQnaId(qnaId);
        service.updateQuestion(dto);
        return ResponseEntity.ok("수정 완료");
    }

    // ✅ 질문 삭제
    @DeleteMapping("/{qnaId}")
    public ResponseEntity<String> delete(@PathVariable Long qnaId) {
        service.deleteQuestion(qnaId);
        return ResponseEntity.ok("삭제 완료");
    }

    // ✅ 답변 등록
    @PostMapping("/{qnaId}/answer")
    public ResponseEntity<String> insertAnswer(
            @PathVariable Long qnaId,
            @RequestBody GroupDealQnaDTO dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String responderId = (auth != null ? auth.getName() : null);

        if (responderId == null || "anonymousUser".equals(responderId)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요한 요청입니다.");
        }

        dto.setQnaId(qnaId);
        dto.setResponderId(responderId);

        service.insertAnswer(dto);
        return ResponseEntity.ok("답변 등록 완료");
    }

    // ✅ 답변 수정
    @PutMapping("/{qnaId}/answer")
    public ResponseEntity<String> updateAnswer(
            @PathVariable Long qnaId,
            @RequestBody GroupDealQnaDTO dto) {

        dto.setQnaId(qnaId);
        service.updateAnswer(dto);
        return ResponseEntity.ok("답변 수정 완료");
    }

    // ✅ 답변 삭제
    @DeleteMapping("/{qnaId}/answer")
    public ResponseEntity<String> deleteAnswer(@PathVariable Long qnaId) {
        service.deleteAnswer(qnaId);
        return ResponseEntity.ok("답변 삭제 완료");
    }
}
