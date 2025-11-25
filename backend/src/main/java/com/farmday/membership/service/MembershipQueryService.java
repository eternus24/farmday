// backend/src/main/java/com/farmday/membership/service/MembershipQueryService.java

package com.farmday.membership.service;

import com.farmday.membership.dto.MembershipStatusResponse;

public interface MembershipQueryService {

    MembershipStatusResponse getMyMembershipStatus(Long userNo);
}