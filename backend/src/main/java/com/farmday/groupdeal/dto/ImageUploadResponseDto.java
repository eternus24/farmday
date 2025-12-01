// 경로: backend/src/main/java/com/farmday/groupdeal/dto/ImageUploadResponseDto.java
package com.farmday.groupdeal.dto;

import lombok.Data;

/**
 * 이미지 업로드 후 프론트에 돌려줄 응답 DTO
 * - imageUrl: 브라우저/프론트에서 사용할 이미지 접근 URL
 */
@Data
public class ImageUploadResponseDto {

    private String imageUrl;
}
