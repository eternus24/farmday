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
  const res = await fetch(`${API_BASE_URL}/api/group-deals`, {
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
  const res = await fetch(`${API_BASE_URL}/api/group-deals/${groupDealId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  if (!res.ok) throw new Error('공동구매 상세 조회 실패');
  return res.json();
}