package com.farmday.product.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class StoreDTO {
    
    private long storeId; //상점 ID
    private long producerId; //생산자 ID
    private String ownerUserId; //상점주인 user ID
    private String storeName; //상점명
    private String phone; //상점 전화번호
    private String addr; //상점 주소
    private String addrDetail; //상점 상세주소
    private String regionSi; //상점 지역
    private String regionGun; //상점 지역
    private String description; //상점 설명
    private String thumbnailUrl; //상점 썸네일 이미지 URL
    private String status; //상점 상태 (on, off, deleted)
    private String isActive; //상점 활성화 여부 (Y, N)
    private LocalDateTime createdDate; //생성일
    private LocalDateTime updatedDate; //수정일

}
