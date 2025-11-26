// src/pages/producer/ProducerDashboard.jsx
import { useEffect, useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProducerDashboard() {
  const { producer, storeExists } = useOutletContext();
  const { auth } = useContext(AuthContext);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // producer 정보나 로그인 정보 없으면 대시보드 호출 못함
    if (!producer || !auth) {
      return;
    }

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem("accessToken");

    const headers = {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
          }
        : {}),
    };

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API_BASE}/api/producer/dashboard`,
          { headers }
        );

        const data = res.data;

        // 백엔드 응답 매핑
        const mapped = {
          todaySales: data.summary?.todaySalesAmount || 0,
          monthSales: data.summary?.monthSalesAmount || 0,
          newOrdersCount: data.summary?.newOrderCount || 0,
          lowStockCount: Array.isArray(data.lowStockProducts)
            ? data.lowStockProducts.length
            : 0,
        };

        setSummary(mapped);
      } catch (err) {
        console.error("대시보드 조회 오류:", err);
        setError("대시보드 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [producer, auth]);

  if (!producer) {
    return <div>생산자 정보를 불러오는 중입니다...</div>;
  }

  if (loading) {
    return <div>대시보드 요약 정보를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!summary) {
    return <div>대시보드 정보가 없습니다.</div>;
  }

  return (
    <div className="producer-dashboard">
      {/* 상단 인사 영역 */}
      <section className="dashboard-header">
        <h2>{producer.name} 생산자님, 환영합니다 👋</h2>
        <p>
          농장명:{" "}
          <strong>
            {producer.farmName || "농장명이 아직 등록되지 않았어요"}
          </strong>
        </p>
        <p>이메일: {producer.email}</p>
        <p>연락처: {producer.phone}</p>
        <p>
          스토어 상태:{" "}
          {storeExists ? "스토어 개설 완료 ✅" : "아직 스토어가 없습니다."}
        </p>
      </section>

      {/* 상단 KPI 카드 */}
      <section className="dashboard-kpi">
        <div className="kpi-card">
          <h3>오늘 매출</h3>
          <p>{summary.todaySales.toLocaleString()}원</p>
        </div>
        <div className="kpi-card">
          <h3>이번 달 매출</h3>
          <p>{summary.monthSales.toLocaleString()}원</p>
        </div>
        <div className="kpi-card">
          <h3>신규 주문</h3>
          <p>{summary.newOrdersCount}건</p>
        </div>
        <div className="kpi-card">
          <h3>재고 부족 상품</h3>
          <p>{summary.lowStockCount}개</p>
        </div>
      </section>

      {/* 하단 차트 3개 영역 */}
      <section className="dashboard-charts">
        <div className="chart-card">
          <h3>매출 현황 (라인/주식형 그래프 자리)</h3>
          <div className="chart-placeholder">차트 영역</div>
        </div>

        <div className="chart-card">
          <h3>재고 현황 (버티컬 막대 차트 자리)</h3>
          <div className="chart-placeholder">차트 영역</div>
        </div>

        <div className="chart-card">
          <h3>상품별 판매 통계 (도넛 차트 자리)</h3>
          <div className="chart-placeholder">차트 영역</div>
        </div>
      </section>
    </div>
  );
}