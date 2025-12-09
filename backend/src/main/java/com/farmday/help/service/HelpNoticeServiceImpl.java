// src/main/java/com/farmday/help/service/NoticeServiceImpl.java
package com.farmday.help.service;

import com.farmday.help.dto.HelpNoticeDetailDto;
import com.farmday.help.dto.HelpNoticeDto;
import com.farmday.help.mapper.HelpNoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HelpNoticeServiceImpl implements HelpNoticeService {

    private final HelpNoticeMapper noticeMapper;

    @Override
    public List<HelpNoticeDto> getNoticeList(int page, int size) {
      int offset = page * size;   // 프론트에서 page 0부터 들어옴
      return noticeMapper.findNotices(offset, size);
    }

    @Override
    @Transactional
    public HelpNoticeDto getNotice(Long noticeId) {
      // 조회수 증가 + 상세조회
      noticeMapper.increaseViewCount(noticeId);
      return noticeMapper.findNoticeById(noticeId);
    }

    @Override
    public HelpNoticeDetailDto getNoticeDetail(Long noticeId) {
        return noticeMapper.findNoticeDetail(noticeId);
    }

}