package com.farmday.groupdeal.qna.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.farmday.groupdeal.qna.dto.GroupDealQnaDTO;

@Mapper
public interface GroupDealQnaMapper {

    // 질문 등록
    void insertQuestion(GroupDealQnaDTO dto);

    // 공동구매 별 QnA 리스트
    List<GroupDealQnaDTO> getQnaByGroupDeal(@Param("groupDealId") Long groupDealId);

    // 질문 수정
    void updateQuestion(GroupDealQnaDTO dto);

    // 질문 삭제
    void deleteQuestion(Long qnaId);

    // 답변 등록
    void insertAnswer(GroupDealQnaDTO dto);

    // 답변 수정
    void updateAnswer(GroupDealQnaDTO dto);

    // 답변 삭제
    void deleteAnswer(Long qnaId);

    // 상태 변경
    void updateStatus(@Param("qnaId") Long qnaId, @Param("status") String status);

    // 특정 QnA 한 건 조회 (작성자/권한 체크용)
    GroupDealQnaDTO findById(Long qnaId);
}
