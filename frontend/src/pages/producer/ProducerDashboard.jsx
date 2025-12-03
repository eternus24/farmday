// src/pages/producer/ProducerDashboard.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

// Chart.js 관련
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
import { Line, Bar, Doughnut } from "react-chartjs-2";

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

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProducerDashboard() {
  const { auth } = useContext(AuthContext);

  const [summary, setSummary] = useState(null);
  const [lowStocks, setLowStocks] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth?.loggedIn) {
      setLoading(false);
      setError("로그인 후 이용해 주세요.");
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

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        // 🔹 1) 상단 요약 + 재고 부족 상품
        const dashboardPromise = axios.get(
          `${API_BASE}/api/producer/dashboard`,
          {
            headers,
            withCredentials: true,
          }
        );

        // 🔹 2) 이번달 매출(일자별 + TOP 상품)
        const monthlyPromise = axios.get(
          `${API_BASE}/api/producer/sales/monthly`,
          {
            headers,
            withCredentials: true,
          }
        );

        const [dashRes, monthRes] = await Promise.all([
          dashboardPromise,
          monthlyPromise,
        ]);

        const dash = dashRes.data;
        const month = monthRes.data;

        // 상단 요약 카드용 데이터
        const mappedSummary = {
          todaySales: dash.summary?.todaySalesAmount || 0,
          monthSales: dash.summary?.monthSalesAmount || 0,
          newOrdersCount: dash.summary?.newOrderCount || 0,
          lowStockCount: Array.isArray(dash.lowStockProducts)
            ? dash.lowStockProducts.length
            : 0,
        };

        setSummary(mappedSummary);
        setLowStocks(dash.lowStockProducts || []);

        setDailySales(month.dailySales || []);
        setTopProducts(month.topProducts || []);
      } catch (err) {
        console.error("대시보드/매출 조회 오류:", err);
        const status = err.response?.status;
        if (status === 401) {
          setError("로그인 정보가 만료되었어요. 다시 로그인 해주세요.");
        } else if (status === 403) {
          setError("생산자 권한이 없습니다.");
        } else {
          setError("대시보드 정보를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [auth?.loggedIn]);

  // =========================
  // 차트용 데이터 변환
  // =========================

  // 1) 일자별 매출 라인 차트
  const dailySalesChartData = useMemo(() => {
    if (!dailySales.length) return null;

    const labels = dailySales.map((d) => {
      try {
        const date = new Date(d.salesDate);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } catch {
        return d.salesDate;
      }
    });

    const amountData = dailySales.map((d) => d.totalAmount || 0);
    const orderCountData = dailySales.map((d) => d.orderCount || 0);

    return {
      labels,
      datasets: [
        {
          label: "일 매출액",
          data: amountData,
          borderWidth: 2,
          tension: 0.2,
          borderColor: "rgba(75, 192, 192, 1)",      // ✅ 라인 색
          backgroundColor: "rgba(75, 192, 192, 0.2)", // ✅ 영역 색(옵션)
          fill: true,
        },
        {
          label: "주문 건수",
          data: orderCountData,
          borderWidth: 2,
          borderDash: [4, 4],
          borderColor: "rgba(255, 159, 64, 1)",      // ✅ 다른 색
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          fill: false,
        },
      ],
    };
  }, [dailySales]);

  const dailySalesChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // 2) 재고 현황 바 차트 (재고 부족 상품 기준)
  const stockChartData = useMemo(() => {
    if (!lowStocks.length) return null;

    const labels = lowStocks.map((p) => p.productName);
    const stockData = lowStocks.map((p) => p.stockQty || 0);
    const safetyData = lowStocks.map((p) => p.safetyStockQty || 10);

    return {
      labels,
      datasets: [
        {
          label: "현재 재고",
          data: stockData,
          borderWidth: 1,
          backgroundColor: "rgba(54, 162, 235, 0.6)",  // ✅ 파란 바
        },
        {
          label: "안전 재고",
          data: safetyData,
          borderWidth: 1,
          backgroundColor: "rgba(255, 99, 132, 0.6)", // ✅ 빨간 바
        },
      ],
    };
  }, [lowStocks]);

  const stockChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // 3) 상품별 판매 도넛 차트 (이번달 TOP 상품)
  const topProductsChartData = useMemo(() => {
    if (!topProducts.length) return null;

    const labels = topProducts.map((p) => p.productName);
    const quantityData = topProducts.map((p) => p.totalQuantity || 0);

    const colors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
    ];

    return {
      labels,
      datasets: [
        {
          label: "판매 수량",
          data: quantityData,
          backgroundColor: quantityData.map((_, idx) => colors[idx % colors.length]), // ✅ 색 반복
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [topProducts]);

  const topProductsChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  // =========================
  // 렌더링
  // =========================

  if (loading) {
    return <div>대시보드 요약 정보를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!summary) {
    return <div>대시보드 정보가 없습니다.</div>;
  }

  const displayName = auth?.name || "생산자";

  return (
    <div className="producer-dashboard">
      {/* 상단 인사 영역 */}
      <section className="dashboard-header">
        <h2>{displayName} 님, 생산자 대시보드에 오신 걸 환영합니다 👋</h2>
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
        {/* 1. 일자별 매출 라인 차트 */}
        <div className="chart-card">
          <h3>이번 달 일자별 매출</h3>
          {dailySalesChartData ? (
            <Line data={dailySalesChartData} options={dailySalesChartOptions} />
          ) : (
            <div className="chart-placeholder">
              이번 달 매출 데이터가 없습니다.
            </div>
          )}
        </div>

        {/* 2. 재고 현황 바 차트 */}
        <div className="chart-card">
          <h3>재고 부족 상품 현황</h3>
          {stockChartData ? (
            <Bar data={stockChartData} options={stockChartOptions} />
          ) : (
            <div className="chart-placeholder">
              재고 부족 상품이 없습니다.
            </div>
          )}
        </div>

        {/* 3. 상품별 판매 도넛 차트 */}
        <div className="chart-card">
          <h3>이번 달 판매 TOP 상품</h3>
          {topProductsChartData ? (
            <Doughnut
              data={topProductsChartData}
              options={topProductsChartOptions}
            />
          ) : (
            <div className="chart-placeholder">
              아직 판매된 상품이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}