// src/App.jsx
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Index from "./pages/index";
import NotFound404 from "./pages/404/404";
import Shop from "./pages/shop/shop";
import Cart from "./pages/cart/cart";
import Checkout from "./pages/checkout/checkout";
import Contact from "./pages/contact/contact";
import ShopDetail from "./pages/shop-detail/shop-detail";
import Testimonial from "./pages/testimonial/testimonial";
import Layout from "./layouts/Layout";
import Test from "./pages/test/test";
import ProducerLayout from "./pages/producer/ProducerLayout";
import ProducerDashboard from "./pages/producer/ProducerDashboard";
import ProducerOrdersPage from "./pages/producer/ProducerOrdersPage";
import ProducerOrderDetailPage from "./pages/producer/ProducerOrderDetailPage";
import ProducerProductsPage from "./pages/producer/ProducerProductsPage";
import ProducerProfilePage from "./pages/producer/ProducerProfilePage";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import PreSignupEmail from "./pages/signup/PreSignupEmail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLayout from "./layouts/AdminLayout";
import RequireAdmin from "./routes/RequireAdmin";

import { AuthContext } from "./contexts/AuthContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserList from "./pages/admin/AdminUserList";

// JWT 파싱 헬퍼
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("[App] JWT 파싱 실패:", e);
    return null;
  }
}

// 앱 시작 시 한 번만 localStorage 보고 초기 로그인 상태 계산
function getInitialAuth() {
  let token = localStorage.getItem("accessToken");

  if (!token) {
    return { loggedIn: false, name: "손님", photo: null };
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  const payload = parseJwt(token);
  if (!payload) {
    return { loggedIn: false, name: "손님", photo: null };
  }

  const nameFromToken =
    payload.name || payload.username || payload.userId || payload.sub;

   // 🔹 photo 값 찾기
  let photo = null;

  // 1) loginUser에 실제 photo가 있으면 우선
  const loginUserStr = localStorage.getItem("loginUser");
  if (loginUserStr) {
    try {
      const user = JSON.parse(loginUserStr);
      photo = user.photo || null;
    } catch (e) {
      console.error("[App] loginUser 파싱 실패:", e);
    }
  }

  // 2) 없으면 이전에 고른 야채 아바타 사용
  if (!photo) {
    const storedAvatar = localStorage.getItem("loginAvatar");
    if (storedAvatar) {
      photo = storedAvatar;
    }
  }

  return {
    loggedIn: true,
    name: nameFromToken || "손님",
    photo,
  };
}

function App() {
  const [auth, setAuth] = useState(() => getInitialAuth());

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <BrowserRouter>
        <Routes>
          <Route path="/pre-signup" element={<PreSignupEmail />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shop-detail" element={<ShopDetail />} />
            <Route path="/testimonial" element={<Testimonial />} />

            {/* 생산자 마이페이지 */}
            <Route path="/producer" element={<ProducerLayout />}>
              <Route index element={<ProducerDashboard />} />
              <Route path="orders" element={<ProducerOrdersPage />} />
              <Route path="orders/:orderId" element={<ProducerOrderDetailPage />} />
              <Route path="products" element={<ProducerProductsPage />} />
              <Route path="profile" element={<ProducerProfilePage />} />
            </Route>

            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/test" element={<Test />} />
            <Route path="*" element={<NotFound404 />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="login" element={<AdminLogin />} />
            <Route path="signup" element={<AdminSignup />} />

            <Route
              index
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="users"
              element={
                <RequireAdmin>
                  <AdminUserList />
                </RequireAdmin>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;