import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGroupDealDetail,
} from "../../api/groupDealApi";
import BarProgress from "./components/BarProgress";
import GroupDealDetailTabs from "../../layouts/GroupDealDetailTabs";

function formatPrice(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function formatDateRange(start, end) {
  if (!start && !end) return "일정 미정";
  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("ko-KR") : "?";
  if (start && end) return `${fmt(start)} ~ ${fmt(end)}`;
  if (start) return `${fmt(start)} 이후`;
  return `${fmt(end)} 까지`;
}

function formatRemainingTime(endAt) {
  if (!endAt) return "마감일 미정";

  const end = new Date(endAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return "마감";

  const diffSec = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSec / (60 * 60 * 24));
  const hours = Math.floor((diffSec % (60 * 60 * 24)) / (60 * 60));

  if (days > 0) return `D-${days} · ${hours}시간 남음`;
  if (hours > 0) return `오늘 마감 · ${hours}시간 남음`;
  return "곧 마감";
}

const GroupDealDetailPage = () => {
  const { groupDealId } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");

      // ✅ groupDealId가 숫자가 아니면 바로 에러 처리 ("/group-deals/manage" 같은 경우 방지)
      if (!groupDealId || !/^\d+$/.test(groupDealId)) {
        setError("잘못된 접근입니다. 유효하지 않은 공동구매 ID입니다.");
        setDeal(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getGroupDealDetail(groupDealId);
        if (!data) {
          setError("공동구매 정보를 찾을 수 없습니다.");
        } else {
          // productName 보정 (없으면 title 사용)
          const normalized = { ...data };
          normalized.productName = data.productName || data.title;

          setDeal(normalized);
        }
      } catch (e) {
        console.error(e);
        setError("공동구매 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [groupDealId]);

  const handleChangeQty = (next) => {
    let n = Number(next);
    if (!Number.isFinite(n)) n = 1;
    if (n < 1) n = 1;

    if (deal?.perUserLimitQty && deal.perUserLimitQty > 0) {
      if (n > deal.perUserLimitQty) n = deal.perUserLimitQty;
    }
    setQuantity(n);
  };

   const handleJoinAndGoCart = async () => {

    if (!deal) return;
    if (joining) return;
    if (quantity <= 0) {
      window.alert("수량을 1개 이상 선택해주세요.");
      return;
    }

    const shipping = deal.dealPrice*quantity>=40000 ? 0 : 3000;

    navigate(`/group-deals/orders/${groupDealId}`, {
      state: {
        fromGroupDeal: true,
        shipping: shipping,
        quantity: quantity
      }
    });


  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <p className="text-muted text-center py-5">불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <div className="alert alert-danger my-5 text-center">{error}</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <p className="text-muted text-center py-5">
          공동구매 정보를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  const mainImage =
    deal.images && deal.images.length > 0
      ? deal.images[0].imageUrl
      : null;

  const remainingText = formatRemainingTime(deal.endAt);

  return (
    <div
      className="container"
      style={{
        marginTop: 140,
        marginBottom: 80,
        maxWidth: 1100,
      }}
    >
      <div className="row g-5">
        {/* 이미지 영역 */}
        <div className="col-12 col-lg-6">
          <div
            style={{
              width: "100%",
              paddingTop: "80%",
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#f3f4f6",
            }}
          >
            {mainImage && (
              <img
                src={mainImage}
                alt={deal.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
            {!mainImage && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: "0.9rem",
                }}
              >
                이미지 준비중
              </div>
            )}
          </div>
        </div>

        {/* 우측 정보 영역 */}
        <div className="col-12 col-lg-6">
          {/* 제목/부제 */}
          <h2 style={{ fontWeight: 800, marginBottom: 8 }}>{deal.title}</h2>
          {deal.subTitle && (
            <div
              style={{
                fontSize: "0.95rem",
                color: "#6b7280",
                marginBottom: 12,
              }}
            >
              {deal.subTitle}
            </div>
          )}

          {/* 가격 영역 */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 8,
            }}
          >
            {deal.discountRate != null && (
              <span
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: "#eb1c1cff",
                }}
              >
                {Math.round(deal.discountRate)}%
              </span>
            )}
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#166534",
              }}
            >
              {formatPrice(deal.dealPrice)}
            </span>
            {deal.originPrice != null && (
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#9ca3af",
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(deal.originPrice)}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "#4b5563",
              marginBottom: 20,
            }}
          >
            생산자 최소 마진을 보장하면서, 소비자는 시세보다 합리적인 가격으로
            구매할 수 있는 공동구매입니다.
          </div>

          {/* 진행률 바 */}
          <BarProgress
            currentQuantity={deal.currentQuantity || 0}
            minMemberCount={deal.minMemberCount || 0}
          />

          {/* 모집/발송 정보 */}
          <div
            className="border rounded-3 p-3 mb-3"
            style={{ backgroundColor: "#e5eee8", borderColor: "#b7c8be" }}
          >
            <div className="d-flex justify-content-between mb-1">
              <span className="small text-muted">모집 상태</span>
              <span
                className="small fw-bold"
                style={{
                  color:
                    deal.status?.toUpperCase() === "OPEN"
                      ? "#16a34a"
                      : "#9ca3af",
                }}
              >
                {deal.status === "OPEN" ? "모집중" : deal.status}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="small text-muted">모집 수량</span>
              <span className="small">
                현재{" "}
                <strong>
                  {deal.currentQuantity ?? 0} / {deal.minMemberCount ?? 0}
                </strong>{" "}
                개
              </span>
            </div>
            {deal.maxMemberCount && (
              <div className="d-flex justify-content-between mb-1">
                <span className="small text-muted">최대 수량</span>
                <span className="small">
                  최대 <strong>{deal.maxMemberCount}</strong> 개
                </span>
              </div>
            )}
            {deal.perUserLimitQty && (
              <div className="d-flex justify-content-between mb-1">
                <span className="small text-muted">1인당 제한</span>
                <span className="small">
                  1인당 최대{" "}
                  <strong>{deal.perUserLimitQty}</strong> 개까지 참여 가능
                </span>
              </div>
            )}
            <div className="d-flex justify-content-between">
              <span className="small text-muted">마감까지</span>
              <span
                className="small fw-semibold"
                style={{
                  color:
                    remainingText === "마감" ? "#9ca3af" : "#16a34a",
                }}
              >
                {remainingText}
              </span>
            </div>
          </div>

          {/* 발송 정보 */}
          <div
            className="border rounded-3 p-3 mb-3"
            style={{ backgroundColor: "#eff4ef", borderColor: "#b7c8be" }}
          >
            <div className="small text-muted mb-1">발송 예정일</div>
            <div className="small fw-semibold mb-2">
              {formatDateRange(
                deal.shippingStartDate,
                deal.shippingEndDate
              )}
            </div>
            <div className="small text-muted">
              수확 및 물류 사정에 따라 1~2일 정도 변동될 수 있습니다.
            </div>
          </div>

          {/* 수량 + 버튼 */}
          <div className="d-flex align-items-center gap-3 mb-3">
            <div>
              <div className="small text-muted mb-1">상품 수량</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "999px",
                  border: "1px solid #cbd5ce",
                  padding: "6px 14px",
                  minWidth: 120,
                  backgroundColor: "#f8faf8",
                }}
              >
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "1.1rem",
                    lineHeight: 1,
                    color: "#6b7c6f",
                  }}
                  onClick={() => handleChangeQty(quantity - 1)}
                  disabled={joining}
                >
                  -
                </button>
                <span
                  style={{
                    fontSize: "1rem",
                    color: "#1b2f25",
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "1.1rem",
                    lineHeight: 1,
                    color: "#6b7c6f",
                  }}
                  onClick={() => handleChangeQty(quantity + 1)}
                  disabled={joining}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-grow-1 text-end">
              <button
                type="button"
                className="btn btn-lg"
                style={{
                  borderRadius: "999px",
                  background: "#3f6b57",
                  border: "none",
                  padding: "13px 30px",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "white",
                  whiteSpace: "nowrap",
                }}
                onClick={handleJoinAndGoCart}
                disabled={joining || deal.status?.toUpperCase() !== "OPEN"}
              >
                {joining ? "공동구매 참여 중..." : "바로구매"}
              </button>
            </div>
          </div>

          {/* 상세 설명 */}
          {deal.detail && (
            <div className="mt-3">
              <h5 className="fw-bold mb-2">상품 소개</h5>
              <p
                style={{
                  whiteSpace: "pre-line",
                  fontSize: "0.95rem",
                  color: "#374151",
                }}
              >
                {deal.detail}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 탭 컴포넌트: deal 객체(이미지 경로 포함)를 그대로 전달 */}
      <div style={{ marginTop: 32 }}>
        <GroupDealDetailTabs deal={deal} />
      </div>
    </div>
  );
};

export default GroupDealDetailPage;
