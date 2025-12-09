// src/main/java/com/farmday/help/service/NoticeService.java
package com.farmday.help.service;

import com.farmday.help.dto.HelpNoticeDetailDto;
import com.farmday.help.dto.HelpNoticeDto;

import java.util.List;

public interface HelpNoticeService {

    List<HelpNoticeDto> getNoticeList(int page, int size);

    HelpNoticeDto getNotice(Long noticeId);

    HelpNoticeDetailDto getNoticeDetail(Long noticeId);
    
}