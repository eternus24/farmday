// src/main/java/com/farmday/banner/service/BannerServiceImpl.java
package com.farmday.admin.service;

import com.farmday.admin.domain.Banner;
import com.farmday.admin.dto.BannerSaveRequest;
import com.farmday.admin.dto.BannerUpdateRequest;
import com.farmday.admin.mapper.BannerMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BannerServiceImpl implements BannerService {

    private final BannerMapper bannerMapper;

    @Override
    @Transactional(readOnly = true)
    public List<Banner> getAdminBannerList() {
        return bannerMapper.findAllForAdmin();
    }

    @Override
    public Banner createBanner(BannerSaveRequest dto, String adminUserId) {

        // (선택) 서버에서도 5개 제한 걸고 싶으면:
        // int activeCount = bannerMapper.countActiveBanners();
        // if ("Y".equals(dto.getIsActive()) && activeCount >= 5) {
        //     throw new IllegalStateException("활성 배너는 최대 5개까지 가능합니다.");
        // }

        Long newId = bannerMapper.getNextBannerId();

        Banner banner = new Banner();
        banner.setBannerId(newId);
        banner.setTitle(dto.getTitle());
        banner.setImageUrl(dto.getImageUrl());
        banner.setLinkUrl(dto.getLinkUrl());
        banner.setIsActive(dto.getIsActive());
        banner.setStartDate(dto.getStartDate());
        banner.setEndDate(dto.getEndDate());
        banner.setCreatedBy(adminUserId);

        bannerMapper.insertBanner(banner);
        return bannerMapper.findById(newId);
    }

    @Override
    public Banner updateBanner(Long bannerId, BannerUpdateRequest dto) {
        Banner existing = bannerMapper.findById(bannerId);
        if (existing == null) {
            throw new IllegalArgumentException("배너를 찾을 수 없습니다. id=" + bannerId);
        }

        // (선택) 서버에서도 5개 제한
        // if ("Y".equals(dto.getIsActive()) && !"Y".equals(existing.getIsActive())) {
        //     int activeCount = bannerMapper.countActiveBanners();
        //     if (activeCount >= 5) {
        //         throw new IllegalStateException("활성 배너는 최대 5개까지 가능합니다.");
        //     }
        // }

        existing.setTitle(dto.getTitle());
        existing.setImageUrl(dto.getImageUrl());
        existing.setLinkUrl(dto.getLinkUrl());
        existing.setIsActive(dto.getIsActive());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());

        bannerMapper.updateBanner(existing);
        return bannerMapper.findById(bannerId);
    }

    @Override
    public void deleteBanner(Long bannerId) {
        bannerMapper.deleteBanner(bannerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Banner> getActiveBannersForMain() {
        return bannerMapper.findActiveBannersForMain();
    }
}