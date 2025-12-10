// src/pages/producer/SellerDashboard.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
// 🔥 공동구매 QnA 조회용
import { fetchGroupDealQnaList } from "../../api/groupDealQnaApi";

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
import { Line, Bar } from "react-chartjs-2";

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

  // 문의글, 공동구매 현황
  const [questions, setQuestions] = useState([]);
  const [groupDeals, setGroupDeals] = useState([]);

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

        // ===============================
        // 1. 기본 대시보드 / 매출 / 주문
        // ===============================
        const dashboardPromise = axios.get(
          `${API_BASE}/api/producer/dashboard`,
          {
            headers,
            withCredentials: true,
          }
        );

        const monthlyPromise = axios.get(
          `${API_BASE}/api/producer/sales/monthly`,
          {
            headers,
            withCredentials: true,
          }
        );

        const ordersPromise = axios.get(
          `${API_BASE}/api/producer/orders`,
          {
            headers,
            withCredentials: true,
            params: { type: "ACTIVE" },
          }
        );

        // ===============================
        // 2. 내 공동구매 목록 (그룹딜 전용)
        // ===============================
        const myGroupDealsPromise = axios.get(
          `${API_BASE}/api/seller/group-deals/my`,
          {
            headers,
            withCredentials: true,
          }
        );

        // 5. 병렬 처리
        const [dashRes, monthRes, ordersRes, myGroupDealsRes] =
          await Promise.all([
            dashboardPromise,
            monthlyPromise,
            ordersPromise,
            myGroupDealsPromise,
          ]);

        const dash = dashRes.data || {};
        const month = monthRes.data || {};
        const orders = ordersRes.data || [];
        const myGroupDeals = myGroupDealsRes.data || [];

        console.log("🔥 /api/producer/dashboard 응답:", dash);
        console.log("🔥 /api/producer/sales/monthly 응답:", month);
        console.log("🔥 /api/producer/orders 응답:", orders);
        console.log("🔥 /api/seller/group-deals/my 응답:", myGroupDeals);

        // ===============================
        // 공동구매 진행 현황 (내 그룹딜 목록 사용)
        // ===============================
        const groupDealsData = Array.isArray(myGroupDeals)
          ? myGroupDeals.map((gd) => ({
              id: gd.groupDealId,
              groupDealId: gd.groupDealId,
              title: gd.title,
              subTitle: gd.subTitle ?? "",
              thumbnailImageUrl: gd.thumbnailImageUrl ?? null,
              originPrice: Number(gd.originPrice ?? 0),
              dealPrice: Number(gd.dealPrice ?? 0),
              discountRate: Number(gd.discountRate ?? 0),
              current: Number(gd.currentQuantity ?? 0),
              target: Number(gd.minMemberCount ?? 0),
              participationRate:
                gd.minMemberCount > 0
                  ? Math.round(
                      ((gd.currentQuantity ?? 0) / gd.minMemberCount) * 100
                    )
                  : 0,
              status: gd.status || "OPEN",
              endAt: gd.endAt ?? null,
            }))
          : [];

        setGroupDeals(groupDealsData);

        // 공동구매 통계 (참여율)
        const groupDealStatsFromApi = groupDealsData.map((gd) => ({
          id: gd.id,
          title: gd.title,
          participationRate:
            gd.target > 0 ? Math.round((gd.current / gd.target) * 100) : 0,
          status: gd.status,
        }));
        setGroupDealStats(groupDealStatsFromApi);

        // ===============================
        // 🔥 문의글 현황용 QnA 모으기
        // ===============================
        let questionsFromGroupDeals = [];

        if (Array.isArray(groupDealsData) && groupDealsData.length > 0) {
          try {
            const qnaPromises = groupDealsData.map((gd) =>
              fetchGroupDealQnaList(gd.id)
                .then((res) => ({ deal: gd, res }))
                .catch((err) => {
                  console.error("공동구매 QnA 조회 오류:", gd.id, err);
                  return { deal: gd, res: [] };
                })
            );

            const qnaResults = await Promise.all(qnaPromises);

            qnaResults.forEach(({ deal, res }) => {
              let list = [];

              if (Array.isArray(res)) {
                list = res;
              } else if (Array.isArray(res?.qnaList)) {
                list = res.qnaList;
              } else if (Array.isArray(res?.content)) {
                list = res.content;
              }

              (list || []).forEach((q) => {
                const createdAt =
                  q.createdDate ||
                  q.created_date ||
                  q.created_at ||
                  null;
                const dateStr = createdAt
                  ? new Date(createdAt).toISOString().slice(0, 10)
                  : "";

                questionsFromGroupDeals.push({
                  id: q.qnaId || q.id,
                  dealId: deal.id,
                  dealTitle: deal.title || "공동구매",
                  title: q.title || q.content || "",
                  status:
                    q.status === "ANSWERED" || q.answerContent
                      ? "답변완료"
                      : "답변대기",
                  date: dateStr,
                });
              });
            });

            // 최신순 정렬
            questionsFromGroupDeals.sort((a, b) => {
              if (!a.date && !b.date) return 0;
              if (!a.date) return 1;
              if (!b.date) return -1;
              return new Date(b.date) - new Date(a.date);
            });
          } catch (e) {
            console.error("공동구매 QnA 취합 오류:", e);
          }
        }

        const newQuestionsCount = questionsFromGroupDeals.filter(
          (q) => q.status === "답변대기"
        ).length;
        setQuestions(questionsFromGroupDeals);

        // ===============================
        // ✅ 매출 데이터 (공동구매 기준)
        //    - 매출액 = dealPrice * currentQuantity
        //    - 매출 날짜 = endAt 기준
        // ===============================
        const dailyMap = {};

        groupDealsData.forEach((gd) => {
          if (!gd.endAt) return;
          const dateObj = new Date(gd.endAt);
          if (isNaN(dateObj.getTime())) return;

          const dateKey = dateObj.toISOString().slice(0, 10); // 'YYYY-MM-DD'
          const amount = gd.dealPrice * gd.current;

          if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = {
              date: dateKey,
              amount: 0,
              orders: 0, // 건수 = 공동구매 건수
            };
          }
          dailyMap[dateKey].amount += amount || 0;
          dailyMap[dateKey].orders += 1;
        });

        const dailyDataFromDeals = Object.values(dailyMap).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        console.log("🔍 dailyDataFromDeals:", dailyDataFromDeals);

        setDailySales(
          dailyDataFromDeals.map((d) => {
            const dateObj = new Date(d.date);
            const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            return {
              date: label,
              amount: d.amount,
              orders: d.orders,
            };
          })
        );

        // 주별 매출 (일별 합산)
        const weeklyData = [];
        if (dailyDataFromDeals.length > 0) {
          for (let i = 0; i < dailyDataFromDeals.length; i += 7) {
            const weekData = dailyDataFromDeals.slice(i, i + 7);
            const weekAmount = weekData.reduce(
              (sum, d) => sum + (d.amount || 0),
              0
            );
            const weekOrders = weekData.reduce(
              (sum, d) => sum + (d.orders || 0),
              0
            );
            weeklyData.push({
              week:
                i === 0
                  ? "이번 주"
                  : `${Math.floor(i / 7) + 1}주 전`,
              amount: weekAmount,
              orders: weekOrders,
            });
          }
        }
        setWeeklySales(weeklyData);

        // 월별 매출 (공동구매 기준)
        const monthlyMap = {};
        dailyDataFromDeals.forEach((d) => {
          const dateObj = new Date(d.date);
          if (isNaN(dateObj.getTime())) return;

          const ymKey = `${dateObj.getFullYear()}-${(
            "0" + (dateObj.getMonth() + 1)
          ).slice(-2)}`; // 'YYYY-MM'
          const label = `${dateObj.getMonth() + 1}월`;

          if (!monthlyMap[ymKey]) {
            monthlyMap[ymKey] = {
              monthKey: ymKey,
              month: label,
              amount: 0,
              orders: 0,
            };
          }
          monthlyMap[ymKey].amount += d.amount || 0;
          monthlyMap[ymKey].orders += d.orders || 0;
        });

        let monthlyDataFromDeals = Object.values(monthlyMap).sort((a, b) =>
          a.monthKey.localeCompare(b.monthKey)
        );

        // (선택) 백엔드 monthlySales 있으면 이걸로 덮어쓸 수도 있음
        if ((month.monthlySales || []).length > 0) {
          monthlyDataFromDeals = (month.monthlySales || []).map((m) => ({
            month: m.month || m.monthLabel || m.label || "",
            amount: m.totalAmount ?? m.amount ?? 0,
            orders: m.orderCount ?? m.orders ?? 0,
          }));
        }

        // 월별 데이터가 없고, dash.summary 에 월 매출만 오는 경우
        if (!monthlyDataFromDeals.length && dash.summary?.monthSalesAmount) {
          monthlyDataFromDeals = [
            {
              month: `${new Date().getMonth() + 1}월`,
              amount: dash.summary.monthSalesAmount,
              orders: dash.summary.monthOrderCount || 0,
            },
          ];
        }

        setMonthlySales(monthlyDataFromDeals);

        // ===============================
        // 발송 관리 (주문 데이터 – 기존 그대로)
        // ===============================
        const deliveriesFromApi = orders.slice(0, 10).map((order, idx) => ({
          id: order.orderItemId || order.id || idx,
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
              : order.deliveryStatus === "CANCELED"
              ? "배송취소"
              : "배송준비",
          date: order.orderDate
            ? new Date(order.orderDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        }));
        setDeliveries(deliveriesFromApi);

        // ===============================
        // ✅ 상단 요약 카드 데이터 (전부 "그룹딜 기준")
        // ===============================
        const now = new Date();
        const todayKey = now.toISOString().slice(0, 10);

        // 오늘 날짜에 해당하는 집계가 있으면 그 값,
        // 없으면 가장 최근 집계일 매출을 "오늘 매출"처럼 보여주기
        let todaySalesFromDeals = 0;
        if (dailyDataFromDeals.length > 0) {
          const todayRow = dailyDataFromDeals.find((d) => {
            const dKey = new Date(d.date).toISOString().slice(0, 10);
            return dKey === todayKey;
          });

          if (todayRow) {
            todaySalesFromDeals = todayRow.amount || 0;
          } else {
            const last = dailyDataFromDeals[dailyDataFromDeals.length - 1];
            todaySalesFromDeals = last.amount || 0;
          }
        }

        // 최근 7일 합
        const weekSalesFromDeals = dailyDataFromDeals
          .slice(-7)
          .reduce((sum, d) => sum + (d.amount || 0), 0);

        // 이번 달 매출: 현재 달 키에 해당하는 amount
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentYmKey =
          currentYear + "-" + ("0" + (currentMonth + 1)).slice(-2);
        const monthSalesFromDeals =
          monthlyMap[currentYmKey]?.amount || 0;

        const summaryData = {
          todaySales: todaySalesFromDeals,
          weekSales: weekSalesFromDeals,
          monthSales: monthSalesFromDeals,

          totalGroupDeals: groupDealsData.length,
          activeGroupDeals: groupDealsData.filter((gd) =>
            ["OPEN", "IN_PROGRESS", "ONGOING"].includes(gd.status)
          ).length,
          participationRate:
            groupDealsData.length > 0
              ? groupDealsData.reduce((sum, gd) => {
                  const rate =
                    gd.target > 0
                      ? (gd.current / gd.target) * 100
                      : 0;
                  return sum + rate;
                }, 0) / groupDealsData.length
              : 0,
          newQuestions: newQuestionsCount,
          pendingDeliveries: orders.length,
        };

        console.log("🔍 summaryData:", summaryData);
        setSummary(summaryData);
      } catch (err) {
        console.error("판매자 대시보드 조회 오류:", err);
        const status = err.response?.status;
        if (status === 401) {
          setError("로그인 시간이 만료되었어요. 다시 로그인해 주세요.");
        } else if (status === 403) {
          setError(
            "판매자 계정이 아닙니다. 판매자로 등록된 계정으로 로그인해 주세요."
          );
        } else {
          setError(
            "대시보드 정보를 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요."
          );
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

    const labels = groupDealStats.map((g) =>
      g.title && g.title.length > 15
        ? g.title.substring(0, 15) + "..."
        : g.title
    );
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

  // 배송 상태 변경 핸들러 (UI에서만 변경 – 지금은 안 씀)
  const handleDeliveryStatusChange = async (deliveryId, newStatus) => {
    try {
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
      <section
        className="dashboard-header"
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h2 style={{ margin: 0 }}>
          {displayName} 님, 판매자 대시보드에 오신 것을 환영합니다 👋
        </h2>
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
      <section
        className="dashboard-kpi"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          className="kpi-card"
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "10px",
            }}
          >
            오늘 매출
          </h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {summary.todaySales.toLocaleString()}원
          </p>
        </div>
        <div
          className="kpi-card"
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "10px",
            }}
          >
            이번 달 매출
          </h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {summary.monthSales.toLocaleString()}원
          </p>
        </div>
        <div
          className="kpi-card"
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "10px",
            }}
          >
            진행 중인 공동구매
          </h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {summary.activeGroupDeals}개
          </p>
        </div>
        <div
          className="kpi-card"
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "10px",
            }}
          >
            평균 참여율
          </h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {summary.participationRate.toFixed(1)}%
          </p>
        </div>
      </section>

      {/* 매출 통계 그래프 */}
      <section className="dashboard-charts" style={{ marginBottom: "30px" }}>
        <div
          className="chart-card"
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
              기간별 매출 현황
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setPeriod("daily")}
                style={{
                  padding: "5px 15px",
                  border:
                    period === "daily"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
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
                  border:
                    period === "weekly"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
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
                  border:
                    period === "monthly"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
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
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#999",
              }}
            >
              선택한 기간의 매출 데이터가 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 공동구매 참여율 차트 */}
      <section
        className="participation-chart"
        style={{ marginBottom: "30px" }}
      >
        <div
          className="chart-card"
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            공동구매별 참여율
          </h3>
          {participationChartData ? (
            <Bar
              data={participationChartData}
              options={participationChartOptions}
            />
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#999",
              }}
            >
              공동구매 참여 데이터가 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 하단 정보 섹션 – 문의글 현황만 */}
      <section
        className="dashboard-info"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* 문의글 현황 */}
        <div
          className="info-card"
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            문의글 현황 ({summary.newQuestions}건 새 문의)
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {questions.length > 0 ? (
              <table style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      공동구매 제목
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      문의 제목
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      상태
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      문의일
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {questions.map((q) => (
                    <tr
                      key={q.id}
                      style={{
                        borderBottom: "1px solid #f5f5f5",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate(`/groupdeal/${q.dealId}/manage`)
                      }
                    >
                      <td
                        style={{
                          padding: "10px",
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={q.dealTitle}
                      >
                        {q.dealTitle}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          maxWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={q.title}
                      >
                        {q.title}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background:
                              q.status === "답변대기"
                                ? "#fff3cd"
                                : "#d4edda",
                            color:
                              q.status === "답변대기"
                                ? "#856404"
                                : "#155724",
                            fontSize: "12px",
                          }}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          color: "#666",
                        }}
                      >
                        {q.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                최근 들어온 문의글이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 공동구매 진행 현황 */}
      <section
        className="group-deal-status"
        style={{ marginBottom: "30px" }}
      >
        <div
          className="info-card"
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            공동구매 진행 현황
          </h3>
          <div style={{ display: "grid", gap: "15px" }}>
            {groupDeals.length > 0 ? (
              groupDeals.map((gd) => {
                const progress =
                  gd.target > 0 ? (gd.current / gd.target) * 100 : 0;
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <strong>{gd.title}</strong>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background:
                            gd.status === "OPEN"
                              ? "#d4edda"
                              : "#fff3cd",
                          color:
                            gd.status === "OPEN"
                              ? "#155724"
                              : "#856404",
                          fontSize: "12px",
                        }}
                      >
                        {gd.status === "OPEN" ? "진행 중" : "마감"}
                      </span>
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "14px",
                          marginBottom: "5px",
                        }}
                      >
                        <span>
                          {gd.current} / {gd.target} 개
                        </span>
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
                            background:
                              progress >= 100
                                ? "#28a745"
                                : "#007bff",
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                진행 중인 공동구매가 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      
    </div>  );  
}