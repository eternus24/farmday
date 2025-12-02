// src/main/java/com/farmday/banner/service/BannerService.java
package com.farmday.banner.service;

import com.farmday.banner.domain.Banner;
import com.farmday.banner.dto.BannerSaveRequest;
import com.farmday.banner.dto.BannerUpdateRequest;

import java.util.List;

public interface BannerService {

    List<Banner> getAdminBannerList();

    Banner createBanner(BannerSaveRequest dto, String adminUserId);

    Banner updateBanner(Long bannerId, BannerUpdateRequest dto);

    void deleteBanner(Long bannerId);

    List<Banner> getActiveBannersForMain();
}