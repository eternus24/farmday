// 경로: backend/src/main/java/com/farmday/groupdeal/controller/GroupDealController.java
package com.farmday.groupdeal.controller;

import com.farmday.groupdeal.dto.GroupDealDetailResponseDto;
import com.farmday.groupdeal.dto.GroupDealJoinRequestDto;
import com.farmday.groupdeal.dto.GroupDealListResponseDto;
import com.farmday.groupdeal.service.GroupDealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// 공동구매 관련 REST 컨트롤러 (소비자용)
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GroupDealController {

    private final GroupDealService groupDealService;

    // 실제 파일 저장 경로 (물리 경로) - WebMvcConfig 의 /uploads/** 와 연동
    private static final String GROUP_DEAL_UPLOAD_DIR = "F:/farmday/uploads/groupdeal";

    // 공동구매 목록 조회 (소비자)
    @GetMapping("/group-deals")
    public ResponseEntity<List<GroupDealListResponseDto>> getGroupDealList(
            @RequestParam(value = "status", required = false) String status
    ) {
        List<GroupDealListResponseDto> list = groupDealService.getGroupDealList(status);
        return ResponseEntity.ok(list);
    }

    // 공동구매 상세 조회 (소비자)
    @GetMapping("/group-deals/{groupDealId}")
    public ResponseEntity<GroupDealDetailResponseDto> getGroupDealDetail(
            @PathVariable("groupDealId") Long groupDealId
    ) {
        GroupDealDetailResponseDto detail = groupDealService.getGroupDealDetail(groupDealId);
        if (detail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detail);
    }

    // 공동구매 참여 (소비자)
    @PostMapping("/group-deals/{groupDealId}/join")
    public ResponseEntity<Void> joinGroupDeal(
            @PathVariable("groupDealId") Long groupDealId,
            @RequestBody GroupDealJoinRequestDto request,
            Principal principal
    ) {
        // 실제 구현에서는 principal 또는 SecurityContext 에서 userId 꺼내서 사용
        String userId = principal != null ? principal.getName() : "test-user";

        groupDealService.joinGroupDeal(userId, groupDealId, request.getQuantity());
        return ResponseEntity.ok().build();
    }

    /**
     * 공동구매 이미지 업로드 (공통)
     *
     * - POST /api/group-deals/image/upload
     * - 요청 형식: multipart/form-data
     *   - file : 이미지 파일 1개
     * - 응답 형식: { "imageUrl": "http://서버주소/uploads/groupdeal/파일명" }
     */
    @PostMapping(
            value = "/group-deals/image/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> uploadGroupDealImage(
            @RequestPart("file") MultipartFile file,
            HttpServletRequest request
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Path uploadPath = Paths.get(GROUP_DEAL_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String ext = StringUtils.getFilenameExtension(originalFilename);
            if (ext == null || ext.isEmpty()) {
                ext = "jpg";
            }

            // 랜덤 파일명 생성
            String savedName = "groupdeal-" + UUID.randomUUID() + "." + ext;
            Path filePath = uploadPath.resolve(savedName);

            // 실제 파일 저장
            file.transferTo(filePath.toFile());

            String baseUrl = request.getScheme() + "://" + request.getServerName()
                    + ":" + request.getServerPort();
            // Web 에서 접근할 경로 (/uploads/** 는 WebMvcConfig 에서 매핑)
            String urlPath = baseUrl + "/uploads/groupdeal/" + savedName;

            Map<String, String> body = new HashMap<>();
            body.put("imageUrl", urlPath);

            return ResponseEntity.ok(body);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
