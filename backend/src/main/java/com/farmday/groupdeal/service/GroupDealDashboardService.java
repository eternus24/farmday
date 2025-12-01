// 경로: backend/src/main/java/com/farmday/groupdeal/service/GroupDealDashboardService.java
package com.farmday.groupdeal.service;

import com.farmday.groupdeal.dto.GroupDealDashboardResponse;

// 생산자 대시보드 전용 서비스 인터페이스
public interface GroupDealDashboardService {

    /**
     * 생산자 대시보드용 공동구매 상세 조회
     *
     * @param groupDealId 공동구매 ID
     * @param producerId  로그인한 생산자 ID (권한/소유자 체크용, 필요 없으면 null 가능)
     * @return 대시보드에 필요한 모든 데이터를 담은 DTO
     */
    GroupDealDashboardResponse getDashboard(Long groupDealId, Long producerId);
}
