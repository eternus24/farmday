import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import "../../assets/css/cart.css";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { random123DaysLaterLabelKST } from "../orders/dateCalc";
import { AuthContext } from "../../contexts/AuthContext";

function money(n) { return `$${n.toFixed(2)}`; }

export default function GroupDealOrders() {

  const { groupDealId } = useParams();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [paying, setPaying] = useState(false);
  const { auth } = useContext(AuthContext);

  const [coupon, setCoupon] = useState([]);
  const [userInfo, setUserInfo] = useState([]);

  // ⬇️ 추가: 쿠폰/적립금 상태
  const [selectedCoupon, setSelectedCoupon] = useState("NONE"); // NONE | 5PCT | 10PCT
  const [usedPoints, setUsedPoints] = useState(0);
  const [pointsInput, setPointsInput] = useState("");

  const { protocol, hostname } = window.location;
  const API_BASE = `${protocol}//${hostname}:8080`;
  const user_id = JSON.parse(window.localStorage.getItem('loginUser')).userId;

  const location = useLocation();
  const { shipping, fromGroupDeal, quantity } = location.state || {};

  const token =
    auth?.accessToken ||
    auth?.token ||
    localStorage.getItem("accessToken");

  const userNo = auth.userNo;


  // cart.jsx의 로딩 방식과 동일: fetch → map/normalize → setItems
  async function reloadCart(signal) {
    setStatus("loading");
    try {
      const res = await fetch(
        `${API_BASE}/api/group-deals/${groupDealId}`,
        { credentials: "include", signal, cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data) {                         // ✨ 추가: 데이터 없을 때 처리
        setItems([]);
        setStatus("ready");
        return;
      }

      const row = data;                    // ✨ 추가: 단일 DTO를 row로 사용

      const cartId = row?.groupDealId;     // ✨ 변경: List용 map 제거하고 단일 값 사용
      const pid = row?.groupDealId;        //    (필요하다면 productId 등으로 교체)
      if (pid == null) {                   // ✨ 추가: pid 없으면 빈 배열 처리
        setItems([]);
        setStatus("ready");
        return;
      }

      const qtyNum = Number.parseInt(quantity, 10);  // ✨ 그대로 사용 (state 등에서 온 quantity)
      const qty = Number.isFinite(qtyNum) && qtyNum > 0 ? Math.min(999, qtyNum) : 1;

      const item = {                       // ✨ 변경: 단일 item 객체 생성
        _key: cartId != null ? String(cartId) : `row#0`,
        id: String(pid),
        name: row.title,
        info: `기본 옵션`,
        summary: row.subTitle,
        qty,
        // grade_and_unit_name: `(${row.grade}) ${row.unit_name}`,
        grade_and_unit_name: `(일반) 1개`,
        price: Number(row?.dealPrice ?? 3.99),
        img: row.images[0].imageUrl,
        eta: random123DaysLaterLabelKST() + " 도착 예정",
        store_name: 'Farmday 공동구매',
      };

      setItems([item]);                    // ✨ 변경: 단일 DTO를 배열 한 칸으로 넣기
      setStatus("ready");
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load orders failed:", e);
      setItems([]);
      setStatus("error");
    }
  }

  async function getUserInfo(signal) {
    setStatus("loading");
    try {
      const res = await fetch(
        `${API_BASE}/orders/findUserInfoForOrder?user_id=${user_id}`,
        { credentials: "include", signal, cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserInfo(data);
      setStatus("ready");
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load orders failed:", e);
      setUserInfo([]);
      setStatus("error");
    }
  }


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
              Authorization: token.startsWith('Bearer ')
                ? token
                : `Bearer ${token}`,
            },
          }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("쿠폰 응답:", data);

      setCoupon(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("쿠폰 조회 실패:", err);
    }


  };



  useEffect(() => {
    getCoupons();
    const ac = new AbortController();
    reloadCart(ac.signal);
    const ac2 = new AbortController();
    getUserInfo(ac.signal);
    return () => ac.abort();
  }, [API_BASE, user_id]);

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.price * it.qty, 0),
    [items]
  );

  // 보유 적립금
  const availablePoints = useMemo(
    () => Math.max(0, Math.round(Number(userInfo?.points ?? 0))),
    [userInfo]
  );

  // 선택된 쿠폰 객체 찾기
  const selectedCouponObj = useMemo(() => {
    if (selectedCoupon === "NONE") return null;
    return coupon.find((cp) => String(cp.couponId) === String(selectedCoupon)) ?? null;
  }, [selectedCoupon, coupon]);

  // 할인 계산은 객체 기준으로
  const discountAmount = useMemo(() => {
    if (!selectedCouponObj) return 0;

    const type = selectedCouponObj.discountType;
    const value = Number(selectedCouponObj.discountValue ?? 0);

    if (type === "RATE") {
      const rate = value * 0.01;
      return Math.floor(subtotal * rate);
    }
    if (type === "FIXED") {
      return value;
    }
    return 0;
  }, [selectedCouponObj, subtotal]);

  // 적립금 적용 전 결제 예정 금액(상한 산정용)
  const payableBeforePoints = useMemo(
    () => Math.max(0, subtotal - discountAmount + (shipping ?? 0)),
    [subtotal, discountAmount, shipping]
  );

  // 총 결제 금액
  const total = Math.max(0, subtotal - discountAmount - usedPoints + (shipping ?? 0));

  // 총 할인 퍼센트(쿠폰+적립금)
  const discountPercent = useMemo(() => {
    if (subtotal <= 0) return 0;
    return Math.round(((discountAmount + usedPoints) / subtotal) * 100);
  }, [discountAmount, usedPoints, subtotal]);

  const rewardBase = Math.floor(subtotal * userInfo.point_rate * 0.01);
  // const [rewardBase, setRewardBase] = useState(Math.floor(subtotal * 0.01));
  const farmpayPoints = Math.floor(subtotal * 0.05);
  const rewardReview = 1000*items.length; // 후기 적립 최대
  const rewardTotal = rewardBase + rewardReview;

  const [delivery_message,setDelivery_message] = useState('')
  const onMessage = (evt) => {
    setDelivery_message(evt.target.value)
  }


  // 토스
  const clientKey = "#";

  const handlePay = async () => {
    if (!items.length) return;
    if (paying) return;
    setPaying(true);

    try {
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({
        customerKey: '6SAstJ5mi55DEHRMeV8u6', // 비회원 결제
      });

      const amountValue = Math.round(total);
      const orderId = `order-${Date.now()}`;
      const orderName =
        items.length === 1
          ? items[0].name
          : `${items[0].name} 외 ${items.length - 1}건`;

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: amountValue,
        },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/orders/success`,
        failUrl: `${window.location.origin}/orders/fail`,

        metadata: {
          user_id: String(user_id),
          order_type: "groupdeal_"+String(groupDealId)+"_"+String(quantity),
          order_status: "A",
          checkout1: JSON.stringify({
            shipping_fee: String(Number(shipping ?? 0)),
            discount_amount: String(Number(discountAmount)),
            used_points: String(Number(usedPoints)),
            order_total_amount: String(Math.round(total)),
            subtotal: String(Number(subtotal ?? 0))
          }),
          checkout2: JSON.stringify({
            receiver_name: String(userInfo?.name ?? ""),
            receiver_phone: String(userInfo?.phone ?? ""),
            receiver_addr: String(userInfo?.addr ?? ""),
            delivery_message: String(delivery_message ?? ""),
            // fromGroupDeal: fromGroupDeal
          }),
        },




      });
    } catch (err) {
      console.error("결제 요청 중 에러:", err);
      alert("결제가 취소되었습니다.");
      setPaying(false);
    }
  };

  function moneyKRW(n) {
    const v = Math.max(0, Math.round(Number(n) || 0));
    return v.toLocaleString("ko-KR") + "원";
  }

  function phoneToString(phone) {
    if (!phone) return "";
    const s = String(phone);
    const l = s.length;
    if (l < 7) return s;
    const phone1 = s.substring(0,3);
    const phone2 = s.substring(3,l-4);
    const phone3 = s.substring(l-4);
    return phone1+"-"+phone2+"-"+phone3;
  }

  // 적립금 적용
  const handleApplyPoints = () => {
    const raw = (pointsInput ?? "").trim();
    if (raw === "" || Number(raw) === 0) {
      setUsedPoints(0);
      setPointsInput("");
      return;
    }
    const v = Math.max(0, Math.round(Number(raw)));
    if (!Number.isFinite(v)) return;

    if (v < 2000) {
      alert("적립금은 최소 2,000원부터 사용할 수 있습니다.");
      return;
    }
    if (v > availablePoints) {
      alert("보유 적립금을 초과했습니다.");
      return;
    }
    if (v > payableBeforePoints) {
      alert("결제 예정 금액을 초과하여 사용할 수 없습니다.");
      return;
    }
    setUsedPoints(v);
    setPointsInput(String(v));
  };

  // 적립금 모두 사용
  const handleUseAllPoints = () => {
    const cap = Math.min(availablePoints, payableBeforePoints);
    if (cap < 2000) {
      alert("적립금은 결제 예정 금액 기준으로 2,000원 이상일 때만 사용 가능합니다.");
      setUsedPoints(0);
      setPointsInput("");
      return;
    }
    setUsedPoints(cap);
    setPointsInput(String(cap));
  };

  // 한도 자동 보정: 쿠폰/금액 변동 시
  useEffect(() => {
    const cap = Math.min(availablePoints, payableBeforePoints);
    if (cap < 2000) {
      if (usedPoints !== 0 || pointsInput !== "") {
        setUsedPoints(0);
        setPointsInput("");
      }
      return;
    }
    if (usedPoints > cap) {
      setUsedPoints(cap);
      setPointsInput(String(cap));
    }
  }, [availablePoints, payableBeforePoints]); // why: 금액/쿠폰/배송비 또는 보유 포인트 변동 시 유지





  return (

    <div style={{fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', Pretendard-Regular, ui-sans-serif, system-ui, -apple-system, 'Segoe UI`, Roboto,  sans-serif"}}>
      <div className="container-fluid page-header py-5" style={{ marginTop: 120 }}>
        <h1 className="text-center text-white display-6">공동구매 참여</h1>
        {/* <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><span>Pages</span></li>
          <li className="breadcrumb-item active text-white">Orders</li>
        </ol> */}
      </div>

      <div className="container-fluid py-5" style={{backgroundColor:"#ffffff"}}>
        <div className="container py-5">
          {status === "loading" && <div className="text-center py-5">최신 장바구니 불러오는 중…</div>}

          {status !== "loading" && (
            <div className="row g-4">
              {/* 좌측 영역 */}
              <div className="col-lg-8">
                {/* 배송지 */}
                <div className="rounded p-4 mb-4" style={{backgroundColor:"#f9f9f9"}}>
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">{userInfo.name} <span className="badge bg-secondary ms-2">기본 배송지</span></h5>
                    <button className="btn btn-sm btn-outline-secondary rounded-pill">배송지 변경</button>
                  </div>
                  <div className="text-muted mt-3">
                    <div>{userInfo.addr}</div>
                    <div>{phoneToString(userInfo.phone)}</div>
                  </div>
                  <input className="form-control form-control-sm mt-3" placeholder="배송 요청사항 입력 (예: 문 앞에 놔주세요)" value={delivery_message} onChange={onMessage}/>
                </div>

                {/* 주문 상품 */}
                <div className="rounded p-4 mb-3" style={{backgroundColor:"#f9f9f9"}}>
                  <h6 className="mb-3">주문 상품 {items.length}개</h6>
                  {items.length === 0 && (
                    <div className="text-center py-5">
                      {status === "error" ? "장바구니를 불러오지 못했습니다." : "장바구니가 비어 있습니다."}
                      <div className="mt-3">
                        <Link className="btn btn-outline-secondary rounded-pill px-4 py-2" to="/cart">
                          장바구니로 돌아가기
                        </Link>
                      </div>
                    </div>
                  )}

                  {items.map((it, i) => (
                    <div key={it._key} className="border-bottom pb-3 mb-3">
                      <div className="d-flex">
                        {it.img ? (
                          <img src={it.img} alt={it.title} className="rounded me-3" style={{width: 100, height: 100, objectFit: "cover"}} />
                        ) : (
                          <div className="rounded me-3 bg-white border" style={{width: 100, height: 100}} aria-label={`${it.name} no image`} />
                        )}
                        <div className="flex-grow-1">

                          <div className="fw-semibold">{it.name}</div>
                          <div className="text-muted small">
                            {it.summary}
                          </div>
                          
                          
                          <div className="text-muted small">{moneyKRW(it.price)} / {it.qty}개</div>
                          <div className="fw-semibold mt-1">{moneyKRW(it.price*it.qty)}</div>
                        </div>
                      </div>
                      {/* <div className="text-muted small d-flex align-items-center mt-2">
                        <i className="fa fa-truck me-2" aria-hidden="true" />
                        {it.eta}
                      </div> */}
                      {/* <button className="btn btn-sm btn-outline-secondary rounded-pill mt-2">쿠폰 사용</button> */}
                    </div>
                  ))}

                  {/* 장바구니 쿠폰 섹션 */}
                  <div className="mt-3">
                    <h6 className="mb-2">장바구니 쿠폰</h6>
                    <div className="row g-2 align-items-center">
                      <div className="col-sm">
                        <select
                          className="form-select"
                          value={selectedCoupon}
                          onChange={(e) => setSelectedCoupon(e.target.value)}
                        >
                          {/* <option value="NONE">쿠폰 선택 안 함</option>
                          <option value="5PCT">11월 정기 할인쿠폰 5%</option>
                          <option value="10PCT">신규회원 첫구매 10%</option> */}
                          <option value="NONE">쿠폰 선택 안 함</option>
                          {coupon.map((cp) => (
                            <option key={cp.couponId} value={cp.couponId}>
                              {cp.couponName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-auto text-muted small">할인 금액</div>
                      <div className="col-auto fw-semibold text-primary">-{moneyKRW(discountAmount)}</div>
                    </div>

                    {/* 적립금 사용 섹션 */}
                    <h6 className="mb-2 mt-3">적립금 사용</h6>
                    <div className="row g-2 align-items-center">
                      
                      <div className="col-12 col-sm-8">
                        <input
                          className="form-control"
                          inputMode="numeric"
                          placeholder="사용할 적립금 입력 (2,000원부터 사용 가능)"
                          value={pointsInput}
                          onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                            setPointsInput(onlyDigits);
                          }}
                        />
                      </div>
                      <div className="col-auto">
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-pill"
                          onClick={handleApplyPoints}
                        >
                          적용
                        </button>
                      </div>
                      <div className="col-auto">
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-pill"
                          onClick={handleUseAllPoints}
                        >
                          모두 사용
                        </button>
                      </div>
                      <div className="col-auto small text-muted">
                        보유 {moneyKRW(availablePoints)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측 결제 요약: sticky */}
              <div className="col-lg-4">
                <div className="bg-light rounded" style={{ position: "sticky", top: 120 }}>
                  <div className="p-4">
                    {/* 결제 금액 */}
                    <h5 className="mb-3">결제 금액</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">상품 금액</span>
                      <span>{moneyKRW(subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">할인 금액</span>
                      <span className="text-primary">-{moneyKRW(discountAmount)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">적립금 사용</span>
                      <span className="text-primary">-{moneyKRW(usedPoints)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted">배송비</span>
                      <span>{shipping === 0 ? "무료배송" : moneyKRW(shipping)}</span>
                    </div>

                    <div className="py-3 my-2 border-top border-bottom d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-muted small">총 결제 금액</div>
                        <div className="fw-semibold">
                          <span className="badge bg-danger-subtle text-danger me-2" style={{border: "1px solid #f1c0c0"}}>
                            {discountPercent}%
                          </span>
                          <span className="fs-5"><b style={{color:"#222222"}}>{moneyKRW(total)}</b></span>
                        </div>
                      </div>
                    </div>

                    {/* 적립 혜택 */}
                    <h6 className="mt-3">적립 혜택 <i className="fa fa-info-circle" aria-hidden="true" /></h6>
                    <div className="d-flex justify-content-between small text-muted mt-2">
                      <span>{userInfo.user_grade} 등급 : {userInfo.point_rate}% 적립</span><span>{moneyKRW(rewardBase)}</span>
                    </div>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>사진 리뷰 작성</span><span>최대 {moneyKRW(rewardReview)}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-semibold mt-2">
                      <span>적립 금액</span><span>최대 <b>{moneyKRW(rewardTotal)}</b></span>
                    </div>

                    {/* 프로모션 카드 예시 */}
                    <div className="border rounded p-3 mt-3 d-flex align-items-center justify-content-between">
                      <div className="small">
                        <div className="fw-semibold"><b style={{color:"#82c408ff"}}>FarmPay</b>로 결제 시</div>
                        <div className="text-muted">최대 <b>{moneyKRW(farmpayPoints)}</b> 적립</div>
                      </div>
                      <button className="btn btn-sm btn-outline-secondary rounded-pill">적립받기</button>
                    </div>

                    {/* 동의 & 결제 */}
                    <div className="mt-3 small text-muted">
                      이번 주문으로 받을 혜택은 <span className="fw-semibold">{moneyKRW(discountAmount+usedPoints)}</span>
                    </div>
                    <ul className="small text-muted mt-2 mb-3">
                      <li>주문 내용을 확인했으며 결제에 동의합니다.</li>
                      <li>회원님의 개인정보는 안전하게 관리됩니다.</li>
                      <li>통신판매중개자로서 상품·거래에 대한 책임은 입점사가 부담합니다.</li>
                    </ul>

                    <button
                      type="button"
                      className="btn btn-dark w-100 py-3"
                      disabled={items.length === 0}
                      onClick={handlePay}
                      style={{backgroundColor:"#82c408ff",borderColor:"#81c408"}}
                    >
                      {moneyKRW(total)} 결제하기
                    </button>

                    <div className="text-center mt-2">
                      <Link to="/cart" className="small text-decoration-underline">장바구니로 돌아가기</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>



  );

}