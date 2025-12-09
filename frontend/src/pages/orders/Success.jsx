// frontend/src/pages/toss/SuccessPage.jsx (예시 경로)
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";
import { joinGroupDeal } from "../../api/groupDealApi";

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(n) {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("ko-KR") + "원";
}

export function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [payment, setPayment] = useState(null);   // /confirm 응답
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { protocol, hostname } = window.location;
  const API_BASE = `${protocol}//${hostname}:8080`;

  const calledRef = useRef(false);
  const savedRef = useRef(false); // 중복 insert 방지용
  const { findCartAmount } = useContext(CartContext);

  useEffect(() => {

    if (calledRef.current) return;
    calledRef.current = true;

    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    // 필수 값 검증
    if (!requestData.orderId || !requestData.amount || !requestData.paymentKey) {
      setError("결제 정보가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    async function confirm() {
      try {
        const response = await fetch(`${API_BASE}/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const json = await response.json();

        if (!response.ok) {
          // 결제 실패 비즈니스 로직
          navigate(`/fail?message=${encodeURIComponent(json.message || "")}&code=${encodeURIComponent(json.code || "")}`);
          return;
        }

        // 결제 성공 비즈니스 로직
        setPayment(json);   // Toss Payment 객체 전체 보관
        setError("");
      } catch (e) {
        console.error("confirm error:", e);
        setError("결제 승인 처리 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




  // ✨✅ [추가] 결제 승인 성공 → 주문 정보 DB insert
  useEffect(() => {
    if (!payment) return;
    if (savedRef.current) return;
    savedRef.current = true;

    const meta = payment?.metadata ?? {}; // Orders.jsx에서 전달한 metadata

    // ✨ 안전 파서
    const safeParse = (s) => {
      try {
        if (typeof s !== "string") return {};
        return JSON.parse(s);
      } catch {
        return {};
      }
    };

    const c1 = safeParse(meta.checkout1); // shipping/discount/points/total
    const c2 = safeParse(meta.checkout2); // receiver/delivery_message

    const amount =
      payment?.totalAmount ??
      payment?.balanceAmount ??
      Number(searchParams.get("amount")) ??
      0;

    const payload = {
      toss_orderid: payment?.orderId ?? null,
      toss_paymentkey: payment?.paymentKey ?? null,
      amount,

      // ✨ Orders.jsx에서 요구한 필드들
      user_id: meta.user_id ?? null,
      order_type: meta.order_type ?? "normal",
      order_status: meta.order_status ?? "A",

      shipping_fee: Number(c1.shipping_fee ?? 0),
      discount_amount: Number(c1.discount_amount ?? 0),
      used_points: Number(c1.used_points ?? 0),
      order_total_amount: Number(c1.order_total_amount ?? amount),
      subtotal: Number(c1.subtotal ?? 0),
      couponId: Number(c1.couponId ?? 0),

      receiver_name: c2.receiver_name ?? "",
      receiver_phone: c2.receiver_phone ?? "",
      receiver_addr: c2.receiver_addr ?? "",
      delivery_message: c2.delivery_message ?? "",

      // 참고용
      approvedAt: payment?.approvedAt ?? payment?.requestedAt ?? null,
      orderName: payment?.orderName ?? null,
      method: payment?.method ?? null,
      provider: payment?.card?.company ?? payment?.easyPay?.provider ?? null,
      
    };

    // ⚠️ 서버에서 재계산/검증하는 것이 안전합니다(클라이언트 값 신뢰 금지).
    // 여기서는 "insert"만 예시 호출
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/insertOrders/${payload.user_id}`, { // ✨✅ 서버의 실제 엔드포인트에 맞게만 변경
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("orders insert failed:", txt);
          // 필요 시 사용자 노출 메시지
        }
      } catch (e) {
        console.error("orders insert error:", e);
      } finally {
        await findCartAmount();
      }
    })();

    


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment]);




  const orderId = payment?.orderId || searchParams.get("orderId");
  const approvedAt = payment?.approvedAt || payment?.requestedAt;
  const totalAmount =
    payment?.totalAmount ??
    payment?.balanceAmount ??
    searchParams.get("amount");

  // 주문 상품 이름 (Toss: orderName 필드)
  const orderName = payment?.orderName || "주문 상품 정보 없음";

  // 구매자 이름: customerName / metadata.buyerName 등에서 시도
  const buyerName =
    payment?.customerName ||
    payment?.metadata?.buyerName ||
    "구매자 정보 없음";

  return (
    <div
      style={{
        minHeight: "70vh",
        backgroundColor: "#f5f5f7",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily:
          "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', Pretendard, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          marginTop: 40,
          padding: "24px 20px 32px",
          backgroundColor: "#ffffff",
          borderRadius: 18,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* 상단 체크 아이콘 */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              display: "inline-flex",
              width: 64,
              height: 64,
              borderRadius: "50%",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #2f7afe",
              color: "#2f7afe",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            ✓
          </div>
        </div>

        {/* 제목 / 서브텍스트 */}
        <h2
          style={{
            fontSize: 20,
            textAlign: "center",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          결제가 완료되었습니다.
        </h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: 16,
            fontSize: 13,
            color: "#666",
          }}
        >
          주문 번호 <strong>{orderId}</strong>
        </p>

        {/* 로딩 / 에러 상태 */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              fontSize: 13,
              color: "#777",
            }}
          >
            결제 정보를 확인하는 중입니다…
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              textAlign: "center",
              padding: "16px 12px",
              marginBottom: 12,
              borderRadius: 10,
              backgroundColor: "#fff4f4",
              color: "#d64545",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 거래 정보 섹션 */}
            <div
              style={{
                borderTop: "1px solid #eee",
                paddingTop: 16,
                marginTop: 8,
                marginBottom: 12,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  color: "#999",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                거래 정보
              </h3>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "#666" }}>거래일시</span>
                <span style={{ color: "#111" }}>
                  {formatDateTime(approvedAt)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "#666" }}>주문번호</span>
                <span style={{ color: "#111" }}>{orderId}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: "1px dashed #eee",
                  fontWeight: 600,
                }}
              >
                <span style={{ color: "#333" }}>총 결제 금액</span>
                <span style={{ color: "#111" }}>{formatMoney(totalAmount)}</span>
              </div>
            </div>

            {/* 주문 정보 섹션 (상품명 / 구매자명) */}
            <div
              style={{
                borderTop: "1px solid #eee",
                paddingTop: 16,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  color: "#999",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                주문 정보
              </h3>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "#666" }}>구매자</span>
                <span style={{ color: "#111" }}>{buyerName}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "#666" }}>주문 상품</span>
                <span
                  style={{
                    color: "#111",
                    textAlign: "right",
                    maxWidth: 220,
                    wordBreak: "keep-all",
                    whiteSpace: "normal",
                  }}
                >
                  {orderName}
                </span>
              </div>
            </div>
          </>
        )}

        {/* 하단 버튼 */}
        <button
          type="button"
          onClick={() => navigate("/mypage")}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "11px 0",
            borderRadius: 999,
            border: "none",
            backgroundColor: "#2f7afe",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          구매 내역 보기
        </button>
      </div>
    </div>
  );
}
