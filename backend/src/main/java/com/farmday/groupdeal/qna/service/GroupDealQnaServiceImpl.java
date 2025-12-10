package com.farmday.groupdeal.qna.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.farmday.groupdeal.qna.dto.GroupDealQnaDTO;
import com.farmday.groupdeal.qna.mapper.GroupDealQnaMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupDealQnaServiceImpl implements GroupDealQnaService {

    private final GroupDealQnaMapper mapper;

    @Override
    @Transactional
    public void insertQuestion(GroupDealQnaDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().isEmpty()) {
            throw new IllegalArgumentException("제목은 필수입니다.");
        }
        mapper.insertQuestion(dto);
    }

    @Override
    public List<GroupDealQnaDTO> getQnaByGroupDeal(Long groupDealId) {
        return mapper.getQnaByGroupDeal(groupDealId);
    }

    @Override
    public void updateQuestion(GroupDealQnaDTO dto) {
        mapper.updateQuestion(dto);
    }

    @Override
    public void deleteQuestion(Long qnaId) {
        mapper.deleteQuestion(qnaId);
    }

    @Override
    public void insertAnswer(GroupDealQnaDTO dto) {
        mapper.insertAnswer(dto);
    }

    @Override
    public void updateAnswer(GroupDealQnaDTO dto) {
        mapper.updateAnswer(dto);
    }

    @Override
    public void deleteAnswer(Long qnaId) {
        mapper.deleteAnswer(qnaId);
    }

    @Override
    public GroupDealQnaDTO findById(Long qnaId) {
        return mapper.findById(qnaId);
    }
}
