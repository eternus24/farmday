package com.farmday.membership.mapper;

import com.farmday.membership.domain.MembershipGrade;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MembershipGradeMapper {

    MembershipGrade findGradeByAmount(@Param("amount") Long amount);

    MembershipGrade findNextGradeByAmount(@Param("amount") Long amount);
}