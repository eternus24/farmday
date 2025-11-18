// src/pages/producer/ProducerOrdersPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProducerOrdersPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('NEW') // 'NEW' | 'COMPLETED' | 'SALES'
  const [newOrders, setNewOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [monthlySales, setMonthlySales] = useState([])

  useEffect(() => {
    // TODO: API 연동
    setNewOrders([
      {
        id: 1,
        orderNo: '202511170001',
        orderDate: '2025-11-17',
        buyerName: '김철수',
        firstProductName: '사과 5kg',
        itemCount: 2,
        totalAmount: 35000,
        status: 'READY',
      },
    ])

    setCompletedOrders([
      {
        id: 2,
        orderNo: '202511160001',
        orderDate: '2025-11-16',
        buyerName: '이영희',
        firstProductName: '배 3kg',
        itemCount: 1,
        totalAmount: 25000,
        status: 'DELIVERED',
      },
    ])

    setMonthlySales([
      { month: '2025-09', amount: 1200000 },
      { month: '2025-10', amount: 2300000 },
      { month: '2025-11', amount: 1750000 },
    ])
  }, [])

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

      {tab === 'NEW' && (
        <section>
          <h3>신규 주문 리스트</h3>
          <OrderTable orders={newOrders} onClickDetail={handleGoDetail} />
        </section>
      )}

      {tab === 'COMPLETED' && (
        <section>
          <h3>완료된 판매 내역</h3>
          <OrderTable orders={completedOrders} onClickDetail={handleGoDetail} />
        </section>
      )}

      {tab === 'SALES' && (
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
          <tr key={o.id}>
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
              <button onClick={() => onClickDetail(o.id)}>주문 처리</button>
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