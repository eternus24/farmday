// src/main/java/com/farmday/groupdeal/service/GroupDealService.java
package com.farmday.groupdeal.service;

import com.farmday.groupdeal.domain.*;
import com.farmday.groupdeal.mapper.GroupDealMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupDealService {

    private final GroupDealMapper groupDealMapper;

    // 리스트 카드용
    public List<GroupDealCardDto> getActiveGroupDealCards() {
        // 1) 원래 쓰던 대로 카드 리스트 먼저 가져오고
        List<GroupDealCardDto> deals = groupDealMapper.selectActiveGroupDeals();

        // 2) 각 카드마다, 이미지가 비어 있으면 이미지 테이블에서 대표 이미지 한 장 가져오기
        for (GroupDealCardDto deal : deals) {
            if (deal.getImageUrl() == null || deal.getImageUrl().isEmpty()) {
                List<GroupDealImage> images =
                        groupDealMapper.selectGroupDealImagesByDealId(deal.getGroupDealId()); // ← Mapper에 이미 있음

                if (images != null && !images.isEmpty()) {
                    // 첫 번째 이미지를 썸네일로 사용
                    deal.setImageUrl(images.get(0).getImageUrl());
                }
            }
        }

        return deals;
    }

    // 상세 페이지 상단용
    public GroupDealDetailDto getGroupDealDetail(Long groupDealId) {
        GroupDealDetailDto detail = groupDealMapper.selectGroupDealDetail(groupDealId);
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않는 공동구매입니다.");
        }
        // 🔽 여기부터 "이미지 리스트" 채우는 부분 추가
        List<GroupDealImage> images = groupDealMapper.selectGroupDealImagesByDealId(groupDealId);

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = images.stream()
                    .map(GroupDealImage::getImageUrl)
                    .filter(url -> url != null && !url.isEmpty())
                    .collect(Collectors.toList());

            // Detail DTO에 이미지 URL 리스트 세팅
            detail.setImageUrls(imageUrls);
        }
        // 🔼 여기까지 추가

        return detail;
    }
}
