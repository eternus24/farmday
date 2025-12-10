package com.farmday.groupdeal.qna.service;

import java.util.List;
import com.farmday.groupdeal.qna.dto.GroupDealQnaDTO;

public interface GroupDealQnaService {

    void insertQuestion(GroupDealQnaDTO dto);

    List<GroupDealQnaDTO> getQnaByGroupDeal(Long groupDealId);

    void updateQuestion(GroupDealQnaDTO dto);

    void deleteQuestion(Long qnaId);

    void insertAnswer(GroupDealQnaDTO dto);

    void updateAnswer(GroupDealQnaDTO dto);

    void deleteAnswer(Long qnaId);

    GroupDealQnaDTO findById(Long qnaId);
}
