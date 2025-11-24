// ==============================================
// frontend/src/pages/mypage/mypage.jsx
// ==============================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/cart.css";

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
  const typingTimer = useRef(null);

  const { protocol, hostname } = window.location;
  const API_BASE = `${protocol}//${hostname}:8080`;
  const user_id = "yoonho";

  const navigate = useNavigate();

  async function fetchOverview(signal) {
    try {
      const res = await fetch(
        `${API_BASE}/mypage/overview?user_id=${encodeURIComponent(user_id)}`,
        { credentials: "include", signal, cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOverview({
        name: data?.name ?? "",
        grade: data?.user_grade ?? data?.grade ?? "",
        points: Math.max(0, Math.round(Number(data?.points ?? 0))),
        couponCount: Math.max(0, Number(data?.coupon_count ?? data?.couponCount ?? 0)),
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        // why: 백엔드 미구현 시도 대비 — 빈상태 유지
        setOverview((o) => ({ ...o, name: o.name || "회원" }));
      }
    }
  }

  async function fetchOrders(signal, m = months, q = query) {
    setStatus("loading");
    try {
      const url = new URL(`${API_BASE}/orders/list`);
      url.searchParams.set("user_id", user_id);
      url.searchParams.set("months", String(m));
      if (q) url.searchParams.set("q", q);

      const res = await fetch(url.toString(), {
        credentials: "include",
        signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mapped = (Array.isArray(data) ? data : []).map((row, idx) => {
        const id = row?.order_id ?? row?.id ?? `order-${idx}`;
        const items = Array.isArray(row?.items) ? row.items : [];
        const sum = Number(row?.total_amount ?? row?.total ?? 0);
        const dt = row?.order_date ?? row?.date ?? "";
        const status = row?.status ?? "주문완료";
        return {
          id: String(id),
          date: String(dt),
          status: String(status),
          total: Math.max(0, Math.round(sum)),
          items: items.slice(0, 3).map((it, i2) => ({
            id: String(it?.product_id ?? it?.id ?? `${id}-p${i2}`),
            name: it?.name ?? it?.product_name ?? "상품",
            qty: Math.max(1, Number(it?.qty ?? it?.quantity ?? 1)),
            img: it?.image ?? it?.img ?? "",
          })),
          moreCount: Math.max(0, (items?.length || 0) - 3),
        };
      });

      setOrders(mapped);
      setStatus("ready");
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load mypage orders failed:", e);
      setOrders([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    fetchOverview(ac.signal);
    fetchOrders(ac.signal);
    return () => ac.abort();
  }, [API_BASE, user_id]); // why: 호스트/사용자 변경 대응

  useEffect(() => {
    // 검색 인풋 디바운스
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setQuery(searchInput.trim());
    }, 300);
    return () => typingTimer.current && clearTimeout(typingTimer.current);
  }, [searchInput]);

  useEffect(() => {
    const ac = new AbortController();
    fetchOrders(ac.signal, months, query);
    return () => ac.abort();
  }, [months, query]);

  const emptyText = useMemo(() => `${months}개월간의 주문 내역이 없습니다.`, [months]);

  return (
    <div
      style={{
        fontFamily:
          "'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',Pretendard,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
      }}
    >
      <div className="container-fluid" style={{ marginTop: 80, backgroundColor: "#f7f8fa" }}>
        <div className="container py-4">
          <div className="row g-4">
            {/* 좌측 사이드바 */}
            <aside className="col-lg-3">
              {/* 프로필/요약 카드 */}
              <div className="border rounded-3 bg-white p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-semibold">
                    반가워요!! <span className="text-primary">{overview.name || "회원"}</span>님
                  </div>
                  <span className="badge text-bg-light">{overview.grade || "LV.1"}</span>
                </div>
                <div className="small text-muted mt-2">
                  보유 적립금 <b className="text-dark">{moneyKRW(overview.points)}</b>
                </div>
                <div className="small text-muted">
                  보유 쿠폰 <b className="text-dark">{overview.couponCount}</b>장
                </div>
                <div className="mt-2">
                  <Link className="btn btn-sm btn-outline-secondary rounded-pill" to="/mypage/coupons">
                    쿠폰함 보기
                  </Link>
                </div>
              </div>

              {/* 메뉴 */}
              <nav className="border rounded-3 bg-white p-3">
                <div className="mb-3">
                  <div className="fw-semibold mb-2">주문내역</div>
                  <ul className="list-unstyled ms-1 small">
                    <li className="mb-2">
                      <Link className="link-dark text-decoration-none fw-semibold" to="/mypage/orders">
                        주문 내역
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/coupons">
                        쿠폰
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/wishlist">
                        찜한 상품
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/frequent">
                        자주 산 상품
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold mb-2">쇼핑</div>
                  <ul className="list-unstyled ms-1 small">
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/payments">
                        결제수단 · 페이
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/returns">
                        취소 · 반품 내역
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/reviews">
                        상품 후기
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/gifts">
                        선물 내역
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/support">
                        상담 문의
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold mb-2">혜택</div>
                  <ul className="list-unstyled ms-1 small">
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/membership">
                        멤버십
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold mb-2">내 정보관리</div>
                  <ul className="list-unstyled ms-1 small">
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/addresses">
                        배송지 관리
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/profile">
                        회원 정보 관리
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/mypage/vip">
                        VIP 예상 등급
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="fw-semibold mb-2">서비스 안내</div>
                  <ul className="list-unstyled ms-1 small">
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/help/purplebox">
                        퍼플박스
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link className="link-secondary text-decoration-none" to="/help/vip">
                        VIP 안내
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </aside>

            {/* 우측 콘텐츠 */}
            <section className="col-lg-9">
              <div className="border rounded-3 bg-white p-4">
                {/* 타이틀 + 필터 */}
                <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center">
                  <h5 className="mb-0">주문 내역</h5>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      aria-label="기간 선택"
                      style={{ width: 120 }}
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value))}
                    >
                      <option value={3}>3개월</option>
                      <option value={6}>6개월</option>
                      <option value={12}>1년</option>
                    </select>
                    <div className="input-group input-group-sm" style={{ width: 260 }}>
                      <input
                        className="form-control"
                        placeholder="상품명으로 검색해보세요"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        aria-label="주문 검색"
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setQuery(searchInput.trim())}
                        aria-label="검색"
                      >
                        <i className="fa fa-search" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 컨텐츠 */}
                <div className="mt-4">
                  {status === "loading" && (
                    <div className="py-5 text-center text-muted">주문 내역을 불러오는 중…</div>
                  )}

                  {status === "error" && orders.length === 0 && (
                    <div className="py-5 text-center">
                      <div className="mb-2">주문 내역을 불러오지 못했습니다.</div>
                      <button
                        className="btn btn-outline-secondary rounded-pill"
                        onClick={() => {
                          const ac = new AbortController();
                          fetchOrders(ac.signal);
                        }}
                      >
                        다시 시도
                      </button>
                    </div>
                  )}

                  {status !== "loading" && orders.length === 0 && (
                    <div className="text-center py-5">
                      <div
                        className="mx-auto mb-3"
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 12,
                          background: "#f2f3f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                        }}
                        aria-hidden="true"
                      >
                        🧾
                      </div>
                      <div className="mb-2">{emptyText}</div>
                      <Link to="/best" className="btn btn-outline-secondary rounded-pill">
                        베스트 상품 보기
                      </Link>
                    </div>
                  )}

                  {orders.length > 0 && (
                    <div className="vstack gap-3">
                      {orders.map((od) => (
                        <div key={od.id} className="border rounded-3 p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="small text-muted">
                              <span className="me-2">주문번호 {od.id}</span>
                              <span>{od.date}</span>
                            </div>
                            <span className="badge text-bg-light">{od.status}</span>
                          </div>

                          <div className="mt-3 d-flex flex-wrap gap-3 align-items-center">
                            {od.items.map((it) =>
                              it.img ? (
                                <img
                                  key={it.id}
                                  src={it.img}
                                  alt={it.name}
                                  style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  key={it.id}
                                  className="bg-light border"
                                  style={{ width: 72, height: 72, borderRadius: 8 }}
                                  aria-label={`${it.name} 이미지 없음`}
                                />
                              )
                            )}
                            {od.moreCount > 0 && (
                              <div className="small text-muted">외 {od.moreCount}개</div>
                            )}
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <div className="fw-semibold">결제금액 {moneyKRW(od.total)}</div>
                            <div className="d-flex gap-2">
                              <Link
                                to={`/orders/detail/${od.id}`}
                                className="btn btn-sm btn-outline-secondary rounded-pill"
                              >
                                주문 상세
                              </Link>
                              <Link
                                to={`/orders/reorder/${od.id}`}
                                className="btn btn-sm btn-dark rounded-pill"
                                style={{ backgroundColor: "#82c408ff", borderColor: "#81c408" }}
                              >
                                다시 구매
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
