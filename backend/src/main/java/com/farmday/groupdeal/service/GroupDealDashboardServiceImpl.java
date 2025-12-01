// 경로: backend/src/main/java/com/farmday/groupdeal/service/GroupDealDashboardServiceImpl.java
package com.farmday.groupdeal.service;

import com.farmday.groupdeal.dto.GroupDealDashboardResponse;
import com.farmday.groupdeal.dto.GroupDealDetailResponseDto;
import com.farmday.groupdeal.mapper.GroupDealMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GroupDealDashboardServiceImpl implements GroupDealDashboardService {

    // 소비자용 상세 서비스 (기존에 있던 서비스 재활용)
    private final GroupDealService groupDealService;

    // 참여자 / 기타 부가 데이터 조회용 mapper
    private final GroupDealMapper groupDealMapper;

    @Override
    public GroupDealDashboardResponse getDashboard(Long groupDealId, Long producerId) {

        // 1) 기본 공동구매 상세 정보 조회
        GroupDealDetailResponseDto detail = groupDealService.getGroupDealDetail(groupDealId);
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않는 공동구매입니다.");
        }

        // TODO: producerId != null 이라면, 해당 공동구매가 이 생산자의 것인지 체크 로직 추가 가능

        // 2) 대시보드 DTO로 변환
        GroupDealDashboardResponse dto = new GroupDealDashboardResponse();

        // ====== 기본 정보 매핑 ======
        dto.setGroupDealId(detail.getGroupDealId());
        dto.setProductId(detail.getProductId());
        dto.setTitle(detail.getTitle());
        dto.setSubTitle(detail.getSubTitle());

        // dealPrice / discountRate 타입에 따라 변환
        if (detail.getDealPrice() != null) {
            dto.setDealPrice(detail.getDealPrice().intValue()); // 가격: 정수형으로 변환
        }
        if (detail.getDiscountRate() != null) {
            dto.setDiscountRate(detail.getDiscountRate().doubleValue()); // 할인율: 실수형으로 변환
        }

        dto.setMinMemberCount(detail.getMinMemberCount());
        dto.setMaxMemberCount(detail.getMaxMemberCount());
        dto.setCurrentQuantity(detail.getCurrentQuantity());
        dto.setStatus(detail.getStatus());

        // 날짜/기간 문자열 변환
        dto.setStartAt(
                detail.getStartAt() != null ? detail.getStartAt().toString() : null
        );
        dto.setEndAt(
                detail.getEndAt() != null ? detail.getEndAt().toString() : null
        );
        dto.setShippingStartDate(
                detail.getShippingStartDate() != null ? detail.getShippingStartDate().toString() : null
        );
        dto.setShippingEndDate(
                detail.getShippingEndDate() != null ? detail.getShippingEndDate().toString() : null
        );

        // 아직 구현 안 된 필드들은 일단 null/기본값
        dto.setProductName(null);   // TODO: PRODUCT 테이블 조인해서 product_name 가져오기
        dto.setMarketPrice(null);   // TODO: 시세 테이블/외부 API 연동 후 세팅
        dto.setMainImageUrl(null);  // TODO: GROUP_DEAL_IMAGE 에서 대표 이미지 조회해서 세팅
        dto.setCreatedAt(null);     // TODO: created_date 컬럼 추가/매핑 후 세팅
        dto.setUpdatedAt(null);     // TODO: updated_date 컬럼 추가/매핑 후 세팅

        // 3) 참여자 리스트 조회 (DTO 안의 static 클래스 Participant)
        dto.setParticipants(
                groupDealMapper.selectGroupDealParticipants(groupDealId)
        );

        // 4) 공지 / Q&A / 리뷰는 아직 기능 미구현 → 비어있는 리스트로 내려주기
        dto.setNotices(Collections.emptyList());
        dto.setQuestions(Collections.emptyList());
        dto.setReviews(Collections.emptyList());

        return dto;
    }
}
