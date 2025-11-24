// src/main/java/com/farmday/groupdeal/mapper/GroupDealMapper.java
package com.farmday.groupdeal.mapper;

import com.farmday.groupdeal.domain.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GroupDealMapper {

    // ===========================
    //  📌 GROUP DEAL (상품)
    // ===========================

    // 리스트용 DTO
    List<GroupDealCardDto> selectActiveGroupDeals();

    // 디테일 페이지용 DTO
    GroupDealDetailDto selectGroupDealDetail(@Param("groupDealId") Long groupDealId);

    // 팀 생성 / 팀 참여 시 상품 단건 조회 (Entity)
    GroupDeal selectGroupDealById(@Param("groupDealId") Long groupDealId);


    // ===========================
    //  📌 IMAGE (이미지)
    // ===========================
    List<GroupDealImage> selectGroupDealImagesByDealId(@Param("groupDealId") Long groupDealId);

    // ===========================
    //  📌 TEAM (팀)
    // ===========================
    
    // 팀 리스트는 DTO로 리턴해야 프론트 구조랑 맞음!
    List<GroupDealTeamDto> selectTeamsByDealId(@Param("groupDealId") Long groupDealId);

    // 팀 단건 조회는 Entity로 리턴하는 게 자연스럽다
    GroupDealTeam selectTeamById(@Param("teamId") Long teamId);

    // 새 팀 생성
    void insertTeam(GroupDealTeam team);

    // 팀 인원수 변경
    void updateTeamMemberCount(@Param("teamId") Long teamId,
                               @Param("currentMemberCnt") Integer currentMemberCnt,
                               @Param("status") String status);


    // ===========================
    //  📌 MEMBER (팀 멤버)
    // ===========================
    void insertMember(GroupDealMember member);

    int countMembersByTeamId(@Param("teamId") Long teamId);

    int countMembersByTeamIdAndUserId(@Param("teamId") Long teamId,
                                      @Param("userId") String userId);
}
