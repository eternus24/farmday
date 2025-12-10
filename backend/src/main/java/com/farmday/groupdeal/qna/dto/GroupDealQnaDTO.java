package com.farmday.groupdeal.qna.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class GroupDealQnaDTO {

    private Long qnaId;          // QNA_ID
    private Long groupDealId;    // GROUP_DEAL_ID
    private Long parentId;       // PARENT_ID (지금은 안 써도 됨)

    private String userId;       // USER_ID (질문 작성자 ID)
    private String title;        // TITLE
    private String content;      // CONTENT
    private String isPrivate;    // IS_PRIVATE (Y / N)

    private String status;       // STATUS (WAITING / ANSWERED 등)

    private String responderId;  // RESPONDER_ID (답변자 ID)
    private String answerContent;// ANSWER_CONTENT

    private LocalDateTime answeredAt;   // ANSWERED_AT
    private LocalDateTime createdDate;  // CREATED_DATE
    private LocalDateTime updatedDate;  // UPDATED_DATE
}
