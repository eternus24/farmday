// src/main/java/com/farmday/notice/mapper/NoticeMapper.java
package com.farmday.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.farmday.admin.domain.Notice;
import com.farmday.admin.domain.NoticeImage;
import com.farmday.admin.dto.NoticeImageDto;
import com.farmday.admin.dto.NoticeResponseDto;

@Mapper
public interface NoticeMapper {

    // 시퀀스
    Long getNextNoticeId();
    Long getNextNoticeImageId();

    // 목록 / 단건
    List<NoticeResponseDto> findAllNotices();
    NoticeResponseDto findNoticeById(@Param("noticeId") Long noticeId);

    // 이미지
    List<NoticeImageDto> findImagesByNoticeId(@Param("noticeId") Long noticeId);

    // CUD
    int insertNotice(Notice notice);
    int updateNotice(Notice notice);
    int deleteNotice(@Param("noticeId") Long noticeId);

    int deleteImagesByNoticeId(@Param("noticeId") Long noticeId);
    int insertNoticeImage(NoticeImage noticeImage);
}