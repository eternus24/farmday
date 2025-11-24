// src/api/groupDealApi.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function authHeader() {
  const token = localStorage.getItem('accessToken');
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

// 공동구매 리스트 조회
export async function getGroupDealList() {
  const res = await fetch(`${API_BASE_URL}/group-deals`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  if (!res.ok) throw new Error('공동구매 리스트 조회 실패');
  return res.json();
}

// 공동구매 상세 조회
export async function getGroupDealDetail(groupDealId) {
  const res = await fetch(`${API_BASE_URL}/group-deals/${groupDealId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  if (!res.ok) throw new Error('공동구매 상세 조회 실패');
  return res.json();
}

// 팀 목록 조회
export async function getGroupDealTeams(groupDealId) {
  const res = await fetch(`${API_BASE_URL}/group-deals/${groupDealId}/teams`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  if (!res.ok) throw new Error('팀 목록 조회 실패');
  return res.json();
}

// 새 팀 생성
export async function createTeam(groupDealId, { quantity }) {
  const res = await fetch(`${API_BASE_URL}/group-deals/${groupDealId}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || '새 팀 생성 실패');
  }
  return res.json();
}

// 기존 팀 참여
export async function joinTeam(teamId, { quantity }) {
  const res = await fetch(`${API_BASE_URL}/group-deal-teams/${teamId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || '팀 참여 실패');
  }
  return res.json();
}
