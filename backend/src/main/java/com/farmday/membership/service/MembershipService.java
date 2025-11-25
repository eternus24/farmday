// backend/src/main/java/com/farmday/membership/service/MembershipService.java
package com.farmday.membership.service;

public interface MembershipService {
    void applyPaidOrder(Long userNo, Long paidAmount);
}