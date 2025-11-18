// src/pages/producer/ProducerDashboard.jsx
import { useEffect, useState } from 'react'

export default function ProducerDashboard() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    // TODO: 매출/재고/통계 요약 API 호출
    setSummary({
      todaySales: 123000,
      monthSales: 4560000,
      newOrdersCount: 3,
      lowStockCount: 2,
    })
  }, [])

  if (!summary) return <div>로딩중...</div>

  return (
    <div className="producer-dashboard">
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
          <div className="chart-placeholder">
            {/* TODO: 매출 그래프 컴포넌트 (라인 차트 등) */}
            차트 영역
          </div>
        </div>

        <div className="chart-card">
          <h3>재고 현황 (버티컬 막대 차트 자리)</h3>
          <div className="chart-placeholder">
            {/* TODO: 재고 막대 그래프 */}
            차트 영역
          </div>
        </div>

        <div className="chart-card">
          <h3>상품별 판매 통계 (도넛 차트 자리)</h3>
          <div className="chart-placeholder">
            {/* TODO: 도넛 차트 */}
            차트 영역
          </div>
        </div>
      </section>
    </div>
  )
}