// backend/src/main/java/com/farmday/price/domain/PriceFetchLog.java
package com.farmday.price.domain;

import java.time.LocalDateTime;

// KAMIS API 수집 로그
public class PriceFetchLog {

    private Long id;                    // PK
    private LocalDateTime fetchedAt;    // 수집 시간
    private int fetchedCount;           // 수집 건수
    private String status;              // 상태 (SUCCESS / FAIL)
    private String errorMessage;        // 실패 이유 (옵션)

    // getter / setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(LocalDateTime fetchedAt) {
        this.fetchedAt = fetchedAt;
    }

    public int getFetchedCount() {
        return fetchedCount;
    }

    public void setFetchedCount(int fetchedCount) {
        this.fetchedCount = fetchedCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
