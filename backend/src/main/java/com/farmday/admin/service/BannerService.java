// src/main/java/com/farmday/banner/service/BannerService.java
package com.farmday.admin.service;

import com.farmday.admin.domain.Banner;
import com.farmday.admin.dto.BannerSaveRequest;
import com.farmday.admin.dto.BannerUpdateRequest;

import java.util.List;

public interface BannerService {

    List<Banner> getAdminBannerList();

    Banner createBanner(BannerSaveRequest dto, String adminUserId);

    Banner updateBanner(Long bannerId, BannerUpdateRequest dto);

    void deleteBanner(Long bannerId);

    List<Banner> getActiveBannersForMain();
}