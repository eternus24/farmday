package com.farmday.help.service;

import com.farmday.help.dto.FaqResponseDto;

import java.util.List;

public interface FaqService {

    List<FaqResponseDto> getFaqList(Long categoryId, String keyword);
}