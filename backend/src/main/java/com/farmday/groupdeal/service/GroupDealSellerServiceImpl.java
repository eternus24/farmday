// 경로: backend/src/main/java/com/farmday/groupdeal/service/GroupDealSellerServiceImpl.java
package com.farmday.groupdeal.service;

import com.farmday.groupdeal.dto.GroupDealCreateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GroupDealSellerServiceImpl implements GroupDealSellerService {

    private final GroupDealService groupDealService;

    @Override
    @Transactional
    public void createGroupDeal(String sellerUserId, GroupDealCreateRequestDto dto) {

        groupDealService.createGroupDeal(sellerUserId, dto);
    }
}
