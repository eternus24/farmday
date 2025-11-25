package com.farmday.membership.service;

import com.farmday.membership.domain.MembershipGrade;
import com.farmday.membership.dto.MembershipStatusResponse;
import com.farmday.membership.mapper.MembershipGradeMapper;
import com.farmday.membership.mapper.UserMembershipMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MembershipQueryServiceImpl implements MembershipQueryService {

    private final UserMembershipMapper userMembershipMapper;
    private final MembershipGradeMapper membershipGradeMapper;

    @Override
    @Transactional(readOnly = true)
    public MembershipStatusResponse getMyMembershipStatus(Long userNo) {

        MembershipStatusResponse status = userMembershipMapper.findMembershipStatus(userNo);
        if (status == null) {
            return null;
        }

        Long yearAmount = status.getYearSpentAmount();
        if (yearAmount == null) {
            yearAmount = 0L;
            status.setYearSpentAmount(0L);
        }

        // 1) 다음 등급 찾기
        MembershipGrade nextGrade = membershipGradeMapper.findNextGradeByAmount(yearAmount);

        if (nextGrade != null) {
            status.setNextGradeCode(nextGrade.getGradeCode());
            status.setNextGradeName(nextGrade.getGradeName());

            long needAmount = nextGrade.getMinAmount() - yearAmount;
            if (needAmount < 0) needAmount = 0;
            status.setNextGradeNeedAmount(needAmount);
        } else {
            // 이미 최고 등급일 때
            status.setNextGradeCode(null);
            status.setNextGradeName(null);
            status.setNextGradeNeedAmount(0L);
        }

        return status;
    }
}