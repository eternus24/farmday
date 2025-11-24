// src/components/groupdeal/GroupDealTeamList.jsx
import React from "react";

export default function GroupDealTeamList({ teams, onJoin }) {
  if (!teams || teams.length === 0) {
    return (
      <div className="mt-3">
        <p className="mb-1 fw-semibold">현재 진행중인 팀 현황</p>
        <p className="text-muted small mb-0">
          아직 시작된 팀이 없어요. 혼자구매로 새 팀을 만들어보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <p className="mb-2 fw-semibold">현재 진행중인 팀 현황</p>

      <div className="list-group">
        {teams.map((team) => (
          <div
            key={team.teamId}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <div className="fw-semibold">{team.leaderMaskedName}</div>
              <div className="text-muted small">
                {team.currentMemberCnt}/{team.targetMemberCnt}명 ·{" "}
                {team.needMoreText}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span
                className={
                  team.joinable ? "text-success small" : "text-muted small"
                }
              >
                {team.joinable ? "참여 가능" : "모집 완료"}
              </span>
              <button
                className="btn btn-sm btn-success"
                disabled={!team.joinable}
                onClick={() => onJoin && onJoin(team)}
              >
                이 팀 참여하기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
