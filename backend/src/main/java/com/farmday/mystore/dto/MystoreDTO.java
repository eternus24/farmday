package com.farmday.mystore.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class MystoreDTO {
    
    private long storeId;        // 상점 ID (STORE.store_id)
    private long producerId;     // 생산자 ID (PRODUCER.producer_id)
    private String ownerUserId;  // 상점주인 user ID (STORE.owner_user_id)
    private String storeName;    // 상점명 (STORE.store_name)

    // =========================
    // producer info 기반 연락처/주소
    // =========================
    // PRODUCER.biz_phone 에 매핑
    private String phone;        // 사업장 전화번호 (producer 기준)

    // PRODUCER.biz_addr 에 매핑
    private String addr;         // 사업장 주소 (producer 기준)

    // 아래 세 개는 현재 테이블에는 없음.
    // 나중에 STORE 쪽에 지역/상세주소 컬럼 추가 시 사용할 수 있음.
    private String addrDetail;   // (미사용) 상점 상세주소
    private String regionSi;     // (미사용) 상점 지역 시
    private String regionGun;    // (미사용) 상점 지역 군/구

    private String description;  // 상점 설명 (STORE.description)
    private String thumbnailUrl; // 상점 썸네일 이미지 URL (STORE.thumbnail_url)
    private String status;       // 상점 상태 (READY/OPEN/CLOSED 등) (STORE.status)
    private String isActive;     // 상점 활성화 여부 (Y, N) (STORE.is_active)
    private LocalDateTime createdDate; // 생성일 (STORE.created_date)
    private LocalDateTime updatedDate; // 수정일 (STORE.updated_date)

    // 생산자 정보 필드 (PRODUCER)
    private String bizNo;          // 사업자등록번호 (PRODUCER.biz_no)
    private String bankName;       // 정산용 은행명 (PRODUCER.bank_name)
    private String bankAccountNo;  // 정산 계좌번호 (PRODUCER.bank_account_no)
    private String accountHolder;  // 예금주 (PRODUCER.account_holder)
}