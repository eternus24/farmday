package com.farmday.product.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class FileUploadUtil {

    // 이미지 저장 (파일명 반환)
    public String saveFile(String uploadDir, MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            return null;
        }

        // 업로드될 폴더가 없다면 생성
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 실제 저장 파일명 (중복 방지를 위해 UUID 사용)
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        // 저장 위치 만들기
        Path filePath = uploadPath.resolve(fileName);

        // 파일 저장
        file.transferTo(filePath.toFile());

        return fileName;
    }

    // 파일 삭제
    public void deleteFile(String uploadDir, String fileName) throws IOException {
        if (fileName == null) return;

        Path filePath = Paths.get(uploadDir).resolve(fileName);
        Files.deleteIfExists(filePath);
    }
}
