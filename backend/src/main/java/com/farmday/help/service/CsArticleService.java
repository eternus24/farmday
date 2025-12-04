package com.farmday.help.service;

import com.farmday.help.dto.CsArticleResponseDto;

import java.util.List;

public interface CsArticleService {

    List<CsArticleResponseDto> getGuideArticles();
}