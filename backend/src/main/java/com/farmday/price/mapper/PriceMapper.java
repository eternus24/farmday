// backend/src/main/java/com/farmday/price/mapper/PriceMapper.java
package com.farmday.price.mapper;

import com.farmday.price.domain.PriceDaily;
import com.farmday.price.domain.PriceFetchLog;
import com.farmday.price.domain.PriceMarket;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

// 시세 관련 MyBatis 매퍼 인터페이스
@Mapper
public interface PriceMapper {

    // 품목 ID 기준 최신 시세 조회
    PriceMarket selectPriceByItemId(@Param("itemId") String itemId);

    // 품목 + 날짜 기준 시세 조회 (옵션)
    PriceDaily selectPriceByItemAndDate(@Param("itemId") String itemId,
                                        @Param("baseDate") LocalDate baseDate);

    // 등급별 최신 시세 조회 예시 (필요 없으면 삭제)
    List<PriceMarket> selectLatestPricesByGrade(@Param("itemId") String itemId);

    // 시장별 시세 저장
    void insertPriceMarket(PriceMarket priceMarket);

    // 일별 시세 저장
    void insertPriceDaily(PriceDaily priceDaily);

    // 수집 로그 저장
    void insertPriceFetchLog(PriceFetchLog log);
}
