// src/pages/producer/ProducerOrderDetailPage.jsx
import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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

const DELIVERY_STATUS_OPTIONS = [
  '배송준비',
  '출고완료',
  '배송중',
  '배송완료',
  '환불요청',
  '배송취소',
]

export default function ProducerOrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useContext(AuthContext)

  // 환불내역 탭에서 들어온 경우 플래그
  const isRefundMode = location.state?.fromRefund === true

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // 개별 택배사 / 송장번호 임시 입력값
  const [deliveryEdits, setDeliveryEdits] = useState({})

  // ✅ 일괄 배송정보 입력값 (헤더에서 사용하는 값)
  const [bulkDeliveryInfo, setBulkDeliveryInfo] = useState({
    carrierName: '',
    trackingNumber: '',
  })

  // 개별 항목용 "기타 택배사" 모달
  const [customCarrierModal, setCustomCarrierModal] = useState({
    open: false,
    orderItemId: null,
    tempValue: '',
  })

  // ✅ 헤더(일괄 처리용) "기타 택배사" 모달
  const [bulkCarrierModal, setBulkCarrierModal] = useState({
    open: false,
    tempValue: '',
  })

  // =========================
  // 공통 헬퍼
  // =========================

  function getDisplayDeliveryStatus(item) {
    // 주문 상태 코드에 따른 강제 표시 우선
    if (item.orderStatus === 'B1') return '환불요청'
    if (item.orderStatus === 'R1') return '환불완료'
    if (item.orderStatus === 'E2') return '환불불가'
    if (item.orderStatus === 'A2') return '배송완료'

    // DB에 저장된 배송상태가 있으면 그대로 사용
    if (item.deliveryStatus && item.deliveryStatus.trim() !== '') {
      return item.deliveryStatus.trim()
    }

    // 아무것도 없을 때만 기본값
    return '배송준비'
  }

  function isTemplateStatus(status) {
    return DELIVERY_STATUS_OPTIONS.includes(status)
  }

  function isDeliverySelectDisabled(item) {
    if (saving) return true
    const s = item.orderStatus
    if (s === 'A2' || s === 'B1' || s === 'R1' || s === 'E2') return true
    return false
  }

  function isInTransit(item) {
    return getDisplayDeliveryStatus(item) === '배송중'
  }

  // =========================
  // 개별 택배사 셀렉트 (기타 포함)
  // =========================
  const handleChangeCarrierSelect = (orderItemId, value) => {
    if (value === '__OTHER__') {
      // 기타 선택 → 개별 모달 오픈
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

  const handleCloseCustomCarrierModal = () => {
    setCustomCarrierModal({
      open: false,
      orderItemId: null,
      tempValue: '',
    })
  }

  // =========================
  // ✅ 헤더 쪽 "일괄 택배사" 셀렉트 (기타 포함)
  // =========================
  const handleChangeBulkCarrierSelect = (value) => {
    if (value === '__OTHER__') {
      setBulkCarrierModal({
        open: true,
        tempValue: '',
      })
    } else {
      setBulkDeliveryInfo((prev) => ({
        ...prev,
        carrierName: value,
      }))
    }
  }

  const handleConfirmBulkCarrier = () => {
    const name = bulkCarrierModal.tempValue.trim()
    if (!name) {
      alert('택배사 이름을 입력해 주세요.')
      return
    }

    setBulkDeliveryInfo((prev) => ({
      ...prev,
      carrierName: name,
    }))

    setBulkCarrierModal({
      open: false,
      tempValue: '',
    })
  }

  const handleCloseBulkCarrierModal = () => {
    setBulkCarrierModal({
      open: false,
      tempValue: '',
    })
  }

  // =========================
  // 주문 전체 배송 상태 일괄 변경
  // (단계형: 배송준비 → 출고완료 → 배송중(+택배/송장) → 배송완료)
  // =========================
  const handleBulkDeliveryStatus = async (nextStatus) => {
    if (!order) return

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    const isSetDeliveryInfo = nextStatus === '배송중'
    const carrierName = bulkDeliveryInfo.carrierName.trim()
    const trackingNumber = bulkDeliveryInfo.trackingNumber.trim()

    // 배송중으로 일괄 변경할 땐 택배사/송장 필수
    if (isSetDeliveryInfo && (!carrierName || !trackingNumber)) {
      alert('일괄 배송중 처리 시 택배사와 송장번호를 모두 입력해 주세요.')
      return
    }

    if (!window.confirm(`이 주문의 모든 상품을 '${nextStatus}'로 처리하시겠습니까?`)) {
      return
    }

    try {
      setSaving(true)

      // 1) 상태 일괄 변경 (백엔드 bulk API)
      await axios.patch(
        `${API_BASE}/api/producer/orders/${order.orderId}/delivery-status/bulk`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
          params: {
            deliveryStatus: nextStatus, // '출고완료' / '배송중' / '배송완료'
          },
        },
      )

      // 2) 프론트 상태 업데이트
      setOrder((prev) => {
        if (!prev) return prev

        const updatedItems = (prev.items || []).map((item) => {
          const displayStatus = getDisplayDeliveryStatus(item)

          // 환불 관련 상태는 일괄 변경에서 제외
          if (['환불요청', '환불완료', '환불불가'].includes(displayStatus)) {
            return item
          }

          return {
            ...item,
            deliveryStatus: nextStatus,
            orderStatus: nextStatus === '배송완료' ? 'A2' : item.orderStatus,
            // 배송중 + 일괄 배송정보 입력 시, 같이 세팅
            ...(isSetDeliveryInfo
              ? {
                  carrierName,
                  trackingNumber,
                }
              : {}),
          }
        })

        return {
          ...prev,
          items: updatedItems,
        }
      })

      // 3) 배송중 + 배송정보 같이 저장해야 하면 (개별 delivery-info API 호출)
      if (isSetDeliveryInfo) {
        const targetItems = (order.items || []).filter((item) => {
          const s = getDisplayDeliveryStatus(item)
          return !['환불요청', '환불완료', '환불불가'].includes(s)
        })

        await Promise.all(
          targetItems.map((item) =>
            axios.patch(
              `${API_BASE}/api/producer/orders/${item.orderItemId}/delivery-info`,
              { carrierName, trackingNumber },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: token.startsWith('Bearer ')
                    ? token
                    : `Bearer ${token}`,
                },
              },
            ),
          ),
        )
      }

      alert(`해당 주문의 모든 상품을 '${nextStatus}'로 처리했습니다.`)
    } catch (err) {
      console.error('주문 일괄 배송 상태 변경 에러:', err)
      alert('주문 전체 배송 상태를 변경하는 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
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
            orderStatus: item.orderStatus, // A1/A2/B1/R1/E2 등
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
  // 배송 상태 변경 (단건)
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
  // 환불 상태 변경 (환불내역 모드에서 사용)
  // =========================
  const handleChangeRefundStatus = async (orderItemId, nextStatusCode) => {
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
        `${API_BASE}/api/producer/orders/${orderItemId}/refund-status`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
          params: {
            refundStatus: nextStatusCode, // 'R1' 또는 'E2'
          },
        },
      )

      setOrder((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.orderItemId === orderItemId
            ? { ...item, orderStatus: nextStatusCode }
            : item,
        ),
      }))

      alert('환불 상태가 변경되었습니다.')
    } catch (err) {
      console.error('환불 상태 변경 에러:', err)
      alert('환불 상태를 변경하는 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // 택배사 / 송장번호 입력 관리 & 저장 (단건)
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

  // 🔹 환불 관련 아닌 애들만 대상으로 단계 계산
  const activeItems = items.filter((item) => {
    const s = getDisplayDeliveryStatus(item)
    return !['환불요청', '환불완료', '환불불가'].includes(s)
  })

  let bulkNextStatus = null
  let bulkButtonLabel = ''
  let showBulkInputs = false

  if (!isRefundMode && activeItems.length > 0) {
    const statuses = activeItems.map((item) => getDisplayDeliveryStatus(item))

    if (statuses.some((s) => s === '배송준비')) {
      // 1단계: 배송준비 → 전체 출고완료
      bulkNextStatus = '출고완료'
      bulkButtonLabel = '전체 출고완료'
      showBulkInputs = false
    } else if (statuses.some((s) => s === '출고완료')) {
      // 2단계: 출고완료 → 전체 배송중 + 일괄 택배/송장 입력
      bulkNextStatus = '배송중'
      bulkButtonLabel = '전체 배송중'
      showBulkInputs = true
    } else if (statuses.some((s) => s === '배송중')) {
      // 3단계: 배송중 → 전체 배송완료
      bulkNextStatus = '배송완료'
      bulkButtonLabel = '전체 배송완료'
      showBulkInputs = false
    } else {
      bulkNextStatus = null
    }
  }

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
              {isRefundMode && <MetaItem>모드: 환불 내역</MetaItem>}
            </MetaRow>
          </div>

          {/* 환불 모드 아님 + 단계 있을 때만 전체 변경 영역 노출 */}
          {!isRefundMode && bulkNextStatus && (
            <HeaderActions>
              {/* 2단계(배송중)일 때만 일괄 택배/송장 입력 노출 */}
              {showBulkInputs && (
                <BulkInfoGroup>
                  <BulkLabel>일괄 배송정보</BulkLabel>

                  {/* ✅ 택배사 셀렉트 (기존 방식 복원) */}
                  <BulkCarrierSelect
                    value={
                      bulkDeliveryInfo.carrierName &&
                      !CARRIER_OPTIONS.includes(bulkDeliveryInfo.carrierName)
                        ? bulkDeliveryInfo.carrierName
                        : bulkDeliveryInfo.carrierName || ''
                    }
                    onChange={(e) => handleChangeBulkCarrierSelect(e.target.value)}
                  >
                    <option value="">택배사 선택</option>
                    {bulkDeliveryInfo.carrierName &&
                      !CARRIER_OPTIONS.includes(bulkDeliveryInfo.carrierName) && (
                        <option value={bulkDeliveryInfo.carrierName}>
                          {bulkDeliveryInfo.carrierName}
                        </option>
                      )}
                    {CARRIER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="__OTHER__">기타(직접 입력)</option>
                  </BulkCarrierSelect>

                  {/* 송장번호 입력 */}
                  <BulkInput
                    type="text"
                    placeholder="송장번호"
                    value={bulkDeliveryInfo.trackingNumber}
                    onChange={(e) =>
                      setBulkDeliveryInfo((prev) => ({
                        ...prev,
                        trackingNumber: e.target.value,
                      }))
                    }
                  />
                </BulkInfoGroup>
              )}

              <BulkStatusButton
                type="button"
                disabled={saving}
                onClick={() => handleBulkDeliveryStatus(bulkNextStatus)}
              >
                {bulkButtonLabel}
              </BulkStatusButton>
            </HeaderActions>
          )}
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

                    {isRefundMode ? (
                      <th className="col-refund">환불 처리</th>
                    ) : (
                      <>
                        <th className="col-carrier">택배사</th>
                        <th className="col-tracking">송장번호</th>
                      </>
                    )}
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

                    const isRefundRequested =
                      item.orderStatus === 'B1' || displayStatus === '환불요청'
                    const isRefundCompleted = item.orderStatus === 'R1'

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

                        {/* 배송 상태 */}
                        <td className="col-status">
                          {isRefundMode ? (
                            <span>{displayStatus}</span>
                          ) : (
                            (['배송완료', '환불요청', '환불완료', '환불불가'].includes(
                              displayStatus,
                            ) ||
                              !isTemplateStatus(displayStatus)) ? (
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
                            )
                          )}
                        </td>

                        {/* 환불 모드 / 일반 모드에 따라 다른 칼럼 */}
                        {isRefundMode ? (
                          <td className="col-refund">
                            {isRefundRequested ? (
                              <RefundActionGroup>
                                <RefundButton
                                  type="button"
                                  disabled={saving}
                                  onClick={() =>
                                    handleChangeRefundStatus(
                                      item.orderItemId,
                                      'R1',
                                    )
                                  }
                                >
                                  환불완료
                                </RefundButton>
                                <RefundButton
                                  type="button"
                                  $danger
                                  disabled={saving}
                                  onClick={() =>
                                    handleChangeRefundStatus(
                                      item.orderItemId,
                                      'E2',
                                    )
                                  }
                                >
                                  환불불가
                                </RefundButton>
                              </RefundActionGroup>
                            ) : isRefundCompleted ? (
                              <RefundActionGroup>
                                <RefundButton type="button" disabled>
                                  환불완료
                                </RefundButton>
                              </RefundActionGroup>
                            ) : null}
                          </td>
                        ) : (
                          <>
                            {/* 개별 택배사 / 송장번호 */}
                            <td className="col-carrier">
                              {isInTransit(item) ? (
                                <CarrierSelect
                                  value={
                                    carrierValue &&
                                    !CARRIER_OPTIONS.includes(carrierValue)
                                      ? carrierValue
                                      : carrierValue || ''
                                  }
                                  onChange={(e) =>
                                    handleChangeCarrierSelect(
                                      item.orderItemId,
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">택배사 선택</option>
                                  {carrierValue &&
                                    !CARRIER_OPTIONS.includes(carrierValue) && (
                                      <option value={carrierValue}>
                                        {carrierValue}
                                      </option>
                                    )}
                                  {CARRIER_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                  <option value="__OTHER__">
                                    기타(직접 입력)
                                  </option>
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
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </ItemsTable>
            )}
          </ItemsColumn>
        </Card>

        {/* 개별 항목용 기타 택배사 모달 */}
        {customCarrierModal.open && !isRefundMode && (
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
                <ModalButton
                  type="button"
                  onClick={handleCloseCustomCarrierModal}
                >
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

        {/* ✅ 헤더 일괄용 기타 택배사 모달 */}
        {bulkCarrierModal.open && !isRefundMode && (
          <ModalOverlay onClick={handleCloseBulkCarrierModal}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalTitle>직접 택배사 입력</ModalTitle>
              <ModalBody>
                <ModalLabel>택배사 이름</ModalLabel>
                <ModalInput
                  type="text"
                  value={bulkCarrierModal.tempValue}
                  onChange={(e) =>
                    setBulkCarrierModal((prev) => ({
                      ...prev,
                      tempValue: e.target.value,
                    }))
                  }
                  placeholder="예: OO물류, 동네택배 등"
                />
              </ModalBody>
              <ModalActions>
                <ModalButton
                  type="button"
                  onClick={handleCloseBulkCarrierModal}
                >
                  취소
                </ModalButton>
                <ModalButtonPrimary
                  type="button"
                  onClick={handleConfirmBulkCarrier}
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
  justify-content: center;
  padding: 32px 16px 40px;
`

const Inner = styled.div`
  width: 100%;
  max-width: 830px;
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

  .col-product {
    width: 100px;
  }
  .col-qty {
    width: 50px;
    text-align: center;
  }
  .col-price {
    width: 80px;
    text-align: right;
  }
  .col-amount {
    width: 80px;
    text-align: right;
  }
  .col-status {
    width: 90px;
  }
  .col-carrier {
    width: 110px;
  }
  .col-tracking {
    width: 130px;
  }
  .col-refund {
    width: 150px;
  }
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
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const RefundActionGroup = styled.div`
  display: flex;
  gap: 6px;
`

const RefundButton = styled.button`
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid ${({ $danger }) => ($danger ? '#fecaca' : '#bbf7d0')};
  background: ${({ $danger }) => ($danger ? '#fee2e2' : '#dcfce7')};
  color: ${({ $danger }) => ($danger ? '#b91c1c' : '#047857')};
  cursor: pointer;

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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const BulkStatusButton = styled.button`
  padding: 8px 14px;
  font-size: 13px;
  border-radius: 999px;
  border: none;
  background: #10b981;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);

  &:hover {
    background: #059669;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    box-shadow: none;
  }
`

const BulkInfoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 8px;
`

const BulkLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
`

const BulkCarrierSelect = styled.select`
  width: 150px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
`

const BulkInput = styled.input`
  width: 130px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
`