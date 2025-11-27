// src/pages/producer/ProducerOrderDetailPage.jsx
import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'
import styled from 'styled-components'

const API_BASE = import.meta.env.VITE_API_BASE_URL

// 택배사 목록 (기타는 모달로 처리)
const CARRIER_OPTIONS = [
  'CJ대한통운',
  '로젠택배',
  '우체국택배',
  '한진택배',
  '롯데택배',
  '경동택배',
]

export default function ProducerOrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // 택배사 / 송장번호 임시 입력값
  const [deliveryEdits, setDeliveryEdits] = useState({})

  // 기타 선택 시 사용할 모달 상태
  const [customCarrierModal, setCustomCarrierModal] = useState({
    open: false,
    orderItemId: null,
    tempValue: '',
  })

  // 셀렉트에서 택배사 변경 처리 (기타 선택 포함)
  const handleChangeCarrierSelect = (orderItemId, value) => {
    if (value === '__OTHER__') {
      // 기타 선택 → 모달 오픈
      setCustomCarrierModal({
        open: true,
        orderItemId,
        tempValue: '',
      })
    } else {
      // 일반 택배사 선택
      handleChangeDeliveryField(orderItemId, 'carrierName', value)
    }
  }

  // 모달에서 확인 눌렀을 때
  const handleConfirmCustomCarrier = () => {
    const name = customCarrierModal.tempValue.trim()
    if (!name) {
      alert('택배사 이름을 입력해 주세요.')
      return
    }

    handleChangeDeliveryField(customCarrierModal.orderItemId, 'carrierName', name)

    setCustomCarrierModal({
      open: false,
      orderItemId: null,
      tempValue: '',
    })
  }

  // 모달 닫기
  const handleCloseCustomCarrierModal = () => {
    setCustomCarrierModal({
      open: false,
      orderItemId: null,
      tempValue: '',
    })
  }


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
            orderStatus: item.orderStatus,
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
            address: first.receiverAddr,
            deliveryMessage: '',
            productTotalAmount,
            deliveryFee: 0,
            orderTotalAmount: productTotalAmount,
            items: items,
          }

          setOrder(normalizedOrder)
        } else {
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
  // 배송 상태 변경
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
        items: prev.items.map((item) => {
          if (item.orderItemId !== orderItemId) return item
          const nextOrderStatus =
            nextStatus === '배송완료' ? 'A2' : item.orderStatus
          return {
            ...item,
            deliveryStatus: nextStatus,
            orderStatus: nextOrderStatus,
          }
        }),
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
  // 택배사 / 송장번호 입력 관리 & 저장
  // =========================
  const handleChangeDeliveryField = (orderItemId, field, value) => {
    setDeliveryEdits((prev) => ({
      ...prev,
      [orderItemId]: {
        ...(prev[orderItemId] || {}),
        [field]: value,
      },
    }))
  }

  const handleSaveDeliveryInfo = async (orderItemId) => {
    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    const edit = deliveryEdits[orderItemId] || {}
    const carrierName = edit.carrierName
    const trackingNumber = edit.trackingNumber

    if (!carrierName || !trackingNumber) {
      alert('택배사와 송장번호를 모두 입력해 주세요.')
      return
    }

    try {
      setSaving(true)

      await axios.patch(
        `${API_BASE}/api/producer/orders/${orderItemId}/delivery-info`,
        { carrierName, trackingNumber },
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
        items: prev.items.map((item) =>
          item.orderItemId === orderItemId
            ? { ...item, carrierName, trackingNumber }
            : item,
        ),
      }))

      alert('배송 정보가 저장되었습니다.')
    } catch (err) {
      console.error('배송 정보 저장 에러:', err)
      alert('배송 정보를 저장하는 중 오류가 발생했습니다.')
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
    '환불요청',
  ]

  const getDisplayDeliveryStatus = (item) => {
    switch (item.orderStatus) {
      case 'B1':
        return '환불요청'
      case 'A2':
        return '배송완료'
      default:
        return item.deliveryStatus || '배송준비'
    }
  }

  const isDeliverySelectDisabled = (item) => {
    if (saving) return true
    const s = item.orderStatus
    if (s === 'A2' || s === 'B1' || s === 'R1') return true
    return false
  }

  const isInTransit = (item) => getDisplayDeliveryStatus(item) === '배송중'

  return (
    <Page>
      <Inner>
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
          {/* 위쪽 정보영역 */}
          <InfoSection>
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
                <Value>{order.address || '배송지 정보가 없습니다.'}</Value>
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
          </InfoSection>

          <Divider />

          {/* 아래쪽 주문 상품 */}
          <ItemsColumn>
            <InfoTitle>주문 상품</InfoTitle>
            {items.length === 0 ? (
              <EmptyText>주문 상품이 없습니다.</EmptyText>
            ) : (
              <ItemsTable>
                <thead>
                  <tr>
                    <th className="col-product">상품명</th>
                    <th className="col-qty">수량</th>
                    <th className="col-price">단가</th>
                    <th className="col-amount">금액</th>
                    <th className="col-status">배송 상태</th>
                    <th className="col-carrier">택배사</th>
                    <th className="col-tracking">송장번호</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const edit = deliveryEdits[item.orderItemId] || {}
                    const displayStatus = getDisplayDeliveryStatus(item)

                    const carrierValue =
                      edit.carrierName ?? item.carrierName ?? ''
                    const trackingValue =
                      edit.trackingNumber ?? item.trackingNumber ?? ''

                    return (
                      <tr key={item.orderItemId}>
                        <td className="col-product">
                          <ProductName title={item.productName}>
                            {item.productName}
                          </ProductName>
                        </td>
                        <td className="col-qty center">{item.quantity}</td>
                        <td className="col-price num">
                          {item.unitPrice
                            ? item.unitPrice.toLocaleString()
                            : '-'}
                          원
                        </td>
                        <td className="col-amount num">
                          {item.lineTotalAmount
                            ? item.lineTotalAmount.toLocaleString()
                            : '-'}
                          원
                        </td>
                        <td className="col-status">
                          {['배송완료', '환불요청'].includes(displayStatus) ? (
                            <span>{displayStatus}</span>
                          ) : (
                            <DeliveryStatusSelect
                              value={displayStatus}
                              onChange={(e) =>
                                handleChangeDeliveryStatus(
                                  item.orderItemId,
                                  e.target.value,
                                )
                              }
                              disabled={isDeliverySelectDisabled(item)}
                            >
                              {DELIVERY_STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </DeliveryStatusSelect>
                          )}
                        </td>
                        <td className="col-carrier">
                          {isInTransit(item) ? (
                            <CarrierSelect
                              value={
                                carrierValue && !CARRIER_OPTIONS.includes(carrierValue)
                                  ? carrierValue // 직접 입력한 값
                                  : (carrierValue || '')
                              }
                              onChange={(e) =>
                                handleChangeCarrierSelect(item.orderItemId, e.target.value)
                              }
                            >
                              <option value="">택배사 선택</option>

                              {/* 직접 입력한 값이면 옵션으로도 보여주기 */}
                              {carrierValue && !CARRIER_OPTIONS.includes(carrierValue) && (
                                <option value={carrierValue}>{carrierValue}</option>
                              )}

                              {CARRIER_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}

                              {/* 기타 → 모달 띄우기용 */}
                              <option value="__OTHER__">기타(직접 입력)</option>
                            </CarrierSelect>
                          ) : (
                            item.carrierName || '-'
                          )}
                        </td>
                        <td className="col-tracking">
                          {isInTransit(item) ? (
                            <InputWithButton>
                              <DeliveryInput
                                type="text"
                                placeholder="송장번호 입력"
                                value={trackingValue}
                                onChange={(e) =>
                                  handleChangeDeliveryField(
                                    item.orderItemId,
                                    'trackingNumber',
                                    e.target.value,
                                  )
                                }
                              />
                              <SaveButton
                                type="button"
                                onClick={() =>
                                  handleSaveDeliveryInfo(item.orderItemId)
                                }
                                disabled={saving}
                              >
                                등록
                              </SaveButton>
                            </InputWithButton>
                          ) : (
                            item.trackingNumber || '-'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </ItemsTable>
            )}
          </ItemsColumn>
        </Card>

        {customCarrierModal.open && (
          <ModalOverlay onClick={handleCloseCustomCarrierModal}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalTitle>직접 택배사 입력</ModalTitle>
              <ModalBody>
                <ModalLabel>택배사 이름</ModalLabel>
                <ModalInput
                  type="text"
                  value={customCarrierModal.tempValue}
                  onChange={(e) =>
                    setCustomCarrierModal((prev) => ({
                      ...prev,
                      tempValue: e.target.value,
                    }))
                  }
                  placeholder="예: OO물류, 동네택배 등"
                />
              </ModalBody>
              <ModalActions>
                <ModalButton type="button" onClick={handleCloseCustomCarrierModal}>
                  취소
                </ModalButton>
                <ModalButtonPrimary
                  type="button"
                  onClick={handleConfirmCustomCarrier}
                >
                  적용
                </ModalButtonPrimary>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}
      </Inner>
    </Page>
  )
}

/* =========================
   styled-components
   ========================= */

const Page = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;     /* 가운데 정렬 */
  padding: 32px 16px 40px;     /* 좌우 여백은 조금만 */
`

/** 실제 내용 폭 */
const Inner = styled.div`
  width: 100%;
  max-width: 830px;            /* 👉 여기서 디테일 페이지 폭 조절 (원하면 860~960 사이로 조절해도 됨) */
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

const Card = styled.section`
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  padding: 24px 28px;
`

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const InfoBlock = styled.div``

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

const Divider = styled.hr`
  margin: 24px 0 16px;
  border: none;
  border-top: 1px solid #f3f4f6;
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
  table-layout: fixed;

  thead th {
    padding: 10px 8px;
    background: #f9fafb;
    color: #6b7280;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  tbody td {
    padding: 10px 8px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
    white-space: nowrap;
  }

  /* 최소 너비만 지정하고 자동으로 맞춰지게 */
  .col-product { width: 100px; }
  .col-qty { width: 50px; text-align: center; }
  .col-price { width: 80px; text-align: right; }
  .col-amount { width:80px; text-align: right; }
  .col-status { width: 85px; }
  .col-carrier { width: 100px; }
  .col-tracking { width: 130px; }
`

const ProductName = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const DeliveryStatusSelect = styled.select`
  width: 100%;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  background: #ffffff;
`

const CarrierSelect = styled.select`
  width: 100%;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  background: #ffffff;
`

const DeliveryInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
`

const InputWithButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`

const SaveButton = styled.button`
  flex-shrink: 0;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: none;
  background: #10b981;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap; /* 줄바꿈 방지 */

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`

const ModalBox = styled.div`
  width: 320px;
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
`

const ModalTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
`

const ModalBody = styled.div`
  margin-bottom: 14px;
`

const ModalLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
`

const ModalInput = styled.input`
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`

const ModalButton = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
`

const ModalButtonPrimary = styled.button`
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 999px;
  border: none;
  background: #10b981;
  color: #ffffff;
  cursor: pointer;
`