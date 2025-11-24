// ==============================================
// frontend/src/pages/cart/cart.jsx
// ==============================================
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/cart.css";
import Swal from "sweetalert2";

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0원';

  const int = Math.trunc(num); // 소수점 이하 표시 안함(버림)
  return `${int.toLocaleString('ko-KR')} 원`;
}

export default function Cart() {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const { protocol, hostname } = window.location;
  const API_BASE = `${protocol}//${hostname}:8080`;
  const user_id = "yoonho";

  // 왜: 초기 조회와 삭제 후 재조회 로직을 한 군데로
  async function reloadCart(signal) {
    setStatus("loading");
    try {
      const res = await fetch(
        `${API_BASE}/cart/findCartByUserId?user_id=${user_id}`,
        { credentials: "include", signal, cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mapped = (Array.isArray(data) ? data : [])
        .map((row, idx) => {
          const cartId = row?.cart_id;
          const pid = row?.product_id;
          if (pid == null) return null;
          const qtyNum = Number.parseInt(row?.quantity, 10);
          const qty = Number.isFinite(qtyNum) && qtyNum > 0 ? Math.min(999, qtyNum) : 1;
          return {
            _key: cartId != null ? String(cartId) : `row#${idx}`,
            cartId: cartId != null ? Number(cartId) : null,
            id: String(pid),
            name: String(row.product_name),
            qty,
            price: row.price,
            img: row.main_image,
          };
        })
        .filter(Boolean);

      setItems(mapped);
      setStatus("ready");
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load cart failed:", e);
      setItems([]);
      setStatus("error");
    }
  }

  // 왜: 결제/옵션 저장에서 중복되는 POST 페이로드 전송 통합
  async function persistCart(curItems) {
    const payload = curItems.map((it) => ({
      product_id: Number(it.id),
      quantity: Number(it.qty),
    }));
    const res = await fetch(`${API_BASE}/cart/updateCart/${user_id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }

  useEffect(() => {
    const ac = new AbortController(); // 왜: StrictMode 2회 마운트 대비
    reloadCart(ac.signal);
    return () => ac.abort();
  }, [API_BASE, user_id]);

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items]);
  const shipping = subtotal>=40000 ? 3000 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const clamp = (n) => Math.min(999, Math.max(1, n || 1));

  function updateQty(id, nextQty) {
    const n = clamp(Number(nextQty));
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: n } : it)));
  }

  function inc(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: clamp(it.qty + 1) } : it)));
  }

  function dec(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: clamp(it.qty - 1) } : it)));
  }

  async function removeItem(cartId) {
    if (!cartId || saving) return;

    const result = await Swal.fire({
      title: "",
      text: "장바구니에서 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const delRes = await fetch(`${API_BASE}/cart/deleteCart/${cartId}`, {
        method: "get",
        credentials: "include",
      });
      if (!delRes.ok) throw new Error(`DELETE HTTP ${delRes.status}`);

      await reloadCart(); // 재조회 공통 로직 사용

      await Swal.fire({
        title: "",
        text: "삭제되었습니다.",
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
      setSaving(false);
    }
  }

  function applyCoupon() {
    if (!coupon.trim()) return setDiscount(0);
    const code = coupon.trim().toUpperCase();
    if (code === "SAVE10") setDiscount(subtotal * 0.1);
    else if (code === "FREE") setDiscount(shipping);
    else setDiscount(0);
  }

  async function handleCheckout() {
    if (!items.length || saving) return;
    setSaving(true);
    try {
      await persistCart(items);
      navigate("/orders", { state: { ok: true, updated: items.length, total, shipping }, replace: false });
    } catch (e) {
      console.error("checkout failed:", e);
      navigate("/orders", { state: { ok: false, error: e?.message || "Unknown error", total }, replace: true });
    } finally {
      setSaving(false);
    }
  }

  async function updateCart() {
    if (!items.length || saving) return;
    setSaving(true);
    try {
      await persistCart(items);
      // 필요시 성공 토스트 추가 가능
    } catch (e) {
      console.error("update cart failed:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', Pretendard-Regular, ui-sans-serif, system-ui, -apple-system, 'Segoe UI`, Roboto,  sans-serif"}}>
    {/* <div> */}
      <div className="container-fluid page-header py-5" style={{ marginTop: 120 }}>
        <h1 className="text-center text-white display-6">Cart</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="#">Home</a></li>
          <li className="breadcrumb-item"><a href="#">Pages</a></li>
          <li className="breadcrumb-item active text-white">Cart</li>
        </ol>
      </div>

      <div className="container-fluid py-5">
        <div className="container py-5">
          {status === "loading" && <div className="text-center py-5">Loading cart…</div>}
          {status !== "loading" && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Products</th><th>Name</th><th>Price</th><th>Quantity</th><th>Total</th><th>Handle</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it._key}>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          {it.img ? (
                            <img src={it.img} className="img-fluid me-5" style={{ width: 80, height: 80 , borderRadius:10}} alt={it.name} />
                          ) : (
                            <div className="me-5 rounded-circle bg-light" style={{ width: 80, height: 80 }} aria-label={`${it.name} no image`} />
                          )}
                        </div>
                      </th>
                      <td><p className="mb-0 mt-4">{it.name}</p></td>
                      <td><p className="mb-0 mt-4">{money(it.price)}</p></td>
                      <td style={{ width: 200 }}>
                        <div className="input-group quantity mt-4" style={{ width: 130 }}>
                          <div className="input-group-btn">
                            <button className="btn btn-sm btn-minus rounded-circle bg-light border" onClick={() => dec(it.id)} disabled={saving}><i className="fa fa-minus" /></button>
                          </div>
                          <input
                            type="number"
                            className="form-control form-control-sm text-center border-0 numberInput"
                            value={it.qty}
                            min={1}
                            max={999}
                            onChange={(e) => updateQty(it.id, parseInt(e.target.value, 10))}
                            disabled={saving}
                          />
                          <div className="input-group-btn">
                            <button className="btn btn-sm btn-plus rounded-circle bg-light border" onClick={() => inc(it.id)} disabled={saving}><i className="fa fa-plus" /></button>
                          </div>
                        </div>
                      </td>
                      <td style={{ width: 100 }}><p className="mb-0 mt-4">{money(it.price * it.qty)}</p></td>
                      <td>
                        <button
                          className="btn btn-md rounded-circle bg-light border mt-4"
                          onClick={() => it.cartId && removeItem(it.cartId)}
                          aria-label={`remove ${it.name}`}
                          disabled={saving}
                          title={it.cartId ? `delete cart #${it.cartId}` : "no cart id"}
                        >
                          <i className="fa fa-times text-danger" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        {status === "error" ? "Failed to load cart." : "Your cart is empty."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 d-flex align-items-start" style={{width:400}}>
            {/* <input type="text" className="border-0 border-bottom rounded me-5 py-3 mb-4"
              placeholder="Coupon Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} disabled={saving} />
              <button className="btn btn-outline-secondary ms-2" onClick={applyCoupon} disabled={saving}>Apply</button> */}
            <button className="btn border-secondary rounded-pill px-4 py-3 text-primary" type="button" onClick={updateCart} disabled={saving}>
              현재 옵션 저장
            </button>
          </div>

          <div className="row g-4 justify-content-end">
            <div className="col-8" />
            <div className="col-sm-8 col-md-7 col-lg-6 col-xl-4">
              <div className="bg-light rounded">
                <div className="p-4">
                  <h1 className="display-6 mb-4">Cart <span className="fw-normal">Total</span></h1>
                  <div className="d-flex justify-content-between mb-4"><h5 className="mb-0 me-4">Subtotal:</h5><p className="mb-0">{money(subtotal)}</p></div>
                  <div className="d-flex justify-content-between"><h5 className="mb-0 me-4">Shipping</h5><div><p className="mb-0">{money(shipping)}</p></div></div>
                </div>
                <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                  <h5 className="mb-0 ps-4 me-4">Total</h5><p className="mb-0 pe-4">{money(total)}</p></div>
                <div className="p-4 d-grid">
                  <button type="button" className="btn btn-primary rounded-pill py-3"
                          onClick={handleCheckout} disabled={saving || !items.length}>
                    {saving ? "구매 처리 중..." : "구매"}
                  </button>
                </div>
              </div>
              <div className="text-muted small mt-2 px-2">구매 시 현재 수량이 서버에 저장됩니다.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
