// [ADDED] S3 업로드용 컨트롤러 예시
// backend/src/main/java/com/farmday/mypage/AwsImageController.java
package com.farmday.AWS;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class AwsS3Controller {

    private final AwsS3Service awsS3Service;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        // [ADDED] S3로 업로드 후 URL 획득
        String url = awsS3Service.upload(file);

        // [ADDED] React에서 { url: "..." } 형식으로 받기 좋게 응답
        return ResponseEntity.ok(Collections.singletonMap("url", url));
    }
}