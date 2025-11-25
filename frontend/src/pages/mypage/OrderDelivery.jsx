// src/pages/mypage/OrderDelivery.jsx
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function OrderDelivery() {
  const { orderId } = useParams();              // URL에서 주문번호 가져오기
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 로그인 안 돼 있으면 막기 (필요 없으면 이 부분 제거해도 됨)
    if (!auth?.accessToken && !auth?.token && !localStorage.getItem("accessToken")) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem("accessToken");

    const fetchDelivery = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API_BASE}/api/orders/${orderId}/delivery`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: token.startsWith("Bearer ")
                      ? token
                      : `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        // 204 No Content 같은 경우 대비
        if (!res.data) {
          setDelivery(null);
        } else {
          setDelivery(res.data);
        }
      } catch (err) {
        console.error("배송 정보 조회 에러:", err);
        if (err.response?.status === 401) {
          setError("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        } else if (err.response?.status === 404 || err.response?.status === 204) {
          setDelivery(null);
          setError("");
        } else {
          setError("배송 정보를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchDelivery();
    }
  }, [orderId, auth]);

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString("ko-KR");
    } catch {
      return value;
    }
  };

  const renderStatusLabel = (status) => {
    if (!status) return "배송 정보 없음";

    switch (status) {
      case "READY":
        return "배송 준비중";
      case "SHIPPED":
        return "출고 완료";
      case "IN_TRANSIT":
        return "배송중";
      case "DELIVERED":
        return "배송 완료";
      case "RETURNED":
        return "반송 처리";
      default:
        return status;
    }
  };

  const renderStatusColor = (status) => {
    switch (status) {
      case "READY":
        return "#888";
      case "SHIPPED":
        return "#0d6efd";
      case "IN_TRANSIT":
        return "#198754";
      case "DELIVERED":
        return "#20c997";
      case "RETURNED":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  return (
    <PageWrapper>
      <Inner>
        <HeaderRow>
          <Title>배송 정보</Title>
          <BackButton type="button" onClick={() => navigate(-1)}>
            ← 이전으로
          </BackButton>
        </HeaderRow>

        {loading && <InfoText>배송 정보를 불러오는 중입니다...</InfoText>}

        {!loading && error && <ErrorBox>{error}</ErrorBox>}

        {!loading && !error && !delivery && (
          <EmptyBox>
            <p>등록된 배송 정보가 아직 없습니다.</p>
            <span>판매자가 출고 처리하면 여기에서 배송 정보를 확인할 수 있어요.</span>
          </EmptyBox>
        )}

        {!loading && !error && delivery && (
          <Card>
            <Row>
              <Label>주문 번호</Label>
              <Value>#{delivery.orderId ?? orderId}</Value>
            </Row>

            <Row>
              <Label>배송 상태</Label>
              <StatusBadge $color={renderStatusColor(delivery.deliveryStatus)}>
                {renderStatusLabel(delivery.deliveryStatus)}
              </StatusBadge>
            </Row>

            <Divider />

            <Row>
              <Label>택배사</Label>
              <Value>{delivery.carrierName || "-"}</Value>
            </Row>

            <Row>
              <Label>송장번호</Label>
              <Value>{delivery.trackingNumber || "-"}</Value>
            </Row>

            <Divider />

            <Row>
              <Label>출고 일시</Label>
              <Value>{formatDateTime(delivery.shippedAt)}</Value>
            </Row>

            <Row>
              <Label>배송 예상 도착일</Label>
              <Value>{formatDateTime(delivery.expectedDeliveryAt)}</Value>
            </Row>

            <Row>
              <Label>배송 완료 일시</Label>
              <Value>{formatDateTime(delivery.deliveredAt)}</Value>
            </Row>
          </Card>
        )}
      </Inner>
    </PageWrapper>
  );
}

/* styled-components */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 60vh;
  display: flex;
  justify-content: center;
  padding: 40px 16px;
  background-color: #f8f9fa;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 720px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
`;

const BackButton = styled.button`
  border: none;
  background: transparent;
  font-size: 0.95rem;
  cursor: pointer;
  color: #666;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background-color: #e9ecef;
  }
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  width: 140px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
`;

const Value = styled.div`
  flex: 1;
  font-size: 0.95rem;
  color: #212529;
  word-break: break-all;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background-color: ${({ $color }) => $color || "#6c757d"};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e9ecef;
  margin: 16px 0;
`;

const InfoText = styled.p`
  font-size: 0.95rem;
  color: #666;
`;

const ErrorBox = styled.div`
  background-color: #fff5f5;
  border: 1px solid #ffc9c9;
  color: #c92a2a;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
`;

const EmptyBox = styled.div`
  background-color: #fff;
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  border: 1px dashed #ced4da;
  color: #555;

  p {
    margin: 0 0 4px;
    font-weight: 600;
  }

  span {
    font-size: 0.85rem;
  }
`;