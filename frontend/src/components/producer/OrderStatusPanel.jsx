// src/components/producer/OrderStatusPanel.jsx
const STATUS_FLOW = ['READY', 'SHIPPING', 'DELIVERED']

const STATUS_LABEL = {
  READY: '배송 준비',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
}

export default function OrderStatusPanel({ currentStatus, onChangeStatus }) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus)

  const canGoNext = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1

  const handleNext = () => {
    if (!canGoNext) return
    const nextStatus = STATUS_FLOW[currentIndex + 1]
    onChangeStatus(nextStatus)
  }

  return (
    <div className="order-status-panel">
      <h3>배송 상태</h3>
      <div className="status-steps">
        {STATUS_FLOW.map((status, index) => (
          <div
            key={status}
            className={
              'status-step ' +
              (index <= currentIndex ? 'active ' : '') +
              (index < currentIndex ? 'done ' : '')
            }
          >
            <span className="status-step-index">{index + 1}</span>
            <span className="status-step-label">{STATUS_LABEL[status]}</span>
          </div>
        ))}
      </div>

      {canGoNext ? (
        <button type="button" onClick={handleNext}>
          다음 단계로 변경 (
          {STATUS_LABEL[STATUS_FLOW[currentIndex + 1]]})
        </button>
      ) : (
        <p>이미 배송이 완료된 주문입니다.</p>
      )}
    </div>
  )
}