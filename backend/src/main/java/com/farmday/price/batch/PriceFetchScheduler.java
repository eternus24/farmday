// backend/src/main/java/com/farmday/price/batch/PriceFetchScheduler.java
package com.farmday.price.batch;

import com.farmday.price.service.PriceFetchService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

// KAMIS 가격 데이터 자동 수집 스케줄러
@Component
public class PriceFetchScheduler {

    private final PriceFetchService priceFetchService;

    public PriceFetchScheduler(PriceFetchService priceFetchService) {
        this.priceFetchService = priceFetchService;
    }

    // 매일 새벽 5시에 실행
    // cron = "초 분 시 일 월 요일"
    @Scheduled(cron = "0 0 5 * * *")
    public void execute() {
        priceFetchService.fetchPricesFromKAMIS();
    }
}
