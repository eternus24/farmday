// src/pages/producer/ProducerOrdersPage.jsx
import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ProducerOrdersPage() {
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)

  const [tab, setTab] = useState('ACTIVE') // 'ACTIVE' | 'COMPLETED' | 'SALES'
  const [activeOrders, setActiveOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
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

        // ✅ 백엔드 설계에 맞게 type 파라미터 사용
        const [activeRes, completedRes, salesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/producer/orders`, {
            headers: commonHeaders,
            params: { type: 'ACTIVE' },
          }),
          axios.get(`${API_BASE}/api/producer/orders`, {
            headers: commonHeaders,
            params: { type: 'COMPLETED' },
          }),
          axios.get(`${API_BASE}/api/producer/sales/monthly`, {
            headers: commonHeaders,
          }),
        ])

        setActiveOrders(activeRes.data || [])
        setCompletedOrders(completedRes.data || [])
        setMonthlySummary(salesRes.data || null)
      } catch (err) {
        console.error('생산자 주문/매출 조회 에러:', err)
        setError('주문/매출 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [auth])

  const handleGoDetail = (orderId) => {
    navigate(`/producer/orders/${orderId}`)
  }

  return (
    <div className="producer-orders-page">
      <h2>판매 관리</h2>

      <div className="orders-tabs">
        <button
          className={tab === 'ACTIVE' ? 'active' : ''}
          onClick={() => setTab('ACTIVE')}
        >
          신규/진행중 주문
        </button>
        <button
          className={tab === 'COMPLETED' ? 'active' : ''}
          onClick={() => setTab('COMPLETED')}
        >
          완료된 판매 내역
        </button>
        <button
          className={tab === 'SALES' ? 'active' : ''}
          onClick={() => setTab('SALES')}
        >
          매출 현황
        </button>
      </div>

      {loading && <p>데이터를 불러오는 중입니다...</p>}
      {!loading && error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && tab === 'ACTIVE' && (
        <section>
          <h3>신규/진행중 주문 리스트</h3>
          <OrderTable orders={activeOrders} onClickDetail={handleGoDetail} />
        </section>
      )}

      {!loading && !error && tab === 'COMPLETED' && (
        <section>
          <h3>완료된 판매 내역</h3>
          <OrderTable orders={completedOrders} onClickDetail={handleGoDetail} />
        </section>
      )}

      {!loading && !error && tab === 'SALES' && (
        <section>
          <h3>이번 달 매출 현황</h3>
          <MonthlySalesSection summary={monthlySummary} />
        </section>
      )}
    </div>
  )
}

// =====================
// 주문 리스트 테이블
// =====================
function OrderTable({ orders, onClickDetail }) {
  if (!orders || orders.length === 0) return <p>주문이 없습니다.</p>

  return (
    <table className="orders-table">
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
          <tr key={o.orderId}>
            <td>{o.orderDate}</td>
            <td>{o.orderNo}</td>
            <td>{o.buyerName}</td>
            <td>
              {o.firstProductName}
              {o.itemCount > 1 && <> 외 {o.itemCount - 1}건</>}
            </td>
            <td>{o.totalAmount?.toLocaleString()}원</td>
            <td>{o.status}</td>
            <td>
              <button type="button" onClick={() => onClickDetail(o.orderId)}>
                주문 처리
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// =====================
// 매출 현황 섹션
// =====================
function MonthlySalesSection({ summary }) {
  if (!summary) return <p>매출 데이터가 없습니다.</p>

  const dailySales = summary.dailySales || []
  const salesItems = summary.salesItems || []
  const topProducts = summary.topProducts || []

  // 일별 매출 합산해서 이번달 총 매출 구해보기 (백엔드에 총합 필드가 없다면)
  const monthTotal = dailySales.reduce(
    (sum, d) => sum + (d.totalAmount || 0),
    0,
  )

  return (
    <div className="monthly-sales-section">
      {/* 상단 요약 */}
      <div className="sales-summary-cards">
        <div className="sales-card">
          <h4>이번 달 총 매출</h4>
          <p>{monthTotal.toLocaleString()}원</p>
        </div>
        <div className="sales-card">
          <h4>일별 매출 집계</h4>
          <p>{dailySales.length}일치 데이터</p>
        </div>
        <div className="sales-card">
          <h4>판매 내역 건수</h4>
          <p>{salesItems.length}건</p>
        </div>
        <div className="sales-card">
          <h4>TOP 판매 상품</h4>
          <p>{topProducts.length}개</p>
        </div>
      </div>

      {/* 일별 매출 테이블 */}
      <section className="sales-block">
        <h4>일별 매출</h4>
        {dailySales.length === 0 ? (
          <p>일별 매출 데이터가 없습니다.</p>
        ) : (
          <table className="sales-table">
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
                  {/* DailySalesDto: salesDate / totalAmount / orderCount 기준으로 사용 */}
                  <td>{d.salesDate}</td>
                  <td>{(d.totalAmount || 0).toLocaleString()}원</td>
                  <td>{d.orderCount || 0}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 이번달 판매 내역 */}
      <section className="sales-block">
        <h4>이번 달 판매 내역</h4>
        {salesItems.length === 0 ? (
          <p>판매 내역이 없습니다.</p>
        ) : (
          <table className="sales-table">
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
              {salesItems.map((item, idx) => (
                <tr key={idx}>
                  {/* SalesItemDto는 아래 필드 기준으로 맞춰두면 좋아:
                      orderDate, orderId, productName, quantity, amount */}
                  <td>{item.orderDate}</td>
                  <td>{item.orderId}</td>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{(item.amount || 0).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 가장 많이 팔린 상품 */}
      <section className="sales-block">
        <h4>가장 많이 팔린 상품 TOP {topProducts.length}</h4>
        {topProducts.length === 0 ? (
          <p>TOP 상품 데이터가 없습니다.</p>
        ) : (
          <table className="sales-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>판매 수량</th>
                <th>매출 금액</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, idx) => (
                <tr key={idx}>
                  {/* TopProductDto: productName, totalQuantity, totalAmount 기준 */}
                  <td>{p.productName}</td>
                  <td>{p.totalQuantity}</td>
                  <td>{(p.totalAmount || 0).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}