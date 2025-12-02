// src/main/java/com/farmday/banner/controller/BannerAdminController.java
package com.farmday.banner.controller;

import com.farmday.banner.domain.Banner;
import com.farmday.banner.dto.BannerSaveRequest;
import com.farmday.banner.dto.BannerUpdateRequest;
import com.farmday.banner.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BannerAdminController {

    private final BannerService bannerService;

    // 관리자 목록 조회
    @GetMapping("/api/admin/banners")
    public ResponseEntity<List<Banner>> getAdminBanners() {
        return ResponseEntity.ok(bannerService.getAdminBannerList());
    }

    // 등록
    @PostMapping("/api/admin/banners")
    public ResponseEntity<Banner> createBanner(
            @RequestBody BannerSaveRequest request,
            Authentication authentication) {

        String adminUserId = authentication != null ? authentication.getName() : "ADMIN";
        Banner created = bannerService.createBanner(request, adminUserId);
        return ResponseEntity.ok(created);
    }

    // 수정
    @PutMapping("/api/admin/banners/{bannerId}")
    public ResponseEntity<Banner> updateBanner(
            @PathVariable Long bannerId,
            @RequestBody BannerUpdateRequest request) {

        Banner updated = bannerService.updateBanner(bannerId, request);
        return ResponseEntity.ok(updated);
    }

    // 삭제
    @DeleteMapping("/api/admin/banners/{bannerId}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long bannerId) {
        bannerService.deleteBanner(bannerId);
        return ResponseEntity.ok().build();
    }

    // 메인 화면용 활성 배너 (최신 5개)
    @GetMapping("/api/banners/active")
    public ResponseEntity<List<Banner>> getActiveBannersForMain() {
        return ResponseEntity.ok(bannerService.getActiveBannersForMain());
    }
}