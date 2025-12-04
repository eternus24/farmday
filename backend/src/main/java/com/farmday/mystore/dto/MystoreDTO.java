package com.farmday.mystore.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class MystoreDTO {
    
    private long storeId; //상점 ID
    private long producerId; //생산자 ID
    private String ownerUserId; //상점주인 user ID
    private String storeName; //상점명

    //producer info
    private String phone; //상점 전화번호
    private String addr; //상점 주소
    private String addrDetail; //상점 상세주소
    private String regionSi; //상점 지역 시
    private String regionGun; //상점 지역 군구

    private String description; //상점 설명
    private String thumbnailUrl; //상점 썸네일 이미지 URL
    private String status; //상점 상태 (on, off, deleted)
    private String isActive; //상점 활성화 여부 (Y, N)
    private LocalDateTime createdDate; //생성일
    private LocalDateTime updatedDate; //수정일

    //생산자 정보 필드
    private String bizNo; // 사업자등록번호
    private String bankName;      // 정산용 은행명
    private String bankAccountNo; // 정산 계좌번호
    private String accountHolder; // 예금주

}