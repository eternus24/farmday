// 경로: backend/src/main/java/com/farmday/groupdeal/dto/GroupDealDashboardResponse.java

package com.farmday.groupdeal.dto;

import lombok.Data;
import java.util.List;

@Data
public class GroupDealDashboardResponse {

    // ====== 공동구매 기본 정보 ======
    private Long groupDealId;        // 공동구매 PK
    private Long productId;          // 상품 PK
    private String productName;      // 상품명 (프론트에서 보여줄 이름)

    private String title;            // 공동구매 제목
    private String subTitle;         // 부제목
    
    // 가격 정보
    private Integer dealPrice;       // 공동구매가 (실제 구매 가격)
    private Integer marketPrice;     // 최근 시세 평균 (없으면 null)
    private Double discountRate;     // 시세 대비 할인율 (프론트 표시용)

    // 모집 관련
    private Integer minMemberCount;  // 최소 모집 수량
    private Integer maxMemberCount;  // 최대 모집 수량
    private Integer currentQuantity; // 현재 구매 신청 수량

    private String status;           // 상태 (OPEN / PREPARE_SHIPPING / SHIPPING / DONE)

    // 모집 기간
    private String startAt;          // 모집 시작일
    private String endAt;            // 모집 마감일

    // 발송예정일 범위
    private String shippingStartDate;
    private String shippingEndDate;

    private String mainImageUrl;     // 대표 이미지 URL

    private String createdAt;        // 생성일
    private String updatedAt;        // 수정일


    // ==========================================================
    // 하단 탭: 참여자 / 공지 / Q&A / 리뷰
    // ==========================================================

    // 참여자(구매자) 리스트
    private List<Participant> participants;

    // 공지 리스트
    private List<Notice> notices;

    // 질문&답변 리스트
    private List<Question> questions;

    // 리뷰 리스트
    private List<Review> reviews;


    // =============================
    // 내부 DTO — 따로 파일 분리 안 함
    // =============================

    @Data
    public static class Participant {
        private Long participantId;  // 참여 ID
        private String memberId;       // 회원 ID
        private String memberName;   // 이름
        private String phone;        // 연락처
        private Integer quantity;    // 신청 수량
        private String status;       // 결제 상태 (옵션)
        private String createdAt;    // 참여일시
    }

    @Data
    public static class Notice {
        private Long noticeId;
        private String content;
        private String createdAt;
    }

    @Data
    public static class Question {
        private Long questionId;
        private String memberId;
        private String memberName;
        private String question;
        private String answer;       // 답변
        private String createdAt;    // 질문 시간
        private String answeredAt;   // 답변 시간
    }

    @Data
    public static class Review {
        private Long reviewId;
        private Long memberId;
        private String memberName;

        private Integer rating;      // 1~5 별점
        private String comment;      // 리뷰 내용

        private String producerReply; // 생산자 답글
        private String createdAt;     // 리뷰 작성일
        private String repliedAt;     // 답글 작성일
    }

}