// src/pages/producer/ProducerOrderDetailPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OrderStatusPanel from '../../components/producer/OrderStatusPanel.jsx'

export default function ProducerOrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    // TODO: /api/producer/orders/:orderId 로 상세 조회
    // 더미 데이터
    setOrder({
      id: orderId,
      orderNo: '202511170001',
      orderDate: '2025-11-17',
      status: 'READY',
      buyerName: '김철수',
      buyerPhone: '010-1111-2222',
      address: '서울시 어딘가 123',
      totalAmount: 35000,
      deliveryFee: 3000,
      items: [
        {
          id: 1,
          name: '사과 5kg',
          option: '특등급',
          qty: 1,
          price: 25000,
        },
        {
          id: 2,
          name: '배 3kg',
          option: '상등급',
          qty: 1,
          price: 10000,
        },
      ],
    })
  }, [orderId])

  const handleChangeStatus = async (nextStatus) => {
    // TODO: PATCH /api/producer/orders/:orderId/status
    // { status: nextStatus }
    // 성공 후 상태 업데이트
    setOrder((prev) => ({
      ...prev,
      status: nextStatus,
    }))
  }

  if (!order) return <div>로딩중...</div>

  const itemsTotal = order.items.reduce(
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
          <p>상품 합계: {itemsTotal.toLocaleString()}원</p>
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
              {order.items.map((item) => (
                <tr key={item.id}>
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