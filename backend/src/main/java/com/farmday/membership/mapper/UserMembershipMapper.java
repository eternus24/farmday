// backend/src/main/java/com/farmday/membership/mapper/UserMembershipMapper.java

package com.farmday.membership.mapper;

import com.farmday.membership.dto.MembershipStatusResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMembershipMapper {
    void insertDefaultForNewUser(@Param("userNo") Long userNo,
                                 @Param("gradeCode") String gradeCode);

    void addSpentAmount(@Param("userNo") Long userNo,
                        @Param("deltaAmount") Long deltaAmount);

    void updateGrade(@Param("userNo") Long userNo,
                     @Param("gradeCode") String gradeCode,
                     @Param("gradeName") String gradeName);

    MembershipStatusResponse findMembershipStatus(@Param("userNo") Long userNo);
}