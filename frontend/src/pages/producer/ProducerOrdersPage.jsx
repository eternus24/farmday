// src/pages/producer/ProducerOrdersPage.jsx
import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styled from 'styled-components'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ProducerOrdersPage() {
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)

  // ACTIVE | COMPLETED | REFUNDS | SALES
  const [tab, setTab] = useState('ACTIVE')

  const [activeOrders, setActiveOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [refundOrders, setRefundOrders] = useState([]) // 환불 내역
  const [monthlySummary, setMonthlySummary] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    const commonHeaders = {
      'Content-Type': 'application/json',
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    }

    const fetchAll = async () => {
      try {
        setLoading(true)
        setError('')

        // ACTIVE / COMPLETED / REFUNDS / SALES / DASHBOARD 한 번에 조회
        const [
          activeRes,
          completedRes,
          refundRes,
          salesRes,
          dashboardRes,
        ] = await Promise.all([
          axios.get(`${API_BASE}/api/producer/orders`, {
            headers: commonHeaders,
            params: { type: 'ACTIVE' },
          }),
          axios.get(`${API_BASE}/api/producer/orders`, {
            headers: commonHeaders,
            params: { type: 'COMPLETED' },
          }),
          axios.get(`${API_BASE}/api/producer/orders`, {
            headers: commonHeaders,
            params: { type: 'REFUNDS' },
          }),
          axios.get(`${API_BASE}/api/producer/sales/monthly`, {
            headers: commonHeaders,
          }),
          axios.get(`${API_BASE}/api/producer/dashboard`, {
            headers: commonHeaders,
          }),
        ])

        setActiveOrders(activeRes.data || [])
        setCompletedOrders(completedRes.data || [])
        setRefundOrders(refundRes.data || [])

        // 🔥 월간 매출 + 대시보드 서머리(오늘 기준 집계)를 함께 저장
        setMonthlySummary({
          ...(salesRes.data || {}),
          dashboardSummary: dashboardRes.data?.summary || null,
        })
      } catch (err) {
        console.error('생산자 주문/매출 조회 에러:', err)
        setError('주문/매출 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [auth])

  // ✅ 여기서 두 번째 인자로 "환불 탭에서 왔는지" 플래그 받기
  const handleGoDetail = (orderId, fromRefund = false) => {
    if (fromRefund) {
      navigate(`/producer/orders/${orderId}`, {
        state: { fromRefund: true },
      })
    } else {
      navigate(`/producer/orders/${orderId}`)
    }
  }

  return (
    <OrdersPageContainer>
      <PageTitle>판매 관리</PageTitle>

      <OrdersTabs>
        <TabButton
          type="button"
          $active={tab === 'ACTIVE'}
          onClick={() => setTab('ACTIVE')}
        >
          신규/진행중 주문
        </TabButton>
        <TabButton
          type="button"
          $active={tab === 'COMPLETED'}
          onClick={() => setTab('COMPLETED')}
        >
          완료된 판매 내역
        </TabButton>
        <TabButton
          type="button"
          $active={tab === 'REFUNDS'}
          onClick={() => setTab('REFUNDS')}
        >
          환불 내역
        </TabButton>
        <TabButton
          type="button"
          $active={tab === 'SALES'}
          onClick={() => setTab('SALES')}
        >
          매출 현황
        </TabButton>
      </OrdersTabs>

      {loading && <Message>데이터를 불러오는 중입니다...</Message>}
      {!loading && error && <Message $error>{error}</Message>}

      {!loading && !error && tab === 'ACTIVE' && (
        <SectionCard>
          <SectionTitle>신규/진행중 주문 리스트</SectionTitle>
          <OrderTable
            orders={activeOrders}
            onClickDetail={(id) => handleGoDetail(id, false)} // 일반 모드
          />
        </SectionCard>
      )}

      {!loading && !error && tab === 'COMPLETED' && (
        <SectionCard>
          <SectionTitle>완료된 판매 내역</SectionTitle>
          <OrderTable
            orders={completedOrders}
            onClickDetail={(id) => handleGoDetail(id, false)} // 일반 모드
          />
        </SectionCard>
      )}

      {!loading && !error && tab === 'REFUNDS' && (
        <SectionCard>
          <SectionTitle>환불 내역</SectionTitle>
          <OrderTable
            orders={refundOrders}
            // ✅ 환불 탭에서 들어갈 때만 fromRefund = true
            onClickDetail={(id) => handleGoDetail(id, true)}
          />
        </SectionCard>
      )}

      {!loading && !error && tab === 'SALES' && (
        <SectionCard>
          <SectionTitle>이번 달 매출 현황</SectionTitle>
          <MonthlySalesSection summary={monthlySummary} />
        </SectionCard>
      )}
    </OrdersPageContainer>
  )
}

/* =====================
   공통 포맷터 / 유틸
   ===================== */

function formatDate(dateTimeString) {
  if (!dateTimeString) return '-'
  return dateTimeString.slice(0, 10) // 2025-11-26
}

function getDateKey(dateTimeString) {
  if (!dateTimeString) return ''
  return dateTimeString.slice(0, 10)
}

/* =====================
   주문 리스트 테이블
   ===================== */

function OrderTable({ orders, onClickDetail }) {
  if (!orders || orders.length === 0) {
    return <Message>주문이 없습니다.</Message>
  }

  return (
    <StyledTable>
      <thead>
        <tr>
          <th>주문일</th>
          <th>주문번호</th>
          <th>구매자</th>
          <th>상품</th>
          <th>금액</th>
          <th>상태</th>
          <th>처리</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={`${o.orderId}-${o.orderItemId || ''}`}>
            <td>{formatDate(o.orderDate)}</td>
            <td>{o.orderNo || o.orderId}</td>
            <td>{o.buyerName || o.receiverName}</td>
            <td>
              {o.firstProductName || o.productName}
              {o.itemCount > 1 && <> 외 {o.itemCount - 1}건</>}
            </td>
            <td>
              {(o.totalAmount ?? o.lineTotalAmount ?? 0).toLocaleString()}원
            </td>
            <td>{o.status || o.orderStatus}</td>
            <td>
              <TableButton
                type="button"
                onClick={() => onClickDetail(o.orderId)}
              >
                주문 처리
              </TableButton>
            </td>
          </tr>
        ))}
      </tbody>
    </StyledTable>
  )
}

/* =====================
   매출 현황 섹션
   ===================== */

function MonthlySalesSection({ summary }) {
  if (!summary) return <Message>매출 데이터가 없습니다.</Message>

  const rawDailySales = summary.dailySales || []
  const salesItems = summary.salesItems || []
  const topProducts = summary.topProducts || []

  // 🔥 대시보드 서머리(오늘 기준 집계)
  const dashboard = summary.dashboardSummary || {}
  const todaySalesAmount = dashboard.todaySalesAmount || 0
  const todayOrderCount = dashboard.newOrderCount || 0

  // 🔸 salesItems 기준으로 일자별 주문 수 다시 계산
  const dailyOrderCountMap = {}
  salesItems.forEach((item) => {
    const key = getDateKey(item.orderDate || item.salesDate)
    if (!key) return
    dailyOrderCountMap[key] = (dailyOrderCountMap[key] || 0) + 1
  })

  const dailySales = rawDailySales.map((d) => {
    const key = getDateKey(d.salesDate || d.orderDate)
    const computedCount = dailyOrderCountMap[key] || 0

    const orderCount =
      d.orderCount ?? d.orderCnt ?? d.order_cnt ?? computedCount
    const totalAmount = d.totalAmount ?? d.salesAmount ?? 0

    return {
      ...d,
      _dateKey: key,
      _orderCount: orderCount,
      _totalAmount: totalAmount,
    }
  })

  const monthTotal = dailySales.reduce(
    (sum, d) => sum + (d._totalAmount || 0),
    0,
  )

  return (
    <MonthlySalesWrapper>
      {/* 상단 요약 카드 */}
      <SummaryCardRow>
        {/* 오늘 매출 + 오늘 주문 수 */}
        <SummaryCard>
          <SummaryTitle>오늘 매출</SummaryTitle>
          <SummaryValue>{todaySalesAmount.toLocaleString()}원</SummaryValue>
          <SummarySub>{todayOrderCount}건</SummarySub>
        </SummaryCard>

        {/* 이번 달 총 매출 */}
        <SummaryCard>
          <SummaryTitle>이번 달 총 매출</SummaryTitle>
          <SummaryValue>{monthTotal.toLocaleString()}원</SummaryValue>
        </SummaryCard>

        {/* 이번 달 판매 내역 건수 */}
        <SummaryCard>
          <SummaryTitle>판매 내역 건수</SummaryTitle>
          <SummaryValue>{salesItems.length}건</SummaryValue>
        </SummaryCard>

        {/* TOP 판매 상품 개수 */}
        <SummaryCard>
          <SummaryTitle>TOP 판매 상품</SummaryTitle>
          <SummaryValue>{topProducts.length}개</SummaryValue>
        </SummaryCard>
      </SummaryCardRow>

      {/* 일별 매출 */}
      <SalesBlock>
        <SalesBlockTitle>일별 매출</SalesBlockTitle>
        {dailySales.length === 0 ? (
          <Message>일별 매출 데이터가 없습니다.</Message>
        ) : (
          <StyledTable>
            <thead>
              <tr>
                <th>날짜</th>
                <th>매출 금액</th>
                <th>주문 수</th>
              </tr>
            </thead>
            <tbody>
              {dailySales.map((d, idx) => (
                <tr key={idx}>
                  <td>{d._dateKey || formatDate(d.salesDate || d.orderDate)}</td>
                  <td>{(d._totalAmount || 0).toLocaleString()}원</td>
                  <td>{d._orderCount || 0}건</td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        )}
      </SalesBlock>

      {/* 이번 달 판매 내역 */}
      <SalesBlock>
        <SalesBlockTitle>이번 달 판매 내역</SalesBlockTitle>
        {salesItems.length === 0 ? (
          <Message>판매 내역이 없습니다.</Message>
        ) : (
          <StyledTable>
            <thead>
              <tr>
                <th>일자</th>
                <th>주문번호</th>
                <th>상품명</th>
                <th>수량</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {salesItems.map((item, idx) => {
                const amount =
                  item.amount ??
                  item.totalAmount ??
                  item.lineTotalAmount ??
                  0

                return (
                  <tr key={idx}>
                    <td>{formatDate(item.orderDate)}</td>
                    <td>{item.orderId}</td>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{amount.toLocaleString()}원</td>
                  </tr>
                )
              })}
            </tbody>
          </StyledTable>
        )}
      </SalesBlock>

      {/* TOP 상품 */}
      <SalesBlock>
        <SalesBlockTitle>
          가장 많이 팔린 상품 TOP {topProducts.length}
        </SalesBlockTitle>
        {topProducts.length === 0 ? (
          <Message>TOP 상품 데이터가 없습니다.</Message>
        ) : (
          <StyledTable>
            <thead>
              <tr>
                <th>상품명</th>
                <th>판매 수량</th>
                <th>매출 금액</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, idx) => {
                const amount = p.totalAmount ?? p.salesAmount ?? 0
                return (
                  <tr key={idx}>
                    <td>{p.productName}</td>
                    <td>{p.totalQuantity}</td>
                    <td>{amount.toLocaleString()}원</td>
                  </tr>
                )
              })}
            </tbody>
          </StyledTable>
        )}
      </SalesBlock>
    </MonthlySalesWrapper>
  )
}

/* =============================
   styled-components
   ============================= */

const OrdersPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const PageTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 4px;
  color: #111827;
`

const OrdersTabs = styled.div`
  display: inline-flex;
  border-radius: 999px;
  background-color: #f3f4f6;
  padding: 4px;
  margin-bottom: 8px;
`

const TabButton = styled.button`
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#ffffff' : '#6b7280')};
  background-color: ${({ $active }) => ($active ? '#10b981' : 'transparent')};
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background-color: ${({ $active }) =>
      $active ? '#059669' : 'rgba(15, 118, 110, 0.08)'};
  }
`

const SectionCard = styled.section`
  background: #f9fafb;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
`

const SectionTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 10px;
  color: #111827;
`

const Message = styled.p`
  margin: 8px 0;
  font-size: 14px;
  color: ${({ $error }) => ($error ? '#dc2626' : '#6b7280')};
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 13px;

  thead th {
    text-align: left;
    padding: 10px 8px;
    border-bottom: 1px solid #e5e7eb;
    color: #6b7280;
    font-weight: 600;
  }

  tbody td {
    padding: 10px 8px;
    border-bottom: 1px solid #f3f4f6;
    color: #111827;
  }

  tbody tr:hover {
    background-color: #f9fafb;
  }
`

const TableButton = styled.button`
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #10b981;
  background-color: #ecfdf5;
  color: #047857;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background-color: #d1fae5;
  }
`

/* 매출 현황 전용 래퍼 */

const MonthlySalesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const SummaryCardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
`

const SummaryCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
`

const SummaryTitle = styled.h4`
  font-size: 13px;
  margin: 0 0 4px;
  color: #6b7280;
`

const SummaryValue = styled.p`
  font-size: 18px;
  margin: 0;
  font-weight: 700;
  color: #111827;
  text-align: right;
`

const SummarySub = styled.p`
  margin: 2px 0 0;
  font-size: 12px;
  color: #6b7280;
  text-align: right;
`

const SalesBlock = styled.section`
  margin-top: 4px;
`

const SalesBlockTitle = styled.h4`
  font-size: 15px;
  margin: 0 0 8px;
  color: #111827;
`