// src/main/java/com/farmday/help/mapper/NoticeMapper.java
package com.farmday.help.mapper;

import com.farmday.help.dto.HelpNoticeDetailDto;
import com.farmday.help.dto.HelpNoticeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface HelpNoticeMapper {

    // 리스트(페이징)
    List<HelpNoticeDto> findNotices(
            @Param("offset") int offset,
            @Param("size") int size
    );

    // 단건 조회
    HelpNoticeDto findNoticeById(@Param("noticeId") Long noticeId);

    // 조회수 +1
    void increaseViewCount(@Param("noticeId") Long noticeId);

    // 🔥 상세 + 이미지
    HelpNoticeDetailDto findNoticeDetail(@Param("noticeId") Long noticeId);

}