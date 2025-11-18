// src/pages/cart/CartPage.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom"

/**
 * 왜 .js인가? — 요청에 따라 .jsx 대신 .js 확장자를 사용.
 * 주의: Bootstrap/FontAwesome CSS는 전역(index.html 등)에서 로드 필요.
 */
function money(n) {
  return `$${n.toFixed(2)}`;
}

const INITIAL_ITEMS = [
  { id: "banana", name: "Big Banana", price: 2.99, qty: 1, img: "img/vegetable-item-3.png" },
  { id: "potato", name: "Potatoes", price: 2.99, qty: 1, img: "img/vegetable-item-5.jpg" },
  { id: "broccoli", name: "Awesome Brocoli", price: 2.99, qty: 1, img: "img/vegetable-item-2.jpg" }
];

export default function Cart() {
  // const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false); // 왜: 부트스트랩 JS 없이 접힘 제어
  const [showSearch, setShowSearch] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(true);

  // 스피너: 최초 300ms 후 사라짐(원본 UX 흉내)
  useEffect(() => {
    const t = setTimeout(() => setLoadingSpinner(false), 300);
    return () => clearTimeout(t);
  }, []);

  // ESC로 모달 닫기
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cartQty = useMemo(
    () => items.reduce((sum, it) => sum + it.qty, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );
  const shipping = items.length ? 3 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const updateQty = useCallback((id, nextQty) => {
    setItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: Math.min(999, Math.max(1, nextQty || 1)) } : it))
    );
  }, []);

  const inc = useCallback((id) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.min(999, it.qty + 1) } : it)));
  }, []);

  const dec = useCallback((id) => {
    setItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const applyCoupon = useCallback(() => {
    // 예시: SAVE10(10%), FREE(배송 0), BANANA1($1 off if banana exists)
    if (!coupon.trim()) return setDiscount(0);
    const code = coupon.trim().toUpperCase();
    if (code === "SAVE10") {
      setDiscount(subtotal * 0.1);
    } else if (code === "FREE") {
      setDiscount(shipping); // 배송비 만큼 할인
    } else if (code === "BANANA1" && items.find((i) => i.id === "banana")) {
      setDiscount(1);
    } else {
      setDiscount(0);
      alert("유효하지 않은 쿠폰입니다.");
    }
  }, [coupon, subtotal, shipping, items]);

  // const proceedCheckout = useCallback(() => {
  //   try {
  //     navigate("/checkout");
  //   } catch {
  //     // 라우터 미구성 시 무시
  //   }
  // }, [navigate]);

  const scrollTop = useCallback((e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div>
      {/* Header */}

      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5" style={{ marginTop: 120 }}>
        <h1 className="text-center text-white display-6">Cart</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <a href="#">Home</a>
          </li>
          <li className="breadcrumb-item">
            <a href="#">Pages</a>
          </li>
         <li className="breadcrumb-item active text-white">Cart</li>
        </ol>
      </div>
      {/* Single Page Header End */}

      {/* Cart Page Start */}
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Products</th>
                  <th scope="col">Name</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                  <th scope="col">Handle</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <th scope="row">
                      <div className="d-flex align-items-center">
                        <img
                          src={it.img}
                          className="img-fluid me-5 rounded-circle"
                          style={{ width: 80, height: 80 }}
                          alt={it.name}
                        />
                      </div>
                    </th>
                    <td>
                      <p className="mb-0 mt-4">{it.name}</p>
                    </td>
                    <td>
                      <p className="mb-0 mt-4">{money(it.price)}</p>
                    </td>
                    <td>
                      <div className="input-group quantity mt-4" style={{ width: 100 }}>
                        <div className="input-group-btn">
                          <button
                            className="btn btn-sm btn-minus rounded-circle bg-light border"
                            onClick={() => dec(it.id)}
                          >
                            <i className="fa fa-minus" />
                          </button>
                        </div>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center border-0"
                          value={it.qty}
                          min={1}
                          max={999}
                          onChange={(e) => updateQty(it.id, parseInt(e.target.value, 10))}
                        />
                        <div className="input-group-btn">
                          <button
                            className="btn btn-sm btn-plus rounded-circle bg-light border"
                            onClick={() => inc(it.id)}
                          >
                            <i className="fa fa-plus" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="mb-0 mt-4">{money(it.price * it.qty)}</p>
                    </td>
                    <td>
                      <button
                        className="btn btn-md rounded-circle bg-light border mt-4"
                        onClick={() => removeItem(it.id)}
                        aria-label={`remove ${it.name}`}
                      >
                        <i className="fa fa-times text-danger" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      Your cart is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 d-flex align-items-start">
            <input
              type="text"
              className="border-0 border-bottom rounded me-5 py-3 mb-4"
              placeholder="Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button
              className="btn border-secondary rounded-pill px-4 py-3 text-primary"
              type="button"
              onClick={applyCoupon}
            >
              Apply Coupon
            </button>
          </div>

          <div className="row g-4 justify-content-end">
            <div className="col-8" />
            <div className="col-sm-8 col-md-7 col-lg-6 col-xl-4">
              <div className="bg-light rounded">
                <div className="p-4">
                  <h1 className="display-6 mb-4">
                    Cart <span className="fw-normal">Total</span>
                  </h1>
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="mb-0 me-4">Subtotal:</h5>
                    <p className="mb-0">{money(subtotal)}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0 me-4">Shipping</h5>
                    <div>
                      <p className="mb-0">Flat rate: {money(shipping)}</p>
                    </div>
                  </div>
                  {discount > 0 && (
                    <div className="d-flex justify-content-between mt-2">
                      <h5 className="mb-0 me-4">Discount</h5>
                      <p className="mb-0">- {money(discount)}</p>
                    </div>
                  )}
                  <p className="mb-0 text-end">Shipping to Ukraine.</p>
                </div>
                <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                  <h5 className="mb-0 ps-4 me-4">Total</h5>
                  <p className="mb-0 pe-4">{money(total)}</p>
                </div>
                {/* <button
                  className="btn border-secondary rounded-pill px-4 py-3 text-primary text-uppercase mb-4 ms-4"
                  type="button"
                  onClick={proceedCheckout}
                >
                  Proceed Checkout
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Cart Page End */}

      {/* Footer */}
    </div>
  );
}
