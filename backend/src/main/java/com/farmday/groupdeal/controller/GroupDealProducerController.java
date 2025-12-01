// // 경로: backend/src/main/java/com/farmday/groupdeal/controller/GroupDealProducerController.java
// package com.farmday.groupdeal.controller;

// import com.farmday.groupdeal.dto.GroupDealDashboardResponse;
// import com.farmday.groupdeal.service.GroupDealService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/producer/group-deals")
// @RequiredArgsConstructor
// public class GroupDealProducerController {

//     private final GroupDealService groupDealService;

//     /**
//      * 생산자: 공동구매 대시보드 조회
//      * - GET /api/producer/group-deals/{groupDealId}/dashboard
//      */
//     @GetMapping("/{groupDealId}/dashboard")
//     public ResponseEntity<GroupDealDashboardResponse> getDashboard(
//             @PathVariable("groupDealId") Long groupDealId,
//             @AuthenticationPrincipal String loginUserId   // 필요시 권한 체크용
//     ) {
//         // TODO: loginUserId 로 "내 공동구매인지" 체크 넣고 싶으면 여기에서 처리

//         GroupDealDashboardResponse dto =
//                 groupDealService.getProducerGroupDealDashboard(groupDealId);

//         if (dto == null) {
//             return ResponseEntity.notFound().build();
//         }

//         return ResponseEntity.ok(dto);
//     }
// }