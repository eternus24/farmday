package com.farmday.help.mapper;

import com.farmday.help.dto.FaqResponseDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FaqMapper {

    List<FaqResponseDto> findFaqList(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword
    );
}