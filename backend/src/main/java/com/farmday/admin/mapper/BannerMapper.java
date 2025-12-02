// src/main/java/com/farmday/banner/mapper/BannerMapper.java
package com.farmday.admin.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.farmday.admin.domain.Banner;

import java.util.List;

@Mapper
public interface BannerMapper {

    Long getNextBannerId();

    void insertBanner(Banner banner);

    void updateBanner(Banner banner);

    void deleteBanner(Long bannerId);

    Banner findById(Long bannerId);

    // 관리자 페이지 목록용 (최신순)
    List<Banner> findAllForAdmin();

    // 메인 화면 노출용 (active + 기간, 최신순 5개)
    List<Banner> findActiveBannersForMain();

    // (선택) 활성 배너 개수 (서버에서 5개 제한 걸고 싶으면 사용)
    int countActiveBanners();
}