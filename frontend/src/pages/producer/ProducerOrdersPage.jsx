// src/pages/producer/ProducerOrdersPage.jsx
import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ProducerOrdersPage() {
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)

  const [tab, setTab] = useState('NEW') // 'NEW' | 'COMPLETED' | 'SALES'
  const [newOrders, setNewOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [monthlySales, setMonthlySales] = useState([])

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

        // 신규 주문
        const [newRes, completedRes, salesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/producer/orders`, {
            headers: commonHeaders,
            params: { status: 'NEW' },
          }),
          axios.get(`${API_BASE}/api/producer/orders`, {
            headers: commonHeaders,
            params: { status: 'COMPLETED' },
          }),
          axios.get(`${API_BASE}/api/producer/sales/monthly`, {
            headers: commonHeaders,
          }),
        ])

        setNewOrders(newRes.data || [])
        setCompletedOrders(completedRes.data || [])
        setMonthlySales(salesRes.data || [])
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
          className={tab === 'NEW' ? 'active' : ''}
          onClick={() => setTab('NEW')}
        >
          신규 주문
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
      {!loading && error && <p>{error}</p>}

      {!loading && !error && tab === 'NEW' && (
        <section>
          <h3>신규 주문 리스트</h3>
          <OrderTable orders={newOrders} onClickDetail={handleGoDetail} />
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
          <h3>월별 매출 현황</h3>
          <MonthlySalesTable monthlySales={monthlySales} />
        </section>
      )}
    </div>
  )
}

function OrderTable({ orders, onClickDetail }) {
  if (!orders.length) return <p>주문이 없습니다.</p>

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
            <td>{o.totalAmount.toLocaleString()}원</td>
            <td>{o.status}</td>
            <td>
              <button onClick={() => onClickDetail(o.orderId)}>주문 처리</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MonthlySalesTable({ monthlySales }) {
  if (!monthlySales.length) return <p>매출 데이터가 없습니다.</p>

  return (
    <table className="sales-table">
      <thead>
        <tr>
          <th>월</th>
          <th>매출 금액</th>
        </tr>
      </thead>
      <tbody>
        {monthlySales.map((m) => (
          <tr key={m.month}>
            <td>{m.month}</td>
            <td>{m.amount.toLocaleString()}원</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}