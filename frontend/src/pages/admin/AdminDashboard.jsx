// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";

// Chart.js 등록
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [rankingMode, setRankingMode] = useState("DAILY"); // DAILY | MONTHLY
  const [orderMode, setOrderMode] = useState("DAILY"); // DAILY | MONTHLY

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://192.168.0.20:8080/api/admin/dashboard", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "대시보드 데이터를 불러오지 못했습니다.");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("[AdminDashboard] fetch error:", err);
        setError(err.message || "대시보드 로딩 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <CenterBox>대시보드 불러오는 중...</CenterBox>;
  if (error) return <CenterBox>❌ {error}</CenterBox>;
  if (!data) return <CenterBox>데이터가 없습니다.</CenterBox>;

  // ───────── 1) 상단 요약 카드 데이터 ─────────
  const { userSummary, realtimeStats, producerRanking, orderStats } = data;

  // ───────── 2) 도넛 차트 데이터 구성 ─────────
  const donutLabels = ["소비자", "승인된 생산자", "승인 대기 생산자"];
  const donutValues = [
    userSummary.totalUsers || 0,
    userSummary.totalProducers || 0,
    userSummary.pendingProducers || 0,
  ];

  const donutData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: ["#4f46e5", "#10b981", "#f59e0b"],
        hoverOffset: 4,
      },
    ],
  };

  // ───────── 3) 주문 통계 차트 데이터 구성 ─────────
  const currentOrderStats =
    orderMode === "DAILY" ? orderStats.daily : orderStats.monthly;

  const orderChartData = {
    labels: currentOrderStats.map((it) => it.dateLabel),
    datasets: [
      {
        label: "주문 수",
        data: currentOrderStats.map((it) => it.orderCount),
        borderWidth: 2,
        tension: 0.2,
      },
    ],
  };

  // ───────── 4) 생산자 랭킹 데이터 ─────────
  const currentRanking =
    rankingMode === "DAILY"
      ? producerRanking.daily
      : producerRanking.monthly;

  return (
    <DashWrapper>
      {/* 1. 상단 KPI 카드들 */}
      <KpiRow>
        <KpiCard>
          <span className="label">전체 소비자</span>
          <span className="value">
            {userSummary.totalUsers?.toLocaleString() ?? 0}
          </span>
        </KpiCard>
        <KpiCard>
          <span className="label">승인된 생산자</span>
          <span className="value">
            {userSummary.totalProducers?.toLocaleString() ?? 0}
          </span>
        </KpiCard>
        <KpiCard>
          <span className="label">승인 대기 생산자</span>
          <span className="value">
            {userSummary.pendingProducers?.toLocaleString() ?? 0}
          </span>
        </KpiCard>
        <KpiCard>
          <span className="label">오늘 주문 수</span>
          <span className="value">
            {orderStats.todayOrderCount?.toLocaleString() ?? 0}
          </span>
        </KpiCard>
      </KpiRow>

      {/* 2. 도넛차트 + 실시간 통계 */}
      <Row>
        <Card>
          <CardHeader>
            <h3>회원 현황</h3>
            <span className="sub">소비자 / 생산자 분포</span>
          </CardHeader>
          <ChartArea>
            <Doughnut
              data={donutData}
              options={{
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </ChartArea>
        </Card>

        <Card>
          <CardHeader>
            <h3>실시간 통계</h3>
            <span className="sub">상품 조회수 / 거래량 TOP</span>
          </CardHeader>
          <RealtimeWrap>
            <RealtimeSection>
              <h4>조회수 TOP 5</h4>
              <ul>
                {realtimeStats.topViewedProducts.map((p, idx) => (
                  <li key={p.productId}>
                    <span className="rank">{idx + 1}</span>
                    <div className="info">
                      <span className="name">{p.productName}</span>
                      <span className="sub">
                        {p.producerName} · {p.viewCount.toLocaleString()}회
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </RealtimeSection>

            <RealtimeSection>
              <h4>거래량 TOP 5</h4>
              <ul>
                {realtimeStats.topTradedProducts.map((p, idx) => (
                  <li key={p.productId}>
                    <span className="rank">{idx + 1}</span>
                    <div className="info">
                      <span className="name">{p.productName}</span>
                      <span className="sub">
                        {p.producerName} · {p.orderCount.toLocaleString()}건
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </RealtimeSection>
          </RealtimeWrap>
        </Card>
      </Row>

      {/* 3. 생산자 랭킹 + 주문 통계 */}
      <Row>
        <Card>
          <CardHeader>
            <h3>생산자 랭킹</h3>
            <div className="tabs">
              <button
                className={rankingMode === "DAILY" ? "active" : ""}
                onClick={() => setRankingMode("DAILY")}
              >
                일일
              </button>
              <button
                className={rankingMode === "MONTHLY" ? "active" : ""}
                onClick={() => setRankingMode("MONTHLY")}
              >
                월별
              </button>
            </div>
          </CardHeader>
          <RankingTable>
            <thead>
              <tr>
                <th>순위</th>
                <th>생산자</th>
                <th>주문 수</th>
                <th>거래액</th>
              </tr>
            </thead>
            <tbody>
              {currentRanking.map((row, idx) => (
                <tr key={row.producerId}>
                  <td>{idx + 1}</td>
                  <td>{row.producerName}</td>
                  <td>{row.orderCount.toLocaleString()}</td>
                  <td>{row.totalAmount.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </RankingTable>
        </Card>

        <Card>
          <CardHeader>
            <h3>주문 통계</h3>
            <div className="tabs">
              <button
                className={orderMode === "DAILY" ? "active" : ""}
                onClick={() => setOrderMode("DAILY")}
              >
                일별
              </button>
              <button
                className={orderMode === "MONTHLY" ? "active" : ""}
                onClick={() => setOrderMode("MONTHLY")}
              >
                월별
              </button>
            </div>
          </CardHeader>
          <ChartArea>
            <Bar
              data={orderChartData}
              options={{
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true },
                },
              }}
            />
          </ChartArea>
        </Card>
      </Row>
    </DashWrapper>
  );
}

/* ========== styled-components ========== */

const DashWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const CenterBox = styled.div`
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
`;

const KpiRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const KpiCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;

  .label {
    font-size: 12px;
    color: #9ca3af;
  }

  .value {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1.6fr;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.06);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h3 {
    font-size: 16px;
    font-weight: 700;
  }

  .sub {
    font-size: 12px;
    color: #9ca3af;
  }

  .tabs {
    display: flex;
    gap: 4px;
  }

  .tabs button {
    border: none;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    cursor: pointer;
    background: #e5e7eb;
    color: #4b5563;
  }

  .tabs button.active {
    background: #4f46e5;
    color: #ffffff;
  }
`;

const ChartArea = styled.div`
  width: 100%;
  height: 260px;
`;

const RealtimeWrap = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 1000px) {
    flex-direction: column;
  }
`;

const RealtimeSection = styled.div`
  flex: 1;

  h4 {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
  }

  .rank {
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: #e5edff;
    font-size: 11px;
    font-weight: 700;
    color: #4f46e5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-size: 13px;
    font-weight: 500;
  }

  .sub {
    font-size: 11px;
    color: #9ca3af;
  }
`;

const RankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 6px 4px;
    text-align: left;
  }

  thead tr {
    border-bottom: 1px solid #e5e7eb;
  }

  tbody tr + tr {
    border-top: 1px solid #f3f4f6;
  }
`;