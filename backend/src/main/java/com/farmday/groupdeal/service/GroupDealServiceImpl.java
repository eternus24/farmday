// 경로: backend/src/main/java/com/farmday/groupdeal/service/GroupDealServiceImpl.java
package com.farmday.groupdeal.service;

import com.farmday.groupdeal.dto.GroupDealCreateRequestDto;
import com.farmday.groupdeal.dto.GroupDealDetailResponseDto;
import com.farmday.groupdeal.dto.GroupDealImageDto;
import com.farmday.groupdeal.dto.GroupDealListResponseDto;
import com.farmday.groupdeal.mapper.GroupDealMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupDealServiceImpl implements GroupDealService {

    private final GroupDealMapper groupDealMapper;

    @Override
    public List<GroupDealListResponseDto> getGroupDealList(String status) {
        return groupDealMapper.selectGroupDealList(status);
    }

    @Override
    public GroupDealDetailResponseDto getGroupDealDetail(Long groupDealId) {

        GroupDealDetailResponseDto detail = groupDealMapper.selectGroupDealDetail(groupDealId);
        if (detail == null) return null;

        List<GroupDealImageDto> imageList = groupDealMapper.selectGroupDealImages(groupDealId);
        detail.setImages(imageList);

        return detail;
    }

    @Override
    @Transactional
    public void joinGroupDeal(String userId, Long groupDealId, Integer quantity) {

        Integer totalQty = groupDealMapper.selectUserTotalQuantity(groupDealId, userId);
        if (totalQty == null) totalQty = 0;

        // TODO: 총 수량 제한, 상태/기간 체크는 추후 groupDealMapper.selectGroupDealForJoinCheck 사용해서 보완 가능

        groupDealMapper.insertGroupDealMember(groupDealId, userId, quantity);
        groupDealMapper.increaseCurrentQuantity(groupDealId, quantity);
    }

    @Override
    @Transactional
    public Long createGroupDeal(String sellerUserId, GroupDealCreateRequestDto dto) {

        // 작성자 정보 세팅
        dto.setCreatedBy(sellerUserId);

        // GROUP_DEAL INSERT (시퀀스 → dto.groupDealId 설정됨)
        groupDealMapper.insertGroupDeal(dto);

        Long groupDealId = dto.getGroupDealId();

        int sortOrder = 1;

        // 이미지가 있으면 GROUP_DEAL_IMAGE 에 저장
        if (dto.getImageUrls() != null) {
            for (String imageUrl : dto.getImageUrls()) {
                GroupDealImageDto img = new GroupDealImageDto();
                img.setGroupDealId(groupDealId);
                img.setImageUrl(imageUrl);
                img.setSortOrder(sortOrder);
                groupDealMapper.insertGroupDealImage(img);
                sortOrder++;
            }
        }

        return groupDealId;
    }

    @Override
    public List<GroupDealListResponseDto> getGroupDealListByProducer(String createdBy) {
        return groupDealMapper.selectGroupDealListByProducer(createdBy);
    }

    @Override
    @Transactional
    public void updateGroupDeal(String sellerUserId, Long groupDealId, GroupDealCreateRequestDto dto) {
        // 작성자 확인
        GroupDealDetailResponseDto existing = groupDealMapper.selectGroupDealDetail(groupDealId);
        if (existing == null) {
            throw new IllegalArgumentException("공동구매를 찾을 수 없습니다.");
        }

        // 권한 체크는 컨트롤러에서 처리하므로 여기서는 dto에 groupDealId와 createdBy만 설정
        dto.setGroupDealId(groupDealId);
        dto.setCreatedBy(sellerUserId);

        // GROUP_DEAL UPDATE
        int updated = groupDealMapper.updateGroupDeal(dto);
        if (updated == 0) {
            throw new IllegalStateException("공동구매를 수정할 수 없습니다. 권한을 확인해주세요.");
        }

        // 이미지 재등록: 기존 이미지 삭제 후 새로 등록
        groupDealMapper.deleteGroupDealImages(groupDealId);

        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            int sortOrder = 1;
            for (String imageUrl : dto.getImageUrls()) {
                GroupDealImageDto img = new GroupDealImageDto();
                img.setGroupDealId(groupDealId);
                img.setImageUrl(imageUrl);
                img.setSortOrder(sortOrder);
                groupDealMapper.insertGroupDealImage(img);
                sortOrder++;
            }
        }
    }

    @Override
    @Transactional
    public void stopGroupDeal(String sellerUserId, Long groupDealId, String status) {
        // 작성자 확인
        GroupDealDetailResponseDto existing = groupDealMapper.selectGroupDealDetail(groupDealId);
        if (existing == null) {
            throw new IllegalArgumentException("공동구매를 찾을 수 없습니다.");
        }

        // 권한 체크는 컨트롤러에서 처리
        int updated = groupDealMapper.stopGroupDeal(groupDealId, status);
        if (updated == 0) {
            throw new IllegalStateException("공동구매 상태를 변경할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public void deleteGroupDeal(String sellerUserId, Long groupDealId) {
        // 작성자 확인
        GroupDealDetailResponseDto existing = groupDealMapper.selectGroupDealDetail(groupDealId);
        if (existing == null) {
            throw new IllegalArgumentException("공동구매를 찾을 수 없습니다.");
        }

        // 권한 체크는 컨트롤러에서 처리
        int deleted = groupDealMapper.deleteGroupDeal(groupDealId);
        if (deleted == 0) {
            throw new IllegalStateException("공동구매를 삭제할 수 없습니다.");
        }
    }
}