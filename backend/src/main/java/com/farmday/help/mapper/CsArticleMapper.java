package com.farmday.help.mapper;

import com.farmday.help.dto.CsArticleResponseDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CsArticleMapper {

    // 고객센터 GUIDE 탭에서 사용할 문서들 조회
    List<CsArticleResponseDto> findGuideArticles();
}