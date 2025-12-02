// src/main/java/com/farmday/notice/service/NoticeService.java
package com.farmday.admin.service;

import java.util.List;

import com.farmday.admin.dto.NoticeResponseDto;
import com.farmday.admin.dto.NoticeSaveRequest;

public interface NoticeService {

    List<NoticeResponseDto> getAllNotices();

    NoticeResponseDto createNotice(String adminId, NoticeSaveRequest request);

    NoticeResponseDto updateNotice(Long noticeId, NoticeSaveRequest request);

    void deleteNotice(Long noticeId);
}
