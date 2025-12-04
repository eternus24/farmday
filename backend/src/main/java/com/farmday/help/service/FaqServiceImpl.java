package com.farmday.help.service;

import com.farmday.help.dto.FaqResponseDto;
import com.farmday.help.mapper.FaqMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaqServiceImpl implements FaqService {

    private final FaqMapper faqMapper;

    @Override
    public List<FaqResponseDto> getFaqList(Long categoryId, String keyword) {
        return faqMapper.findFaqList(categoryId, keyword);
    }
}