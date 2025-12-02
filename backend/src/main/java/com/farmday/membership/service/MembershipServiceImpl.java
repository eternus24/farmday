// backend/src/main/java/com/farmday/membership/service/MembershipServiceImpl.java
package com.farmday.membership.service;

import com.farmday.membership.domain.MembershipGrade;
import com.farmday.membership.mapper.MembershipGradeMapper;
import com.farmday.membership.mapper.UserMembershipMapper;
import com.farmday.membership.dto.MembershipStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService {

    private final UserMembershipMapper userMembershipMapper;
    private final MembershipGradeMapper membershipGradeMapper;

    @Override
    @Transactional
    public void applyPaidOrder(Long userNo, Long paidAmount) {

        // 1) 누적 금액 증가
        userMembershipMapper.addSpentAmount(userNo, paidAmount);

        // 2) 최신 year_spent_amount 조회
        MembershipStatusResponse status = userMembershipMapper.findMembershipStatus(userNo);
        Long yearAmount = status.getMonthSpentAmount();

        // 3) 해당 금액에 맞는 등급 찾기
        MembershipGrade newGrade = membershipGradeMapper.findGradeByAmount(yearAmount);
        if (newGrade == null) {
            return;
        }

        // 이미 그 등급이면 변경 안 해도 됨 (쿼리 줄이고 싶으면 조건 체크 가능)
        if (!newGrade.getGradeCode().equals(status.getGradeCode())) {
            userMembershipMapper.updateGrade(
                    userNo,
                    newGrade.getGradeCode(),
                    newGrade.getGradeName()
            );
        }
    }
}