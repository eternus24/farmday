// src/pages/producer/ProducerOrderDetailPage.jsx
import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OrderStatusPanel from '../../components/producer/OrderStatusPanel.jsx'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ProducerOrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)

  const [order, setOrder] = useState(null)
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

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await axios.get(
          `${API_BASE}/api/producer/orders/${orderId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token.startsWith('Bearer ')
                ? token
                : `Bearer ${token}`,
            },
          },
        )

        setOrder(res.data)
      } catch (err) {
        console.error('생산자 주문 상세 조회 에러:', err)
        setError('주문 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, auth])

  const handleChangeStatus = async (nextStatus) => {
    if (!order) return

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    try {
      await axios.patch(
        `${API_BASE}/api/producer/orders/${orderId}/status`,
        { status: nextStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
        },
      )

      setOrder((prev) => ({
        ...prev,
        status: nextStatus,
      }))
    } catch (err) {
      console.error('주문 상태 변경 에러:', err)
      alert('주문 상태 변경 중 오류가 발생했습니다.')
    }
  }

  if (loading) return <div>주문 정보를 불러오는 중입니다...</div>
  if (error) return <div>{error}</div>
  if (!order) return <div>주문 정보가 없습니다.</div>

  const itemsTotal = order.items?.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  )

  return (
    <div className="producer-order-detail-page">
      <button type="button" onClick={() => navigate(-1)}>
        ← 목록으로
      </button>

      <header className="order-header">
        <h2>주문 처리</h2>
        <p>주문번호: {order.orderNo}</p>
        <p>주문일자: {order.orderDate}</p>
      </header>

      <section className="order-layout">
        {/* 좌측: 구매자/배송/결제 정보 */}
        <div className="order-info-panel">
          <h3>구매자 정보</h3>
          <p>이름: {order.buyerName}</p>
          <p>연락처: {order.buyerPhone}</p>

          <h3>배송지 정보</h3>
          <p>{order.address}</p>

          <h3>결제 정보</h3>
          <p>상품 합계: {itemsTotal?.toLocaleString()}원</p>
          <p>배송비: {order.deliveryFee.toLocaleString()}원</p>
          <p>
            총 결제 금액:{' '}
            {(itemsTotal + order.deliveryFee).toLocaleString()}원
          </p>
        </div>

        {/* 중앙: 상품 목록 */}
        <div className="order-items-panel">
          <h3>주문 상품</h3>
          <table className="order-items-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>옵션</th>
                <th>수량</th>
                <th>가격</th>
                <th>소계</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.orderItemId}>
                  <td>{item.name}</td>
                  <td>{item.option}</td>
                  <td>{item.qty}</td>
                  <td>{item.price.toLocaleString()}원</td>
                  <td>{(item.price * item.qty).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 우측: 상태 변경 패널 */}
        <div className="order-status-panel-wrap">
          <OrderStatusPanel
            currentStatus={order.status}
            onChangeStatus={handleChangeStatus}
          />
        </div>
      </section>
    </div>
  )
}