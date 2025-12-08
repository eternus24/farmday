// 경로: backend/src/main/java/com/farmday/groupdeal/mapper/GroupDealMapper.java
package com.farmday.groupdeal.mapper;

import com.farmday.groupdeal.dto.GroupDealCreateRequestDto;
import com.farmday.groupdeal.dto.GroupDealDetailResponseDto;
import com.farmday.groupdeal.dto.GroupDealImageDto;
import com.farmday.groupdeal.dto.GroupDealListResponseDto;
import com.farmday.groupdeal.dto.GroupDealDashboardResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GroupDealMapper {

    // 공동구매 목록 조회 (상태 선택)
    List<GroupDealListResponseDto> selectGroupDealList(@Param("status") String status);

    // 공동구매 상세 (기본 정보)
    GroupDealDetailResponseDto selectGroupDealDetail(@Param("groupDealId") Long groupDealId);

    // 공동구매 상세 이미지 목록
    List<GroupDealImageDto> selectGroupDealImages(@Param("groupDealId") Long groupDealId);

    // 공동구매 등록
    int insertGroupDeal(GroupDealCreateRequestDto dto);

    // 공동구매 이미지 등록
    int insertGroupDealImage(GroupDealImageDto imageDto);

    // 공동구매 참여 INSERT
    int insertGroupDealMember(@Param("groupDealId") Long groupDealId,
                              @Param("userId") String userId,
                              @Param("quantity") Integer quantity);

    // current_quantity 증가
    int increaseCurrentQuantity(@Param("groupDealId") Long groupDealId,
                                @Param("quantity") Integer quantity);

    // 특정 유저가 이미 참여한 수량 합계 (1인당 제한 체크용)
    Integer selectUserTotalQuantity(@Param("groupDealId") Long groupDealId,
                                    @Param("userId") String userId);

    // 공동구매 한 건 조회 (제한/상태 체크용, 필요 필드만)
    GroupDealDetailResponseDto selectGroupDealForJoinCheck(@Param("groupDealId") Long groupDealId);

    // ✅ 생산자 대시보드용: 공동구매 참여자 리스트 조회
    List<GroupDealDashboardResponse.Participant> selectGroupDealParticipants(
            @Param("groupDealId") Long groupDealId
    );

    // 생산자별 공동구매 목록 조회
    List<GroupDealListResponseDto> selectGroupDealListByProducer(@Param("createdBy") String createdBy);

    // 공동구매 수정
    int updateGroupDeal(GroupDealCreateRequestDto dto);

    // 공동구매 중단 (status 변경)
    int stopGroupDeal(@Param("groupDealId") Long groupDealId, @Param("status") String status);

    // 공동구매 삭제 (is_active = 'N')
    int deleteGroupDeal(@Param("groupDealId") Long groupDealId);

    // 공동구매 이미지 삭제
    int deleteGroupDealImages(@Param("groupDealId") Long groupDealId);
}