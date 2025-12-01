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
}
