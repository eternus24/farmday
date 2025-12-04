package com.farmday.help.service;

import com.farmday.help.dto.CsArticleResponseDto;
import com.farmday.help.mapper.CsArticleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CsArticleServiceImpl implements CsArticleService {

    private final CsArticleMapper csArticleMapper;

    @Override
    public List<CsArticleResponseDto> getGuideArticles() {
        return csArticleMapper.findGuideArticles();
    }
}