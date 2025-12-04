package com.farmday.help.dto;

import lombok.Data;

import java.util.Date;

@Data
public class CsArticleResponseDto {

    private Long articleId;
    private String slug;
    private String title;
    private String content;
    private String articleType;  // ABOUT / GUIDE / POLICY / TERMS 등
    private Long categoryId;
    private String isPublished;
    private Date publishedAt;
}