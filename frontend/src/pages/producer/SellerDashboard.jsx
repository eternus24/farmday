// src/pages/producer/SellerDashboard.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getStoreList, writeAnswer } from "../../assets/js/api/QuestionApi";

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

export default function SellerDashboard() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // 통계 데이터
  const [summary, setSummary] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [groupDealStats, setGroupDealStats] = useState([]);
  
  // 문의글, 리뷰, 공동구매 현황
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [groupDeals, setGroupDeals] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  
  // 발송 관리
  const [deliveries, setDeliveries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("daily"); // daily, weekly, monthly

  useEffect(() => {
    if (!auth?.loggedIn) {
      setLoading(false);
      setError("판매자 전용 메뉴입니다. 먼저 로그인해 주세요.");
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

        // 실제 Producer API 호출
        // 1. 생산자 대시보드 요약 데이터
        const dashboardPromise = axios.get(
          `${API_BASE}/api/producer/dashboard`,
          {
            headers,
            withCredentials: true,
          }
        );

        // 2. 월간 매출 데이터
        const monthlyPromise = axios.get(
          `${API_BASE}/api/producer/sales/monthly`,
          {
            headers,
            withCredentials: true,
          }
        );

        // 3. 활성 주문 목록 (발송 관리용)
        const ordersPromise = axios.get(
          `${API_BASE}/api/producer/orders`,
          {
            headers,
            withCredentials: true,
            params: { type: "ACTIVE" },
          }
        );

        // 생산자 정보 조회 (storeId 가져오기)
        let producerStoreId = null;
        try {
          const producerRes = await axios.get(`${API_BASE}/api/producer/me`, {
            headers,
            withCredentials: true,
          });
          const producerData = producerRes.data;
          if (producerData && producerData.producerId) {
            // producerId로 store 조회
            try {
              const storeRes = await axios.get(
                `${API_BASE}/api/products/producer/${producerData.producerId}/store`,
                { headers, withCredentials: true }
              );
              if (storeRes.data && storeRes.data.storeId) {
                producerStoreId = storeRes.data.storeId;
                setStoreId(producerStoreId);
              }
            } catch (storeErr) {
              console.log("스토어 정보 없음:", storeErr);
            }
          }
        } catch (producerErr) {
          console.log("생산자 정보 조회 실패:", producerErr);
        }

        // 4. QNA 리스트 조회 (storeId가 있을 때만, 에러 발생 시 빈 배열 반환)
        let qnaList = [];
        if (producerStoreId) {
          try {
            const qnaRes = await getStoreList({ storeId: producerStoreId });
            qnaList = qnaRes?.data?.content || qnaRes?.data || [];
          } catch (qnaErr) {
            console.error("QNA 리스트 조회 오류:", qnaErr);
            qnaList = []; // 에러 발생 시 빈 배열
          }
        }

        const [dashRes, monthRes, ordersRes] = await Promise.all([
          dashboardPromise,
          monthlyPromise,
          ordersPromise,
        ]);

        const dash = dashRes.data;
        const month = monthRes.data;
        const orders = ordersRes.data || [];

        // 공동구매 진행 현황 (더미 데이터) - summaryData 계산을 위해 먼저 설정
        const groupDealsData = [
          { id: 1, title: "충남 논산 친환경 피망 3kg", current: 42, target: 120, status: "OPEN" },
          { id: 2, title: "제주 당근 5kg", current: 86, target: 120, status: "OPEN" },
          { id: 3, title: "경기 양파 10kg", current: 54, target: 120, status: "OPEN" },
        ];
        
        // 문의글 현황 (실데이터 + 더미 데이터 병합) - summaryData 계산을 위해 먼저 처리
        let questionsFromApi = [];
        if (qnaList && Array.isArray(qnaList) && qnaList.length > 0) {
          questionsFromApi = qnaList.map((q) => ({
            id: q.qnaId || q.id,
            productName: q.productName || q.product?.name || "상품명 없음",
            question: q.title || q.content || "",
            status: q.status === "WAITING" || q.status === "답변대기" ? "답변대기" : q.status === "ANSWERED" || q.status === "답변완료" ? "답변완료" : "답변대기",
            date: q.createdDate ? new Date(q.createdDate).toISOString().slice(0, 10) : q.created_date ? new Date(q.created_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            qnaId: q.qnaId || q.id,
            content: q.content || q.question || "",
            answerContent: q.answerContent || q.answer_content || "",
          }));
        }
        
        // 더미 데이터 (항상 표시)
        let dummyQuestions = [
          { id: 1001, productName: "피망 3kg", question: "배송은 언제 되나요?", status: "답변대기", date: "2024-12-03", qnaId: null },
          { id: 1002, productName: "당근 5kg", question: "신선도는 어떤가요?", status: "답변완료", date: "2024-12-02", qnaId: null },
        ];
        
        // 실데이터와 더미데이터 병합 (중복 제거)
        let questionsData = [...questionsFromApi, ...dummyQuestions];
        let newQuestionsCount = questionsFromApi.filter((q) => q.status === "답변대기").length;
        
        // 상단 요약 카드 데이터 매핑 (더미 데이터 포함)
        const summaryData = {
          todaySales: dash.summary?.todaySalesAmount || 1900000,
          weekSales: month.weeklySales?.reduce((sum, w) => sum + (w.amount || 0), 0) || 11600000,
          monthSales: dash.summary?.monthSalesAmount || 11600000,
          totalGroupDeals: groupDealsData.length,
          activeGroupDeals: groupDealsData.filter((gd) => gd.status === "OPEN").length,
          participationRate: groupDealsData.length > 0
            ? groupDealsData.reduce((sum, gd) => {
                const rate = gd.target > 0 ? (gd.current / gd.target) * 100 : 0;
                return sum + rate;
              }, 0) / groupDealsData.length
            : 50.5,
          newQuestions: newQuestionsCount || 2,
          newReviews: 4,
          pendingDeliveries: orders.length || 15,
        };
        setSummary(summaryData);

        // 일별 매출 데이터 변환 (실데이터 + 더미 데이터 병합)
        const dailyDataFromApi = (month.dailySales || []).map((d) => ({
          date: d.salesDate
            ? `${new Date(d.salesDate).getMonth() + 1}/${new Date(d.salesDate).getDate()}`
            : d.date,
          amount: d.totalAmount || 0,
          orders: d.orderCount || 0,
        }));
        
        // 더미 데이터
        const dummyDailyData = [
          { date: "12/01", amount: 1200000, orders: 8 },
          { date: "12/02", amount: 1500000, orders: 10 },
          { date: "12/03", amount: 1800000, orders: 12 },
          { date: "12/04", amount: 1500000, orders: 10 },
          { date: "12/05", amount: 2000000, orders: 15 },
          { date: "12/06", amount: 1700000, orders: 11 },
          { date: "12/07", amount: 1900000, orders: 13 },
        ];
        
        // 실데이터와 더미데이터 병합 (실데이터가 있으면 실데이터 우선, 없으면 더미데이터 추가)
        const dailyData = dailyDataFromApi.length > 0 
          ? [...dailyDataFromApi, ...dummyDailyData.filter(d => !dailyDataFromApi.find(api => api.date === d.date))]
          : dummyDailyData;
        setDailySales(dailyData);

        // 주별 매출 데이터 변환 (실데이터 기반 + 더미 데이터 병합)
        const weeklyData = [];
        if (dailyData.length > 0) {
          for (let i = 0; i < dailyData.length; i += 7) {
            const weekData = dailyData.slice(i, i + 7);
            const weekAmount = weekData.reduce((sum, d) => sum + d.amount, 0);
            const weekOrders = weekData.reduce((sum, d) => sum + d.orders, 0);
            weeklyData.push({
              week: `${i === 0 ? "이번 주" : `${Math.floor(i / 7) + 1}주 전`}`,
              amount: weekAmount,
              orders: weekOrders,
            });
          }
        }
        // 더미 데이터 추가 (실데이터와 병합)
        const dummyWeeklyData = [
          { week: "11월 4주", amount: 8500000, orders: 55 },
          { week: "11월 5주", amount: 9200000, orders: 62 },
        ];
        const mergedWeeklyData = [...weeklyData, ...dummyWeeklyData.filter(d => !weeklyData.find(w => w.week === d.week))];
        setWeeklySales(mergedWeeklyData.length > 0 ? mergedWeeklyData : dummyWeeklyData);

        // 월별 매출 데이터 (실데이터 + 더미 데이터 병합)
        const monthlyDataFromApi = month.monthlySales || [];
        const dummyMonthlyData = [
          {
            month: "10월",
            amount: 28000000,
            orders: 180,
          },
          {
            month: "11월",
            amount: 32000000,
            orders: 210,
          },
        ];
        const currentMonthData = {
          month: `${new Date().getMonth() + 1}월`,
          amount: dash.summary?.monthSalesAmount || 11600000,
          orders: dash.summary?.monthOrderCount || 79,
        };
        // 실데이터와 더미데이터 병합
        const monthlyData = [...monthlyDataFromApi, ...dummyMonthlyData.filter(d => !monthlyDataFromApi.find(m => m.month === d.month)), currentMonthData];
        setMonthlySales(monthlyData);

        // 공동구매 통계 (실데이터 + 더미 데이터 병합)
        const groupDealStatsFromApi = groupDealsData.map((gd) => ({
          id: gd.id,
          title: gd.title,
          participationRate: gd.target > 0 ? Math.round((gd.current / gd.target) * 100) : 0,
          status: gd.status,
        }));
        const dummyGroupDealStats = [
          { id: 4, title: "전라도 고구마 5kg", participationRate: 88, status: "OPEN" },
          { id: 5, title: "강원도 사과 3kg", participationRate: 65, status: "OPEN" },
        ];
        const groupDealStatsData = [...groupDealStatsFromApi, ...dummyGroupDealStats];
        setGroupDealStats(groupDealStatsData);

        // 문의글 현황 설정 (이미 위에서 처리됨)
        setQuestions(questionsData);

        // 리뷰 현황 (더미 데이터)
        const reviewsData = [
          { id: 1, productName: "피망 3kg", rating: 5, review: "정말 신선하고 맛있어요!", date: "2024-12-01" },
          { id: 2, productName: "당근 5kg", rating: 4, review: "좋아요", date: "2024-12-02" },
          { id: 3, productName: "양파 10kg", rating: 5, review: "가격 대비 만족합니다", date: "2024-12-03" },
          { id: 4, productName: "고구마 5kg", rating: 5, review: "달고 맛있어요!", date: "2024-12-04" },
        ];
        setReviews(reviewsData);

        // 공동구매 진행 현황 설정
        setGroupDeals(groupDealsData);

        // 발송 관리 (주문 데이터 변환 + 더미 데이터 병합)
        const deliveriesFromApi = orders.slice(0, 10).map((order, idx) => ({
          id: order.orderItemId || idx,
          orderId: order.orderId || `ORD-${idx + 1}`,
          productName: order.productName || "상품명 없음",
          recipient: order.recipientName || "수령인 없음",
          status:
            order.deliveryStatus === "PREPARING"
              ? "배송준비"
              : order.deliveryStatus === "SHIPPING"
              ? "배송중"
              : order.deliveryStatus === "DELIVERED"
              ? "배송완료"
              : "배송준비",
          date: order.orderDate
            ? new Date(order.orderDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        }));
        
        // 더미 데이터
        const dummyDeliveries = [
          { id: 100, orderId: "ORD-101", productName: "피망 3kg", recipient: "홍길동", status: "배송준비", date: "2024-12-05" },
          { id: 101, orderId: "ORD-102", productName: "당근 5kg", recipient: "김철수", status: "배송중", date: "2024-12-04" },
          { id: 102, orderId: "ORD-103", productName: "양파 10kg", recipient: "이영희", status: "배송완료", date: "2024-12-03" },
        ];
        
        // 실데이터와 더미데이터 병합
        const deliveriesData = [...deliveriesFromApi, ...dummyDeliveries];
        setDeliveries(deliveriesData);

      } catch (err) {
        console.error("판매자 대시보드 조회 오류:", err);
        const status = err.response?.status;
        if (status === 401) {
          setError("로그인 시간이 만료되었어요. 다시 로그인해 주세요.");
        } else if (status === 403) {
          setError("판매자 계정이 아닙니다. 판매자로 등록된 계정으로 로그인해 주세요.");
        } else {
          setError("대시보드 정보를 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
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

  // 기간별 매출 차트 데이터
  const salesChartData = useMemo(() => {
    let data = [];
    if (period === "daily") {
      data = dailySales;
    } else if (period === "weekly") {
      data = weeklySales;
    } else {
      data = monthlySales;
    }

    if (!data.length) return null;

    const labels = data.map((d) => d.date || d.week || d.month);
    const amountData = data.map((d) => d.amount || 0);

    return {
      labels,
      datasets: [
        {
          label: "매출액",
          data: amountData,
          borderWidth: 2,
          tension: 0.2,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
      ],
    };
  }, [period, dailySales, weeklySales, monthlySales]);

  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return (value / 10000).toFixed(0) + "만원";
          },
        },
      },
    },
  };

  // 공동구매 참여율 차트
  const participationChartData = useMemo(() => {
    if (!groupDealStats.length) return null;

    const labels = groupDealStats.map((g) => g.title.length > 15 ? g.title.substring(0, 15) + "..." : g.title);
    const rateData = groupDealStats.map((g) => g.participationRate || 0);

    return {
      labels,
      datasets: [
        {
          label: "참여율 (%)",
          data: rateData,
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [groupDealStats]);

  const participationChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
    },
  },
};

  // 배송 상태 변경 핸들러
  const handleDeliveryStatusChange = async (deliveryId, newStatus) => {
    try {
      // TODO: 실제 API 호출
      console.log(`배송 상태 변경: ${deliveryId} -> ${newStatus}`);
      
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === deliveryId ? { ...d, status: newStatus } : d
        )
      );
      
      alert("배송 상태를 변경했어요.");
    } catch (err) {
      console.error("배송 상태 변경 오류:", err);
      alert("배송 상태 변경에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  // =========================
  // 렌더링
  // =========================

  if (loading) {
    return <div>판매 현황을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!summary) {
    return <div>표시할 판매 정보가 아직 없습니다.</div>;
  }

  const displayName = auth?.name || "판매자";

  return (
    <div className="seller-dashboard" style={{ padding: "20px" }}>
      {/* 상단 인사 영역 + 모집글 작성 버튼 */}
      <section className="dashboard-header" style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <h2 style={{ margin: 0 }}>{displayName} 님, 판매자 대시보드에 오신 것을 환영합니다 👋</h2>
        <button
          onClick={() => navigate("/groupdeal/new")}
          style={{
            padding: "10px 20px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          + 모집글 작성하기
        </button>
      </section>

      {/* 상단 KPI 카드 */}
      <section className="dashboard-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}>
        <div className="kpi-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>오늘 매출</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            {summary.todaySales.toLocaleString()}원
          </p>
        </div>
        <div className="kpi-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>이번 달 매출</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            {summary.monthSales.toLocaleString()}원
          </p>
        </div>
        <div className="kpi-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>진행 중인 공동구매</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            {summary.activeGroupDeals}개
          </p>
        </div>
        <div className="kpi-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>평균 참여율</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            {summary.participationRate.toFixed(1)}%
          </p>
        </div>
      </section>

      {/* 매출 통계 그래프 */}
      <section className="dashboard-charts" style={{ marginBottom: "30px" }}>
        <div className="chart-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>기간별 매출 현황</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setPeriod("daily")}
                style={{
                  padding: "5px 15px",
                  border: period === "daily" ? "2px solid #007bff" : "1px solid #ddd",
                  background: period === "daily" ? "#007bff" : "#fff",
                  color: period === "daily" ? "#fff" : "#333",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                일별
              </button>
              <button
                onClick={() => setPeriod("weekly")}
                style={{
                  padding: "5px 15px",
                  border: period === "weekly" ? "2px solid #007bff" : "1px solid #ddd",
                  background: period === "weekly" ? "#007bff" : "#fff",
                  color: period === "weekly" ? "#fff" : "#333",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                주별
              </button>
              <button
                onClick={() => setPeriod("monthly")}
                style={{
                  padding: "5px 15px",
                  border: period === "monthly" ? "2px solid #007bff" : "1px solid #ddd",
                  background: period === "monthly" ? "#007bff" : "#fff",
                  color: period === "monthly" ? "#fff" : "#333",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                월별
              </button>
            </div>
          </div>
          {salesChartData ? (
            <Line data={salesChartData} options={salesChartOptions} />
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
              선택한 기간의 매출 데이터가 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 공동구매 참여율 차트 */}
      <section className="participation-chart" style={{ marginBottom: "30px" }}>
        <div className="chart-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>공동구매별 참여율</h3>
          {participationChartData ? (
            <Bar data={participationChartData} options={participationChartOptions} />
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
              공동구매 참여 데이터가 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 하단 정보 섹션들 */}
      <section className="dashboard-info" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "30px" }}>
        {/* 문의글 현황 */}
        <div className="info-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
            문의글 현황 ({summary.newQuestions}건 새 문의)
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {questions.length > 0 ? (
              <table style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>상품명</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>문의내용</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>상태</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>문의일</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "10px" }}>{q.productName}</td>
                      <td style={{ padding: "10px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={q.question || q.content}>
                        {q.question || q.content || ""}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: q.status === "답변대기" ? "#fff3cd" : "#d4edda",
                            color: q.status === "답변대기" ? "#856404" : "#155724",
                            fontSize: "12px",
                          }}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px", color: "#666" }}>{q.date}</td>
                      <td style={{ padding: "10px" }}>
                        {q.status === "답변대기" && q.qnaId ? (
                          <button
                            onClick={() => {
                              setSelectedQuestion(q);
                              setAnswerText(q.answerContent || "");
                              setShowAnswerModal(true);
                            }}
                            style={{
                              padding: "5px 10px",
                              background: "#007bff",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            답변하기
                          </button>
                        ) : q.answerContent ? (
                          <button
                            onClick={() => {
                              setSelectedQuestion(q);
                              setAnswerText(q.answerContent);
                              setShowAnswerModal(true);
                            }}
                            style={{
                              padding: "5px 10px",
                              background: "#6c757d",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            답변보기
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                최근 들어온 문의글이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 리뷰 현황 */}
        <div className="info-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
            리뷰 현황 ({summary.newReviews}건 새 리뷰)
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {reviews.length > 0 ? (
              <div>
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "15px",
                      borderBottom: "1px solid #f5f5f5",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <strong>{r.productName}</strong>
                      <span style={{ color: "#ffc107" }}>
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <p style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>{r.review}</p>
                    <span style={{ color: "#999", fontSize: "12px" }}>{r.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                아직 등록된 리뷰가 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 공동구매 진행 현황 */}
      <section className="group-deal-status" style={{ marginBottom: "30px" }}>
        <div className="info-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
            공동구매 진행 현황
          </h3>
          <div style={{ display: "grid", gap: "15px" }}>
            {groupDeals.length > 0 ? (
              groupDeals.map((gd) => {
                const progress = (gd.current / gd.target) * 100;
                return (
                  <div
                    key={gd.id}
                    style={{
                      padding: "15px",
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/groupdeal/${gd.id}`)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <strong>{gd.title}</strong>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background: gd.status === "OPEN" ? "#d4edda" : "#fff3cd",
                          color: gd.status === "OPEN" ? "#155724" : "#856404",
                          fontSize: "12px",
                        }}
                      >
                        {gd.status === "OPEN" ? "진행 중" : "마감"}
                      </span>
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "5px" }}>
                        <span>{gd.current} / {gd.target} 개</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "20px",
                          background: "#f0f0f0",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${progress}%`,
                            height: "100%",
                            background: progress >= 100 ? "#28a745" : "#007bff",
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                진행 중인 공동구매가 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 발송 처리 관리 */}
      <section className="delivery-management">
        <div 
          className="info-card" 
          style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", cursor: "pointer" }} 
          onClick={() => {
            // 첫 번째 공동구매가 있으면 그 manage 페이지로, 없으면 공동구매 목록 페이지로
            if (groupDeals && groupDeals.length > 0) {
              const firstDealId = groupDeals[0].id || groupDeals[0].groupDealId;
              if (firstDealId) {
                navigate(`/groupdeal/${firstDealId}/manage`);
              } else {
                navigate("/producer/groupdeals");
              }
            } else {
              navigate("/producer/groupdeals");
            }
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
            발송 처리 관리 (대기 {summary.pendingDeliveries}건)
          </h3>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {deliveries.length > 0 ? (
              <table style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>주문번호</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>상품명</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>수령인</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>현재 상태</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>발송일</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "10px" }}>{d.orderId}</td>
                      <td style={{ padding: "10px" }}>{d.productName}</td>
                      <td style={{ padding: "10px" }}>{d.recipient}</td>
                      <td style={{ padding: "10px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background:
                              d.status === "배송완료"
                                ? "#d4edda"
                                : d.status === "배송중"
                                ? "#cce5ff"
                                : d.status === "배송취소"
                                ? "#f8d7da"
                                : "#fff3cd",
                            color:
                              d.status === "배송완료"
                                ? "#155724"
                                : d.status === "배송중"
                                ? "#004085"
                                : d.status === "배송취소"
                                ? "#721c24"
                                : "#856404",
                            fontSize: "12px",
                          }}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px", color: "#666" }}>{d.date}</td>
                      <td style={{ padding: "10px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 상위 div의 onClick 이벤트 방지
                            // 첫 번째 공동구매가 있으면 그 manage 페이지로, 없으면 공동구매 목록 페이지로
                            if (groupDeals && groupDeals.length > 0) {
                              const firstDealId = groupDeals[0].id || groupDeals[0].groupDealId;
                              if (firstDealId) {
                                navigate(`/groupdeal/${firstDealId}/manage`);
                              } else {
                                navigate("/producer/groupdeals");
                              }
                            } else {
                              navigate("/producer/groupdeals");
                            }
                          }}
                          style={{
                            padding: "5px 15px",
                            background: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          관리하기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                발송해야 할 주문이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 답변 작성 모달 */}
      {showAnswerModal && selectedQuestion && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowAnswerModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>문의 답변</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <strong>상품명:</strong> {selectedQuestion.productName}
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <strong>문의내용:</strong>
              <div style={{ padding: "10px", background: "#f5f5f5", borderRadius: "4px", marginTop: "5px" }}>
                {selectedQuestion.content || selectedQuestion.question}
              </div>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <strong>답변:</strong>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="답변을 입력하세요"
                style={{
                  width: "100%",
                  minHeight: "150px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginTop: "5px",
                  fontSize: "14px",
                }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowAnswerModal(false);
                  setSelectedQuestion(null);
                  setAnswerText("");
                }}
                style={{
                  padding: "10px 20px",
                  background: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!answerText.trim()) {
                    alert("답변을 입력해주세요.");
                    return;
                  }
                  if (!selectedQuestion.qnaId) {
                    alert("답변할 수 없는 문의입니다.");
                    return;
                  }
                  try {
                    await writeAnswer(selectedQuestion.qnaId, { answerContent: answerText });
                    alert("답변이 등록되었습니다.");
                    setShowAnswerModal(false);
                    setSelectedQuestion(null);
                    setAnswerText("");
                    // 데이터 다시 로드
                    window.location.reload();
                  } catch (err) {
                    console.error("답변 등록 오류:", err);
                    alert("답변 등록 중 오류가 발생했습니다.");
                  }
                }}
                style={{
                  padding: "10px 20px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                답변 등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}