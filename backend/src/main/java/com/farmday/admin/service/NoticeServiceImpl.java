// src/main/java/com/farmday/notice/service/NoticeServiceImpl.java
package com.farmday.admin.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmday.admin.domain.Notice;
import com.farmday.admin.domain.NoticeImage;
import com.farmday.admin.dto.NoticeImageDto;
import com.farmday.admin.dto.NoticeResponseDto;
import com.farmday.admin.dto.NoticeSaveRequest;
import com.farmday.admin.mapper.NoticeMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeServiceImpl implements NoticeService {

    private final NoticeMapper noticeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<NoticeResponseDto> getAllNotices() {
        List<NoticeResponseDto> notices = noticeMapper.findAllNotices();
        if (notices.isEmpty()) {
            return notices;
        }

        for (NoticeResponseDto notice : notices) {
            List<NoticeImageDto> images =
                noticeMapper.findImagesByNoticeId(notice.getNoticeId());
            notice.setImages(images);
        }

        return notices;
    }

    @Override
    public NoticeResponseDto createNotice(String adminId, NoticeSaveRequest request) {
        Long noticeId = noticeMapper.getNextNoticeId();

        Notice notice = Notice.builder()
                .noticeId(noticeId)
                .adminId(adminId)
                .title(request.getTitle())
                .content(request.getContent())
                .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
                .viewCount(0L)
                .build();

        noticeMapper.insertNotice(notice);

        saveImages(noticeId, request.getImages());

        // 단건 다시 조회해서 리턴
        NoticeResponseDto dto = noticeMapper.findNoticeById(noticeId);
        if (dto != null) {
            List<NoticeImageDto> images = noticeMapper.findImagesByNoticeId(noticeId);
            dto.setImages(images);
        }
        return dto;
    }

    @Override
    public NoticeResponseDto updateNotice(Long noticeId, NoticeSaveRequest request) {

        Notice notice = Notice.builder()
                .noticeId(noticeId)
                .title(request.getTitle())
                .content(request.getContent())
                .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
                .build();

        noticeMapper.updateNotice(notice);

        // 이미지 전체 갈아끼우기(간단한 방식)
        noticeMapper.deleteImagesByNoticeId(noticeId);
        saveImages(noticeId, request.getImages());

        NoticeResponseDto dto = noticeMapper.findNoticeById(noticeId);
        if (dto != null) {
            List<NoticeImageDto> images = noticeMapper.findImagesByNoticeId(noticeId);
            dto.setImages(images);
        }
        return dto;
    }

    @Override
    public void deleteNotice(Long noticeId) {
        // NOTICE_IMAGE는 FK ON DELETE CASCADE 설정했으면 아래 deleteImagesByNoticeId는 생략 가능
        noticeMapper.deleteImagesByNoticeId(noticeId);
        noticeMapper.deleteNotice(noticeId);
    }

    // ====================
    // 내부 헬퍼
    // ====================
    private void saveImages(Long noticeId, List<NoticeImageDto> imageDtos) {
        // 이미지가 없으면 아무 것도 안 함
        if (imageDtos == null || imageDtos.isEmpty()) {
            return;
        }

        int idx = 0;
        for (NoticeImageDto dto : imageDtos) {
            if (dto == null || dto.getImageUrl() == null || dto.getImageUrl().trim().isEmpty()) {
                continue; // 이미지 URL 없는 항목은 스킵
            }

            // ⚠️ 여기서 "매번" 시퀀스 NEXTVAL을 뽑아야 PK 중복이 안 난다!
            Long imageId = noticeMapper.getNextNoticeImageId();

            Integer sortOrder = dto.getSortOrder();
            if (sortOrder == null) {
                sortOrder = ++idx; // 정렬 순서가 없으면 1,2,3... 자동 부여
            }

            NoticeImage entity = NoticeImage.builder()
                    .imageId(imageId)             // ★ PK: 매번 다른 값
                    .noticeId(noticeId)           // FK
                    .imageUrl(dto.getImageUrl())
                    .sortOrder(sortOrder)
                    .build();

            noticeMapper.insertNoticeImage(entity);
        }
    }
}