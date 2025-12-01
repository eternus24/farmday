// 경로: backend/src/main/java/com/farmday/groupdeal/service/GroupDealSellerService.java
package com.farmday.groupdeal.service;

import com.farmday.groupdeal.dto.GroupDealCreateRequestDto;

public interface GroupDealSellerService {

    void createGroupDeal(String sellerUserId, GroupDealCreateRequestDto dto);
}
