package com.farmday.help.controller;

import com.farmday.help.dto.FaqResponseDto;
import com.farmday.help.dto.CsArticleResponseDto;
import com.farmday.help.service.FaqService;
import com.farmday.help.service.CsArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/help")
@RequiredArgsConstructor
public class HelpCenterController {

    private final FaqService faqService;
    private final CsArticleService csArticleService;

    // ✅ FAQ 목록
    @GetMapping("/faq")
    public List<FaqResponseDto> getFaqList(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword
    ) {
        return faqService.getFaqList(categoryId, keyword);
    }

    // ✅ 이용 안내 · 정책 목록 (프론트: /api/help/articles)
    @GetMapping("/articles")
    public List<CsArticleResponseDto> getGuideArticles() {
        return csArticleService.getGuideArticles();
    }
}