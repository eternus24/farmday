import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupDealDetail, joinGroupDeal } from "../../api/groupDealApi";
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
          const normalized = { ...data };
          normalized.productName = data.productName || data.title;

          if (Array.isArray(data.images)) {
            normalized.imagePaths = data.images
              .map((img) => img.imageUrl)
              .filter(Boolean);
          } else {
            normalized.imagePaths = [];
          }

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

  // 🔥 구매 버튼 클릭 시 처리 (+ 마감/매진 방지)
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

  // 🔹 디테일 페이지에서의 마감/매진 상태 계산
  const statusUpper = (deal.status || "").toString().toUpperCase();
  const hasMax =
    typeof deal.maxMemberCount === "number" && deal.maxMemberCount > 0;
  const currentQty =
    typeof deal.currentQuantity === "number" ? deal.currentQuantity : 0;
  const isSoldOut = hasMax && currentQty >= deal.maxMemberCount;
  const isTimeOver = remainingText === "마감";
  const isStatusClosed = statusUpper && statusUpper !== "OPEN";
  const isClosed = isSoldOut || isTimeOver || isStatusClosed;
  const closeLabel = isSoldOut ? "매진" : isClosed ? "마감" : "";

  const canJoin = !isClosed && statusUpper === "OPEN";

  let statusLabel = "모집중";
  if (isSoldOut) statusLabel = "매진";
  else if (isTimeOver) statusLabel = "마감";
  else if (isStatusClosed) statusLabel = deal.status || "종료";

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

            {/* 🔥 디테일에서도 마감/매진 오버레이 */}
            {isClosed && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
                }}
              />
            )}
            {closeLabel && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  padding: "10px 26px",
                  borderRadius: "999px",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textAlign: "center",
                  backgroundColor: "rgba(15,23,42,0.95)",
                  color: "#fefce8",
                  boxShadow: "0 14px 36px rgba(0,0,0,0.5)",
                }}
              >
                {closeLabel === "매진" ? "매진!" : "마감!"}
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
                  color: isClosed ? "#9ca3af" : "#16a34a",
                }}
              >
                {statusLabel}
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
                  color: remainingText === "마감" ? "#9ca3af" : "#16a34a",
                }}
              >
                {remainingText}
              </span>
            </div>
          </div>

          {/* 발송 정보 */}
          <div
            className="border rounded-3 p-3 mb-3"
            style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
          >
            <div className="d-flex justify-content-between mb-1">
              <span className="small text-muted">발송 예정일</span>
              <span className="small fw-semibold">
                {formatDateRange(
                  deal.shippingStartDate,
                  deal.shippingEndDate
                )}
              </span>
            </div>
            {deal.shippingMethod && (
              <div className="d-flex justify-content-between mb-1">
                <span className="small text-muted">배송 방법</span>
                <span className="small">{deal.shippingMethod}</span>
              </div>
            )}
            {deal.shippingFee != null && (
              <div className="d-flex justify-content-between">
                <span className="small text-muted">배송비</span>
                <span className="small fw-semibold">
                  {deal.shippingFee === 0
                    ? "무료 배송"
                    : formatPrice(deal.shippingFee)}
                </span>
              </div>
            )}
          </div>

          {/* 수량 선택 + 버튼 */}
          <div className="d-flex align-items-center gap-3 mt-3">
            <div
              className="d-flex align-items-center border rounded-3 px-2"
              style={{ backgroundColor: "#f9fafb" }}
            >
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => handleChangeQty(quantity - 1)}
                disabled={!canJoin}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => handleChangeQty(e.target.value)}
                className="form-control form-control-sm text-center border-0"
                style={{
                  width: 60,
                  boxShadow: "none",
                  backgroundColor: "transparent",
                }}
                disabled={!canJoin}
              />
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => handleChangeQty(quantity + 1)}
                disabled={!canJoin}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn btn-lg flex-grow-1"
              style={{
                borderRadius: "999px",
                backgroundColor: canJoin ? "#166534" : "#9ca3af",
                border: "none",
                fontWeight: 700,
                fontSize: "0.98rem",
                color: "#ffffff",
                padding: "10px 20px",
                boxShadow: canJoin
                  ? "0 12px 28px rgba(22,101,52,0.35)"
                  : "none",
              }}
              onClick={handleJoinAndGoCart}
              disabled={joining || !canJoin}
            >
              {isSoldOut
                ? "매진된 공동구매입니다"
                : isClosed
                ? "마감된 공동구매입니다"
                : joining
                ? "공동구매 참여 중..."
                : "바로구매"}
            </button>
          </div>

          {/* 🔥 여기 있던 상품 소개(deal.detail) 영역은 탭으로 이동 */}
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