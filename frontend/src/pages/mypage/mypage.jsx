// ==============================================
// frontend/src/pages/mypage/mypage.jsx
// ==============================================
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../../assets/css/mypage.css";
import MypageLeftSideBar from "./MypageLeftSideBar";
import MypageOrderList from "./MypageOrderList";
import Swal from "sweetalert2";
import MypageMyReview from "./MypageMyReview";
import MypageCanceledOrder from "./MypageCanceledOrder";
import delivery1 from "../../assets/img/delivery1.png";
import delivery2 from "../../assets/img/delivery2.jpg";
import delivery3 from "../../assets/img/delivery3.png";
import MypageWishlist from "./MypageWishlist";
import Membership from "./Membership";
import MyInfo from "./MyInfo";
import MypageGroupDeal from "./MypageGroupDeal";
import { AuthContext } from "../../contexts/AuthContext";

function moneyKRW(n) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  return v.toLocaleString("ko-KR") + "원";
}
function phoneToString(phone) {
  if (!phone) return "";
  const s = String(phone);
  const l = s.length;
  if (l < 7) return s;
  const p1 = s.substring(0, 3);
  const p2 = s.substring(3, l - 4);
  const p3 = s.substring(l - 4);
  return `${p1}-${p2}-${p3}`;
}

function formatKoreanDateTime(str) {
  if (!str) return "";

  // "2025-11-24 16:51:02" → ["2025-11-24", "16:51:02"]
  const [datePart, timePart] = str.split(" ");
  if (!datePart || !timePart) return "";

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  const date = new Date(year, month - 1, day, hour, minute, second);

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];

  let h24 = date.getHours();
  const m = date.getMinutes();
  const period = h24 < 12 ? "오전" : "오후";

  // 24시간제 → 12시간제
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  const mm = date.getMonth() + 1;
  const dd = date.getDate();

  // 예: "11/24(월) 오후 4시 51분"
  return `${mm}/${dd}(${weekday}) ${period} ${h12}시 ${m}분`;
}

export default function MyPage() {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [overview, setOverview] = useState({
    name: "",
    grade: "",
    points: 0,
    couponCount: 0,
  });
  const [orders, setOrders] = useState([]);
  const [months, setMonths] = useState(3);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { protocol, hostname } = window.location;
  const API_BASE = `${protocol}//${hostname}:8080`;
  const userInfoFromLocal = JSON.parse(window.localStorage.getItem("loginUser"));
  const user_Id = userInfoFromLocal.userId;
  const user_name = userInfoFromLocal.name;
  const { auth } = useContext(AuthContext);

  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersItem, setOrdersItem] = useState([]);
  const [myReview, setMyReview] = useState([]);
  const [canceledOrder, setCanceledOrder] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [groupDeal, setGroupDeal] = useState([]);
  const [couponAmount, setCouponAmount] = useState("");

  // ⭐ 어떤 주문의 상세가 열려 있는지 저장
  const [openOrderId, setOpenOrderId] = useState(null);

  // ===== 주문 취소 모달 상태 (추가) =====
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [targetOrderItemId, setTargetOrderItemId] = useState(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const [showContent,setShowContent] = useState('orderList');
  const [customCancelReason, setCustomCancelReason] = useState("");

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const MAX_CANCEL_REASON_LEN = 60;

  const [showCancelDetail, setShowCancelDetail] = useState(false);
  const [cancelDetail, setCancelDetail] = useState(null);

  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);

  // 취소 사유 목록 (요청 5종 + 기타)
  const cancelReasons = [
    "단순 변심",
    "상품 옵션 변경",
    "추가 주문",
    "결제 수단 변경",
    "배송 정보 변경",
    "기타 (직접 입력)",
  ];

  async function getUserInfo() {
    try {
      const res = await fetch(
        `${API_BASE}/orders/findUserInfoForOrder?user_id=${user_Id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserInfo(data);
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load User failed:", e);
      setUserInfo([]);
    }
  }

  async function getUserOrders() {
    setStatus("loading");
    try {
      const res = await fetch(
        `${API_BASE}/orders/findAllOrdersByUserId?user_id=${user_Id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserOrders(data);
      setStatus("ready");
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load orders failed:", e);
      setUserOrders([]);
      setStatus("error");
    }
  }

  async function getUserGroupDeal() {
    setStatus("loading");
    try {
      const res = await fetch(
        `${API_BASE}/orders/findAllGroupDealOrdersByUserId?user_id=${user_Id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGroupDeal(data);
      setStatus("ready");
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load orders failed:", e);
      setGroupDeal([]);
      setStatus("error");
    }
  }

  async function getOrdersItem(order_id) {
    try {
      const res = await fetch(
        `${API_BASE}/orders/findOrdersItemByOrderId?order_id=${order_id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrdersItem(data);
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load ordersItem failed:", e);
      setOrdersItem([]);
    }
  }

  async function getMyReview() {
    try {
      const res = await fetch(
        `${API_BASE}/mypage/findReviewByUserId?user_id=${user_Id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMyReview(data);
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load myReview failed:", e);
      setMyReview([]);
    }
  }

  async function getDeliveryInfo(order_item_id) {
    try {
      const res = await fetch(
        `${API_BASE}/mypage/findDeliveryInfo?order_item_id=${order_item_id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setDeliveryInfo({
        productName: data.name,
        status: data.delivery_status,
        carrier: data.carrier_name,
        trackingNo: data.tracking_number,
        receiver: data.user_name,
        address: data.receiver_addr,
        created_date: data.created_date,
        shipped_at: data.shipped_at,
        delivered_at: data.delivered_at,
        order_status: data.order_status
      });

    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load deliveryInfo failed:", e);
      setDeliveryInfo([]);
    }
  }


  async function getGroupDealDeliveryInfo(order_item_id) {
    try {
      const res = await fetch(
        `${API_BASE}/mypage/findGroupDealDeliveryInfo?order_item_id=${order_item_id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setDeliveryInfo({
        productName: data.title,
        status: data.delivery_status,
        carrier: data.carrier_name,
        trackingNo: data.tracking_number,
        receiver: data.user_name,
        address: data.receiver_addr,
        created_date: data.created_date,
        shipped_at: data.shipped_at,
        delivered_at: data.delivered_at,
        order_status: data.order_status
      });

    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load deliveryInfo failed:", e);
      setDeliveryInfo([]);
    }
  }





  async function getCanceledOrder() {
    try {
      const res = await fetch(
        `${API_BASE}/mypage/findCanceledOrderByUserId?user_id=${user_Id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCanceledOrder(data);
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load canceledOrder failed:", e);
      setCanceledOrder([]);
    }
  }


  async function getWishlist() {
    try {
      const res = await fetch(
        `${API_BASE}/mypage/findWishlistByUserId?user_id=${user_Id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWishlist(data);
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load wishlist failed:", e);
      setWishlist([]);
    }
  }

  const token =
    auth?.accessToken ||
    auth?.token ||
    localStorage.getItem("accessToken");

  const userNo = auth.userNo;

  async function getCoupons() {
    try {
      const res = await fetch(
        `${API_BASE}/api/mypage/coupon/my-coupons?userNo=${userNo}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("쿠폰 응답:", data);
      const count = Array.isArray(data) ? data.length : 0;
      setCouponAmount(count);
    } catch (err) {
      console.error("쿠폰 조회 실패:", err);
    }


  };

  // ⭐ 주문 상세 토글 핸들러 (주문 상세 버튼 클릭 시 호출)
  async function handleToggleOrderDetails(order_id) {
    // 이미 열려있는 주문을 다시 누르면 닫기
    if (openOrderId === order_id) {
      setOpenOrderId(null);
      setOrdersItem([]);
      return;
    }
    // 새 주문 상세 열기: 기존 항목 초기화 후 로딩
    setOpenOrderId(order_id);
    setOrdersItem([]);
    await getOrdersItem(order_id);
  }

  // ===== 모달 열기/닫기 (추가) =====
  const handleOpenCancelModal = (orderItemId) => {
    setTargetOrderItemId(orderItemId);
    setCancelReason("");
    setShowCancelModal(true);
  };
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason("");
    setTargetOrderItemId(null);
  };


  // 🚚 배송 현황 모달 열기 (하드코딩 예시)
  const handleOpenDeliveryModal = (order_item_id) => {

    // TODO: 실제 연동 시 orderItem으로 상품명/상태 등 주입
    getDeliveryInfo(order_item_id);
    setShowDeliveryModal(true);
  };

  // 🚚 배송 현황 모달 닫기
  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
    setDeliveryInfo(null);
  };

  

  // 🚚 배송 현황 모달 열기 (하드코딩 예시)
  const handleOpenGroupDealDeliveryModal = (order_item_id) => {

    // TODO: 실제 연동 시 orderItem으로 상품명/상태 등 주입
    getGroupDealDeliveryInfo(order_item_id);
    setShowDeliveryModal(true);
  };


  // 🧾🆕 상세 모달 열기
  const handleOpenCancelDetail = (row) => {
    setCancelDetail(row ?? null);
    setShowCancelDetail(true);
  };

  // 🧾🆕 상세 모달 닫기
  const handleCloseCancelDetail = () => {
    setShowCancelDetail(false);
    setCancelDetail(null);
  };



  // 🧾🆕 구매 상세 모달 열기
  const handleOpenOrderDetail = (row) => {
    setOrderDetail(row ?? null);
    setShowOrderDetail(true);
  };

  // 🧾🆕 구매 상세 모달 닫기
  const handleCloseOrderDetail = () => {
    setShowOrderDetail(false);
    setOrderDetail(null);
  };



  // ===== 컨트롤러 연동: 주문 취소 (추가) =====
  async function cancelOrderBeforeDelivery() {
    if (!targetOrderItemId) {
      alert("취소할 주문을 찾을 수 없습니다.");
      return;
    }

    const finalReason =
      cancelReason === "기타 (직접 입력)" ? customCancelReason.trim() : cancelReason;

    if (!finalReason) {
      alert("취소 사유를 선택(또는 입력)해주세요.");
      return;
    }

    try {
      setIsSubmittingCancel(true);
      const url = `${API_BASE}/orders/cancelOrderBeforeDelivery/${user_Id}?order_item_id=${encodeURIComponent(
        targetOrderItemId
      )}&cancel_reason=${encodeURIComponent(finalReason)}`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      const bodyText = await res.text();
      const trimmed = (bodyText || "").trim();

      if (!res.ok) {
        alert(`취소 실패: ${trimmed || res.status}`);
        return;
      }

      const shippingFeeCharged = trimmed === "shipping_fee_charged";
      const shippingFeeRefunded = trimmed === "shipping_fee_refunded";

      if (shippingFeeCharged) {
        alert("주문이 정상적으로 취소되었습니다.\n※ 환불 후 무료배송조건 미충족으로 배송비가 추가로 부과될 예정입니다.");
      } else if (shippingFeeRefunded) {
        alert("주문이 정상적으로 취소되었습니다.\n※ 해당 주문의 배송이 모두 취소되어 지불하신 배송비가 고객님의 계좌로 입금 될 예정입니다(3영업일 이내).")
      } else {
        alert("주문이 정상적으로 취소되었습니다.");
      }

      handleCloseCancelModal();
      if (openOrderId) {
        await getOrdersItem(openOrderId);
      }
    } catch (e) {
      console.error("cancelOrderBeforeDelivery error:", e);
      alert("주문 취소 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingCancel(false);
    }
  }

  useEffect(() => {
    getUserInfo();
    getUserOrders();
    getMyReview();
    getCanceledOrder();
    getWishlist();
    getUserGroupDeal();
    getCoupons();
  }, []);

  function openContent(content) {
    if (content === 'orderList') getUserOrders();
    if (content === 'myReview') getMyReview();
    if (content === 'canceledOrder') getCanceledOrder();
    if (content === 'wishlist') getWishlist();
    if (content === 'groupDeal') getUserGroupDeal();

    setShowContent(content);
  }

  const emptyText = useMemo(
    () => `${months}개월간의 주문 내역이 없습니다.`,
    [months]
  );


  async function confirmOrder(order_item_id,order_id) {

    const result = await Swal.fire({
      html: `
        <br/>
        <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FVJeVm%2FdJMcac2z6rq%2FAAAAAAAAAAAAAAAAAAAAABaVghGKOGjppn8tBrHbTDYjmeu3vF7fHhu6sJybVq4l%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1764514799%26allow_ip%3D%26allow_referer%3D%26signature%3DO3hjGw2TFVTw2gy2EEnkBBm4nQE%253D" width="200px"/>
        <br/><br/>
        구매를 확정하시겠습니까?<br/>
        구매 확정 후에는 환불이 불가능합니다.
      `,
      title: "",
      text: "123",
      // icon: "warning",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    try {
      const delRes = await fetch(`${API_BASE}/orders/confirmOrder/${user_Id}?order_item_id=${order_item_id}`, {
        method: "post",
        credentials: "include",
      });
      if (!delRes.ok) throw new Error(`DELETE HTTP ${delRes.status}`);

      await Swal.fire({
        title: "",
        text: "구매가 확정되었습니다.",
        icon: "success",
        confirmButtonText: "확인",
      });
    } catch (e) {
      console.error("delete failed:", e);
      await Swal.fire({
        title: "오류가 발생했습니다",
        text: e?.message ?? "잠시 후 다시 시도해 주세요.",
        icon: "error",
        confirmButtonText: "확인",
      });
    } finally {
      await getOrdersItem(order_id);
    }
  }


  async function refundRequest(order_item_id,order_id) {

    const result = await Swal.fire({
      html: `
        <br/>
        <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FVJeVm%2FdJMcac2z6rq%2FAAAAAAAAAAAAAAAAAAAAABaVghGKOGjppn8tBrHbTDYjmeu3vF7fHhu6sJybVq4l%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1764514799%26allow_ip%3D%26allow_referer%3D%26signature%3DO3hjGw2TFVTw2gy2EEnkBBm4nQE%253D" width="200px"/>
        <br/><br/>
        환불 신청하시겠습니까?<br/>
        신청 후 1:1 문의를 통해서 문의해주세요.
      `,
      title: "",
      text: "123",
      // icon: "warning",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    try {
      const delRes = await fetch(`${API_BASE}/orders/refundRequest/${user_Id}?order_item_id=${order_item_id}`, {
        method: "post",
        credentials: "include",
      });
      if (!delRes.ok) throw new Error(`DELETE HTTP ${delRes.status}`);

      await Swal.fire({
        title: "",
        text: "환불 신청되었습니다.",
        icon: "success",
        confirmButtonText: "확인",
      });
    } catch (e) {
      console.error("delete failed:", e);
      await Swal.fire({
        title: "오류가 발생했습니다",
        text: e?.message ?? "잠시 후 다시 시도해 주세요.",
        icon: "error",
        confirmButtonText: "확인",
      });
    } finally {
      await getOrdersItem(order_id);
    }

  }




  return (
    <div className="mypage">
      <div className="container-fluid" style={{ backgroundColor: "#f7f8fa" }}>
        <div className="container py-4" style={{ width: "85%" }}>
          <div className="row g-4">

            <MypageLeftSideBar
              user_name={user_name} overview={overview} moneyKRW={moneyKRW} userInfo={userInfo} showContent={showContent} setShowContent={setShowContent} myReview={myReview} setMyReview={setMyReview} getMyReview={getMyReview} openContent={openContent} couponAmount={couponAmount}
            />

            {showContent === 'orderList' && (
              <MypageOrderList
                months={months} setMonths={setMonths} searchInput={searchInput} setSearchInput={setSearchInput} setQuery={setQuery} status={status} userOrders={userOrders} getUserOrders={getUserOrders} emptyText={emptyText} formatKoreanDateTime={formatKoreanDateTime} handleToggleOrderDetails={handleToggleOrderDetails} openOrderId={openOrderId} moneyKRW={moneyKRW} handleOpenCancelModal={handleOpenCancelModal} ordersItem={ordersItem} confirmOrder={confirmOrder} refundRequest={refundRequest} handleOpenDeliveryModal={handleOpenDeliveryModal} handleOpenOrderDetail={handleOpenOrderDetail}
              />
            )}

            {showContent === 'myReview' && (
              <MypageMyReview 
                myReview={myReview} setMyReview={setMyReview} getMyReview={getMyReview} formatKoreanDateTime={formatKoreanDateTime}
              />
            )}

            {showContent === 'canceledOrder' && (
              <MypageCanceledOrder
                canceledOrder={canceledOrder} setCanceledOrder={setCanceledOrder} formatKoreanDateTime={formatKoreanDateTime} moneyKRW={moneyKRW} handleOpenCancelDetail={handleOpenCancelDetail}
              />
            )}

            {showContent === 'wishlist' && (
              <MypageWishlist
                formatKoreanDateTime={formatKoreanDateTime} moneyKRW={moneyKRW} wishlist={wishlist} getWishlist={getWishlist}
              />
            )}

            {showContent === 'membership' && (
              <div className="col-lg-8">
                <Membership />
              </div>
            )}

            {showContent === 'myInfo' && (
              <MyInfo API_BASE={API_BASE} userId={user_Id} />
            )}

            {showContent === 'groupDeal' && (
              <MypageGroupDeal 
                months={months} setMonths={setMonths} searchInput={searchInput} setSearchInput={setSearchInput} setQuery={setQuery} status={status} userOrders={groupDeal} getUserOrders={getUserGroupDeal} emptyText={emptyText} formatKoreanDateTime={formatKoreanDateTime} handleToggleOrderDetails={handleToggleOrderDetails} openOrderId={openOrderId} moneyKRW={moneyKRW} handleOpenCancelModal={handleOpenCancelModal} ordersItem={ordersItem} confirmOrder={confirmOrder} refundRequest={refundRequest} handleOpenGroupDealDeliveryModal={handleOpenGroupDealDeliveryModal} API_BASE={API_BASE}
              />
            )}
              
          </div>
        </div>
      </div>

      {/* ===== 취소 사유 모달 (추가) ===== */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-3 p-3"
            style={{ width: "min(420px, 92%)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
          >
            <h6 className="mb-3">취소/환불 사유 선택</h6>
            <div className="mb-3">
              <div className="d-flex flex-column gap-2">
                {cancelReasons.map((r) => (
                  // ✏️ 수정: label과 '기타' 입력창을 분리해서 세로 배치
                  <React.Fragment key={r}>
                    <label
                      className="form-check-label d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        className="form-check-input me-2"
                        name="cancelReason"
                        value={r}
                        checked={cancelReason === r}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <span>{r}</span>
                    </label>

                    {r === "기타 (직접 입력)" && cancelReason === "기타 (직접 입력)" && (
                      <div
                        style={{marginTop: "0.25rem" }}
                      >
                        <textarea
                          style={{resize : "none",height:'100px'}}
                          className="form-control"
                          placeholder="취소/환불 사유를 입력하세요"
                          value={customCancelReason}
                          onChange={(e) => {
                            const next = e.target.value;                  
                            if (next.length > MAX_CANCEL_REASON_LEN) {    
                              alert(`취소/환불 사유는 최대 ${MAX_CANCEL_REASON_LEN}자까지 입력 가능합니다.`);
                              return;
                            }
                            setCustomCancelReason(next)
                          }}
                        >
                        </textarea>
                        <div className="text-end mt-1 small text-muted">
                          {customCancelReason.length} / {MAX_CANCEL_REASON_LEN}자
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCloseCancelModal}
                disabled={isSubmittingCancel}
              >
                닫기
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={cancelOrderBeforeDelivery}
                disabled={
                  isSubmittingCancel ||
                  !cancelReason ||
                  (cancelReason === "기타 (직접 입력)" && !customCancelReason.trim())
                }
              >
                {isSubmittingCancel ? "처리 중…" : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 🚚 배송 현황 모달 (하드코딩 틀) */}
      {showDeliveryModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-3 p-3"
            style={{ width: "min(600px, 92%)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
          >
            <h6 className="mb-3">배송 현황</h6>

            <div className="mb-2">
              <div className="fw-semibold mb-1">
                {deliveryInfo?.productName ?? "상품명(예시)"}
              </div>
              <div className="small text-muted">
                {(deliveryInfo?.carrier ?? "배송을 준비중입니다.") +
                  " · " +
                  (deliveryInfo?.trackingNo ?? "")}
              </div>
            </div>
            
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "85%",
                margin: "0 auto"
              }}>

              

              <div className="delivery-img-container">
                <img src={delivery1} className="delivery-img"/>
                <br/>
                {deliveryInfo?.order_status === 'R1' ? (
                  <div className={`delivery-img-name btn-canceled`}>
                    {deliveryInfo?.status === '배송취소' && (
                      <>주문 취소</>
                    )}
                    {deliveryInfo?.status === '환불완료' && (
                      <>상품 환불</>
                    )}
                  </div>
                ) : (
                  <div className={`
                    delivery-img-name
                    ${deliveryInfo?.created_date ? 'btn-activated' : ''}
                  `}>
                    주문 확인
                  </div>
                )}
                
              </div>
              <div>
                &gt;
              </div>
              <div className="delivery-img-container">
                <img src={delivery2} className="delivery-img"/>
                <br/>
                <div className={`
                  delivery-img-name
                  ${deliveryInfo?.shipped_at ? 'btn-activated' : ''}
                `}>
                  배송중
                </div>
              </div>
              <div>
                &gt;
              </div>
              <div className="delivery-img-container">
                <img src={delivery3} className="delivery-img"/>
                <br/>
                <div className={`
                  delivery-img-name
                  ${deliveryInfo?.delivered_at ? 'btn-activated' : ''}
                `}>
                  배송 완료
                </div>
              </div>
              
              
              
              
            </div>
            




            <div className="mb-3">
              <span className="badge bg-success">
                {deliveryInfo?.status ?? "배송중"}
              </span>
            </div>

            <div
              className="border rounded-3 p-2 mb-3"
              style={{ maxHeight: 180, overflowY: "auto" }}
            >
              

              <div className="delivery-detail-container">
                <div className="delivery-detail-created-date">{deliveryInfo?.created_date}</div>
                <div className="delivery-detail-content">
                  {deliveryInfo?.order_status === 'R1' ? (
                    <>주문이 취소되었습니다.</>
                  ) : (
                    <>판매자가 고객님의 주문을 확인하는 중입니다.</>
                  )}
                  
                </div>
              </div>
              {deliveryInfo?.shipped_at && (
                <div className="delivery-detail-container">
                  <div className="delivery-detail-created-date">{deliveryInfo?.shipped_at}</div>
                  <div className="delivery-detail-content">
                    고객님의 상품이 배송 중입니다.
                  </div>
                </div>
              )}
              {deliveryInfo?.delivered_at && (
                <div className="delivery-detail-container">
                  <span className="delivery-detail-created-date">{deliveryInfo?.delivered_at}</span>
                  <span className="delivery-detail-content">
                    고객님께 배송이 완료되었습니다.
                  </span>
                </div>
              )}
              

            </div>

            <div className="small text-muted mb-3">
              받는 분: {deliveryInfo?.receiver ?? "name error"}
              <br />
              주소: {deliveryInfo?.address ?? "addr error"}
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCloseDeliveryModal}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}



      {/* 🧾🆕 취소/환불 상세(영수증) 모달 */}
      {showCancelDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-3 p-4"
            style={{
              width: "min(520px, 94%)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            {/* 헤더 */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                  취소/환불 상세
                </div>
                <div className="small text-muted">
                  처리일시: {formatKoreanDateTime(cancelDetail?.created_date)}
                </div>
              </div>
              <span
                className={`badge ${
                  cancelDetail?.order_status === "R1" ? "bg-secondary" : "bg-success"
                }`}
              >
                {cancelDetail?.order_status === "R1" ? "취소/환불" : "처리 완료"}
              </span>
            </div>

            {/* 구분선 */}
            <div
              style={{
                borderTop: "1px dashed #d7dbe2",
                margin: "12px 0 16px",
              }}
            />

            {/* 주문/상점 정보 */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="small text-muted">주문번호</div>
                <div className="fw-semibold">{(cancelDetail?.toss_orderid).substring(6) ?? "-"}</div>
              </div>
              {/* <div className="fw-semibold">
                {cancelDetail?.toss_orderid ?? "-"}
              </div> */}
              
              <div className="small text-muted mt-2">판매자</div>
              <div className="fw-semibold">
                {cancelDetail?.store_name ?? "-"}
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="d-flex gap-3 align-items-center mb-3">
              {cancelDetail?.main_image && (
                <img
                  src={cancelDetail.main_image}
                  alt={cancelDetail?.name ?? "product"}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
              )}

              <div className="flex-grow-1">
                <div className="fw-semibold">
                  {cancelDetail?.name ?? "상품명"}
                </div>
                <div className="small text-muted">
                  {[
                    cancelDetail?.grade,
                    cancelDetail?.unit_name,
                    cancelDetail?.origin_region,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            </div>

            {/* 금액/수량 */}
            <div className="border rounded-3 p-3 mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">주문 단가</span>
                <span>{moneyKRW(cancelDetail?.price_at_order ?? 0)}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">수량</span>
                <span>{cancelDetail?.quantity ?? 0}개</span>
              </div>
              <div
                style={{
                  borderTop: "1px dashed #e2e6ee",
                  margin: "8px 0",
                }}
              />
              <div className="d-flex justify-content-between">
                <span className="fw-semibold">주문 금액</span>
                <span className="fw-semibold">
                  {moneyKRW(
                    (cancelDetail?.price_at_order ?? 0) *
                      (cancelDetail?.quantity ?? 0)
                  )}
                </span>
              </div>
            </div>

            {/* 취소/환불 정보 */}
            <div className="mb-3">
              <div className="small text-muted">사유</div>
              <div className="fw-semibold">
                {cancelDetail?.cancel_reason ?? "-"}
              </div>
            </div>

            <div
              className="border rounded-3 p-3"
              style={{ background: "#fafbfe" }}
            >
              <div className="d-flex justify-content-between">
                <span className="fw-semibold">환불 예정/완료 금액</span>
                <span className="fw-bold">
                  {moneyKRW(cancelDetail?.refund_amount ?? 0)}
                </span>
              </div>
              <div className="small text-muted mt-1">
                주문일시: {formatKoreanDateTime(cancelDetail?.order_created_date)}
              </div>
            </div>

            {/* 하단 안내 */}
            <div className="small text-muted mt-3">
              ※ 쿠폰 및 적립금으로 할인받은 금액을 제외한 나머지 금액이 환불됩니다. <br/>
              ※ 사용한 적립금은 적정 비율로 돌려받으실 수 있습니다. <br/>
              ※ 모든 주문이 배송 전에 취소되었을 경우에는 배송비를 환불받으실 수 있습니다.
            </div>

            {/* 푸터 버튼 */}
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCloseCancelDetail}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 🧾🆕 구매 상세(영수증) 모달 */}
      {showOrderDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-3 p-4"
            style={{
              width: "min(520px, 94%)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            {/* 헤더 */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                  구매 상세 내역
                </div>
                <div className="small text-muted">
                  주문상품 생성일시: {formatKoreanDateTime(orderDetail?.created_date)}
                </div>
              </div>

              <span className="badge bg-primary">
                {orderDetail?.order_status ?? "상태"}
              </span>
            </div>

            {/* 구분선 */}
            <div
              style={{
                borderTop: "1px dashed #d7dbe2",
                margin: "12px 0 16px",
              }}
            />

            {/* 주문/판매처 정보 */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="small text-muted">주문번호</div>
                <div className="fw-semibold">{(orderDetail?.toss_orderid).substring(6) ?? "-"}</div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <div className="small text-muted mt-2">주문상품번호</div>
                <div className="fw-semibold">{orderDetail?.order_item_id ?? "-"}</div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="small text-muted mt-2">판매자</div>
                <div className="fw-semibold">{orderDetail?.store_name ?? "-"}</div>
              </div>

              

              
            </div>

            {/* 상품 정보 */}
            <div className="d-flex gap-3 align-items-center mb-3">
              {orderDetail?.main_image && (
                <img
                  src={orderDetail.main_image}
                  alt={orderDetail?.product_name ?? "product"}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
              )}

              <div className="flex-grow-1">
                <div className="fw-semibold">
                  {orderDetail?.product_name ?? "상품명"}
                </div>
                <div className="small text-muted">
                  {[
                    orderDetail?.grade,
                    orderDetail?.unit_name,
                    orderDetail?.origin_region,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            </div>

            {/* 금액/수량 */}
            <div className="border rounded-3 p-3 mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">주문 단가</span>
                <span>{moneyKRW(orderDetail?.price_at_order ?? 0)}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">수량</span>
                <span>{orderDetail?.quantity ?? 0}개</span>
              </div>
              <div
                style={{
                  borderTop: "1px dashed #e2e6ee",
                  margin: "8px 0",
                }}
              />
              <div className="d-flex justify-content-between">
                <span className="fw-semibold">상품 합계</span>
                <span className="fw-semibold">
                  {moneyKRW(orderDetail?.line_total_amount ?? 0)}
                </span>
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="border rounded-3 p-3 mb-3" style={{ background: "#fafbfe" }}>
              <div className="d-flex justify-content-between">
                <span className="fw-semibold">배송 상태</span>
                <span>
                  {orderDetail?.delivery_status ?? "-"}
                </span>
              </div>
            </div>

            {/* 하단 안내 */}
            <div className="small text-muted">
              본 영수증은 구매 상세 확인용입니다.
            </div>

            {/* 푸터 버튼 */}
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCloseOrderDetail}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
