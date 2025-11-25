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

    // ===========================
    //  📌 IMAGE (이미지)
    // ===========================
    List<GroupDealImage> selectGroupDealImagesByDealId(@Param("groupDealId") Long groupDealId);

}
