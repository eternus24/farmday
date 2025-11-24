// src/main/java/com/farmday/groupdeal/service/GroupDealService.java
package com.farmday.groupdeal.service;

import com.farmday.groupdeal.domain.*;
import com.farmday.groupdeal.mapper.GroupDealMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupDealService {

    private final GroupDealMapper groupDealMapper;

    // 리스트 카드용
    public List<GroupDealCardDto> getActiveGroupDealCards() {
        // 1) 원래 쓰던 대로 카드 리스트 먼저 가져오고
        List<GroupDealCardDto> deals = groupDealMapper.selectActiveGroupDeals();

        // 2) 각 카드마다, 이미지가 비어 있으면 이미지 테이블에서 대표 이미지 한 장 가져오기
        for (GroupDealCardDto deal : deals) {
            if (deal.getImageUrl() == null || deal.getImageUrl().isEmpty()) {
                List<GroupDealImage> images =
                        groupDealMapper.selectGroupDealImagesByDealId(deal.getGroupDealId()); // ← Mapper에 이미 있음

                if (images != null && !images.isEmpty()) {
                    // 첫 번째 이미지를 썸네일로 사용
                    deal.setImageUrl(images.get(0).getImageUrl());
                }
            }
        }

        return deals;
    }


    // 상세 페이지 상단용
    public GroupDealDetailDto getGroupDealDetail(Long groupDealId) {
        GroupDealDetailDto detail = groupDealMapper.selectGroupDealDetail(groupDealId);
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않는 공동구매입니다.");
        }
        // 🔽 여기부터 "이미지 리스트" 채우는 부분 추가
        List<GroupDealImage> images = groupDealMapper.selectGroupDealImagesByDealId(groupDealId);

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = images.stream()
                    .map(GroupDealImage::getImageUrl)
                    .filter(url -> url != null && !url.isEmpty())
                    .collect(Collectors.toList());

            // Detail DTO에 이미지 URL 리스트 세팅
            detail.setImageUrls(imageUrls);
        }
        // 🔼 여기까지 추가

        return detail;
    }

    // 팀 목록
    public List<GroupDealTeamDto> getTeamsByGroupDeal(Long groupDealId) {
        List<GroupDealTeamDto> raw = groupDealMapper.selectTeamsByDealId(groupDealId);
        return raw.stream().map(this::convertTeamDto).collect(Collectors.toList());
    }

    private GroupDealTeamDto convertTeamDto(GroupDealTeamDto dto) {
        // openedAgoText, needMoreText 계산
        // (openedAt은 Mapper에서 함께 가져오도록 수정 가능)
        // 여기서는 openedAgoText는 프론트에서 처리해도 되므로 생략 가능
        int need = dto.getTargetMemberCnt() - dto.getCurrentMemberCnt();
        if (need < 0) need = 0;

        dto.setNeedMoreText(need > 0 ? need + "명 더 필요!" : "인원 모집 완료");
        dto.setJoinable(need > 0);
        return dto;
    }

    @Transactional
    public GroupDealJoinResultDto createTeam(Long groupDealId, GroupDealJoinRequestDto req) {
        GroupDeal deal = groupDealMapper.selectGroupDealById(groupDealId);
        validateDealOpenStatus(deal);

        GroupDealTeam team = new GroupDealTeam();
        team.setGroupDealId(groupDealId);
        team.setLeaderUserId(req.getUserId());
        team.setTargetMemberCnt(deal.getMinMemberCount());
        team.setCurrentMemberCnt(1);
        team.setStatus("WAITING");
        team.setOpenedAt(LocalDateTime.now());
        groupDealMapper.insertTeam(team);

        GroupDealMember leaderMember = new GroupDealMember();
        leaderMember.setTeamId(team.getTeamId());
        leaderMember.setUserId(req.getUserId());
        leaderMember.setStatus("PENDING_PAYMENT");
        groupDealMapper.insertMember(leaderMember);

        GroupDealJoinResultDto result = new GroupDealJoinResultDto();
        result.setGroupDealId(groupDealId);
        result.setTeamId(team.getTeamId());
        result.setProductId(deal.getProductId());
        result.setDetailId(deal.getDetailId());
        result.setDealPrice(deal.getDealPrice());
        result.setQuantity(req.getQuantity());
        result.setMessage("새 공동구매 팀이 생성되었습니다.");
        return result;
    }

    @Transactional
    public GroupDealJoinResultDto joinTeam(Long teamId, GroupDealJoinRequestDto req) {
        GroupDealTeam team = groupDealMapper.selectTeamById(teamId);
        if (team == null) {
            throw new IllegalArgumentException("존재하지 않는 팀입니다.");
        }

        GroupDeal deal = groupDealMapper.selectGroupDealById(team.getGroupDealId());
        validateDealOpenStatus(deal);
        validateTeamJoinable(team, req.getUserId());

        GroupDealMember member = new GroupDealMember();
        member.setTeamId(teamId);
        member.setUserId(req.getUserId());
        member.setStatus("PENDING_PAYMENT");
        groupDealMapper.insertMember(member);

        int memberCount = groupDealMapper.countMembersByTeamId(teamId);
        String nextStatus = memberCount >= team.getTargetMemberCnt() ? "FULL" : "WAITING";
        groupDealMapper.updateTeamMemberCount(teamId, memberCount, nextStatus);

        GroupDealJoinResultDto result = new GroupDealJoinResultDto();
        result.setGroupDealId(team.getGroupDealId());
        result.setTeamId(teamId);
        result.setProductId(deal.getProductId());
        result.setDetailId(deal.getDetailId());
        result.setDealPrice(deal.getDealPrice());
        result.setQuantity(req.getQuantity());
        result.setMessage("팀에 합류했습니다.");
        return result;
    }

    private void validateDealOpenStatus(GroupDeal deal) {
        if (deal == null) {
            throw new IllegalArgumentException("존재하지 않는 공동구매입니다.");
        }
        if (!"OPEN".equals(deal.getStatus())) {
            throw new IllegalStateException("진행 중이 아닌 공동구매입니다.");
        }
        if (deal.getEndAt() != null && deal.getEndAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("이미 마감된 공동구매입니다.");
        }
    }

    private void validateTeamJoinable(GroupDealTeam team, String userId) {
        if (!"WAITING".equals(team.getStatus())) {
            throw new IllegalStateException("참여할 수 없는 팀 상태입니다.");
        }
        int memberCount = groupDealMapper.countMembersByTeamId(team.getTeamId());
        if (memberCount >= team.getTargetMemberCnt()) {
            throw new IllegalStateException("이미 인원이 가득 찬 팀입니다.");
        }
        int myCount = groupDealMapper.countMembersByTeamIdAndUserId(team.getTeamId(), userId);
        if (myCount > 0) {
            throw new IllegalStateException("이미 이 팀에 참여 중입니다.");
        }
    }
}
