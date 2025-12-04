package com.farmday.help.dto;

import lombok.Data;

@Data
public class FaqResponseDto {
    private Long faqId;
    private Long categoryId;
    private String categoryName;
    private String question;
    private String answer;
    private Integer viewCount;
    private Integer likeCount;
    private Integer dislikeCount;
}