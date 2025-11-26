// src/pages/producer/ProducerOrderDetailPage.jsx
import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OrderStatusPanel from '../../components/producer/OrderStatusPanel.jsx'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'
import styled from 'styled-components'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ProducerOrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // =========================
  // 주문 상세 조회
  // =========================
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

        const data = res.data

        // 응답이 List<ProducerOrderItemDto> 인 경우
        if (Array.isArray(data)) {
          if (data.length === 0) {
            setError('해당 주문의 주문 상품이 없습니다.')
            setOrder(null)
            return
          }

          const first = data[0]

          const items = data.map((item) => ({
            orderItemId: item.orderItemId,
            productId: item.productId,
            productName: item.productName,
            unitName: item.unitName || '',
            quantity: item.quantity,
            unitPrice: item.priceAtOrder,
            lineTotalAmount: item.lineTotalAmount,
            deliveryStatus: item.deliveryStatus,
            carrierName: item.carrierName,
            trackingNumber: item.trackingNumber,
          }))

          const productTotalAmount = items.reduce(
            (sum, it) => sum + (it.lineTotalAmount || 0),
            0,
          )

          const normalizedOrder = {
            orderId: first.orderId,
            orderNo: String(first.orderId),
            orderDate: first.orderDate
              ? String(first.orderDate).split('T')[0]
              : '',
            status: first.orderStatus,
            buyerName: first.receiverName,
            buyerPhone: first.receiverPhone,
            address: '',
            deliveryMessage: '',
            productTotalAmount,
            deliveryFee: 0,
            orderTotalAmount: productTotalAmount,
            items,
          }

          setOrder(normalizedOrder)
        } else {
          // 이미 우리가 기대하는 형태
          setOrder(data)
        }
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

  // =========================
  // 주문 상태 변경 (상단 패널)
  // =========================
  const handleChangeOrderStatus = async (nextStatus) => {
    if (!order) return

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      setSaving(true)

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
      alert('주문 상태가 변경되었습니다.')
    } catch (err) {
      console.error('주문 상태 변경 에러:', err)
      alert('주문 상태를 변경하는 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // 개별 상품 배송 상태 변경
  // =========================
  const handleChangeDeliveryStatus = async (orderItemId, nextStatus) => {
    if (!order) return

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      setSaving(true)

      await axios.patch(
        `${API_BASE}/api/producer/orders/${orderItemId}/delivery-status`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
          params: {
            deliveryStatus: nextStatus,
          },
        },
      )

      setOrder((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.orderItemId === orderItemId
            ? { ...item, deliveryStatus: nextStatus }
            : item,
        ),
      }))
      alert('배송 상태가 변경되었습니다.')
    } catch (err) {
      console.error('배송 상태 변경 에러:', err)
      alert('배송 상태를 변경하는 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // 렌더링 준비
  // =========================
  if (loading) return <div>주문 정보를 불러오는 중입니다...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!order) return <div>주문 정보를 찾을 수 없습니다.</div>

  const items = order.items || []
  const itemsTotal =
    order.productTotalAmount ??
    items.reduce((sum, item) => sum + (item.lineTotalAmount || 0), 0)
  const deliveryFee = order.deliveryFee ?? 0
  const totalAmount = order.orderTotalAmount ?? itemsTotal + deliveryFee

  const DELIVERY_STATUS_OPTIONS = [
    '배송준비',
    '출고완료',
    '배송중',
    '배송완료',
    '반송요청',
  ]

  return (
    <Page>
      <BackButton
        type="button"
        onClick={() => navigate('/producer/orders')}
        disabled={saving}
      >
        ← 주문 목록으로
      </BackButton>

      <HeaderRow>
        <div>
          <Title>주문 처리</Title>
          <MetaRow>
            <MetaItem>주문번호: {order.orderNo}</MetaItem>
            <MetaItem>주문일자: {order.orderDate}</MetaItem>
          </MetaRow>
        </div>
      </HeaderRow>

      <Card>
        <MainGrid>
          {/* 왼쪽 정보 영역 */}
          <InfoColumn>
            <InfoBlock>
              <InfoTitle>구매자 정보</InfoTitle>
              <InfoRow>
                <Label>이름</Label>
                <Value>{order.buyerName}</Value>
              </InfoRow>
              <InfoRow>
                <Label>연락처</Label>
                <Value>{order.buyerPhone}</Value>
              </InfoRow>
            </InfoBlock>

            <InfoBlock>
              <InfoTitle>배송지 정보</InfoTitle>
              <InfoRowFull>
                <Value>
                  {order.address || '배송지 정보가 없습니다.'}
                </Value>
              </InfoRowFull>
              {order.deliveryMessage && (
                <InfoRowFull>
                  <SubValue>요청사항: {order.deliveryMessage}</SubValue>
                </InfoRowFull>
              )}
            </InfoBlock>

            <InfoBlock>
              <InfoTitle>결제 정보</InfoTitle>
              <InfoRow>
                <Label>상품 합계</Label>
                <Value>{itemsTotal.toLocaleString()}원</Value>
              </InfoRow>
              <InfoRow>
                <Label>배송비</Label>
                <Value>{deliveryFee.toLocaleString()}원</Value>
              </InfoRow>
              <InfoRow className="total">
                <Label>총 결제 금액</Label>
                <StrongValue>{totalAmount.toLocaleString()}원</StrongValue>
              </InfoRow>
            </InfoBlock>
          </InfoColumn>

          {/* 오른쪽 상품 영역 */}
          <ItemsColumn>
            <InfoTitle>주문 상품</InfoTitle>
            {items.length === 0 ? (
              <EmptyText>주문 상품이 없습니다.</EmptyText>
            ) : (
              <ItemsTable>
                <thead>
                  <tr>
                    <th className="col-product">상품명</th>
                    <th>규격</th>
                    <th>수량</th>
                    <th>단가</th>
                    <th>금액</th>
                    <th>배송 상태</th>
                    <th>택배사</th>
                    <th>송장번호</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.orderItemId}>
                      <td className="col-product">
                        <ProductName>{item.productName}</ProductName>
                      </td>
                      <td>{item.unitName}</td>
                      <td>{item.quantity}</td>
                      <td className="num">
                        {item.unitPrice
                          ? item.unitPrice.toLocaleString()
                          : '-'}
                        원
                      </td>
                      <td className="num">
                        {item.lineTotalAmount
                          ? item.lineTotalAmount.toLocaleString()
                          : '-'}
                        원
                      </td>
                      <td>
                        <DeliverySelect
                          value={
                            item.deliveryStatus ||
                            DELIVERY_STATUS_OPTIONS[0]
                          }
                          onChange={(e) =>
                            handleChangeDeliveryStatus(
                              item.orderItemId,
                              e.target.value,
                            )
                          }
                          disabled={saving}
                        >
                          {DELIVERY_STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </DeliverySelect>
                      </td>
                      <td>{item.carrierName || '-'}</td>
                      <td>{item.trackingNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </ItemsTable>
            )}
          </ItemsColumn>
        </MainGrid>
      </Card>
    </Page>
  )
}

/* =========================
   styled-components
   ========================= */

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 40px;
`

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
`

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
`

const MetaRow = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
`

const MetaItem = styled.span``

const HeaderStatus = styled.div`
  min-width: 260px;
`

const Card = styled.section`
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  padding: 24px 28px;
`

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
`

const InfoColumn = styled.div`
  border-right: 1px solid #f3f4f6;
  padding-right: 24px;
`

const InfoBlock = styled.div`
  & + & {
    margin-top: 20px;
  }
`

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
`

const InfoRow = styled.p`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin: 4px 0;

  &.total {
    margin-top: 8px;
  }
`

const InfoRowFull = styled.p`
  font-size: 14px;
  margin: 4px 0;
`

const Label = styled.span`
  display: inline-block;
  min-width: 70px;
  color: #6b7280;
`

const Value = styled.span`
  color: #111827;
`

const StrongValue = styled.span`
  color: #111827;
  font-weight: 700;
  font-size: 15px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: #6b7280;
`

const ItemsColumn = styled.div``

const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  padding: 20px 0;
`

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 10px;

  thead th {
    padding: 10px 8px;
    background: #f9fafb;
    color: #6b7280;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
  }

  tbody td {
    padding: 10px 8px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }

  td.num {
    text-align: right;
  }

  .col-product {
    width: 180px;
  }
`

const ProductName = styled.div`
  font-weight: 500;
`

const DeliverySelect = styled.select`
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  background: #ffffff;
`