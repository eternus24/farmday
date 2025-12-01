// src/App.jsx
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Index from "./pages/index";
import NotFound404 from "./pages/404/404";
import Cart from "./pages/cart/cart";
import Contact from "./pages/contact/contact";
import Layout from "./layouts/Layout";

import ProducerLayout from "./pages/producer/ProducerLayout";
import ProducerDashboard from "./pages/producer/ProducerDashboard";
import ProducerOrdersPage from "./pages/producer/ProducerOrdersPage";
import ProducerOrderDetailPage from "./pages/producer/ProducerOrderDetailPage";
import ProducerProductsPage from "./pages/producer/ProducerProductsPage";
import ProducerProfilePage from "./pages/producer/ProducerProfilePage";

import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import PreSignupEmail from "./pages/signup/PreSignupEmail";

import { AuthContext } from "./contexts/AuthContext";
import { CartContext } from "./contexts/CartContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserList from "./pages/admin/AdminUserList";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLayout from "./layouts/AdminLayout";

import RequireAdmin from "./routes/RequireAdmin";
import GroupDealListPage from "./pages/groupdeal/GroupDealListPage";
import GroupDealDetailPage from "./pages/groupdeal/GroupDealDetailPage";

// 사용자 SHOP 관련
import ShopMain from './pages/shop/ShopMain';
import ShopDetail from "./pages/shop/ShopDetail";

//생산자 페이지
import StoreMyPage from './pages/mystore/StoreMyPage';
import StoreDashboard from './pages/mystore/StoreDashboard';
import StoreCreate from './pages/mystore/StoreCreate';
import StoreList from './pages/mystore/StoreList';
import StoreStatus from './pages/mystore/StoreStatus';
import StoreQuestion from './pages/mystore/StoreQuestion';

import Tables from './pages/tables/tables'
import Orders from './pages/orders/orders'
import CheckoutPage from './pages/orders/Checkout'
import { SuccessPage } from './pages/orders/Success'
import { FailPage } from './pages/orders/Fail'
import MyPage from './pages/mypage/mypage'
import ScrollToTop from "./components/common/ScrollToTop";
import Membership from "./pages/mypage/Membership";
import OrderDelivery from "./pages/mypage/OrderDelivery";
import ReviewWrite from "./components/review/ReviewWrite";

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

  // 🔹 loginUser에서 userNo / photo 먼저 꺼내두기
  let userNo = null;
  let photo = null;

  const loginUserStr = localStorage.getItem("loginUser");
  if (loginUserStr) {
    try {
      const user = JSON.parse(loginUserStr);
      userNo = user.userNo ?? null;
      photo = user.photo || null;
    } catch (e) {
      console.error("[App] loginUser 파싱 실패:", e);
    }
  }

  // 🔹 토큰이 아예 없으면 완전 비로그인 상태
  if (!token) {
    return { loggedIn: false, name: "손님", photo, userNo };
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  const payload = parseJwt(token);
  if (!payload) {
    return { loggedIn: false, name: "손님", photo, userNo };
  }

  const nameFromToken =
    payload.name || payload.username || payload.userId || payload.sub;

  // 🔹 photo가 아직 없으면 이전에 저장해둔 loginAvatar 사용
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
    userNo,          // ★ 여기 추가가 핵심
  };
}

function App() {
  const [auth, setAuth] = useState(() => getInitialAuth());
  const [cartAmount, setCartAmount] = useState(0);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  
  async function findCartAmount() {
    if (!auth.loggedIn) return;
    const user_id = JSON.parse(window.localStorage.getItem('loginUser')).userId;
    const res = await fetch(
      `${API_BASE}/cart/findCartAmountByUserId?user_id=${user_id}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const amount = await res.json();
    setCartAmount(Number(amount));
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <CartContext.Provider value={{ cartAmount, setCartAmount, findCartAmount }}>
        <BrowserRouter>
        <ScrollToTop/>
          <Routes>
            <Route path="/pre-signup" element={<PreSignupEmail />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/success" element={<SuccessPage/>} />
              <Route path="/orders/fail" element={<FailPage/>} />

              <Route path="/mypage" element={<MyPage/>}/>
              <Route path="/mypage/membership" element={<Membership/>} />
              <Route path="/mypage/orders/${order.orderId}/delivery" element={<OrderDelivery/>} />

              {/*  사용자 SHOP */}
              <Route path="/shop" element={<ShopMain />} />
              <Route path="/shop/detail/:id" element={<ShopDetail />} />

              {/* 생산자 페이지 */}
              <Route path="store/:producerId" element={<StoreMyPage />}>
                <Route index element={<StoreDashboard />} />
                <Route path="mainpro" element={<StoreDashboard />} />
                <Route path="list" element={<StoreList />} />
                <Route path="status" element={<StoreStatus />} />
                <Route path="question" element={<StoreQuestion />} />
                <Route path="upload" element={<StoreCreate />} />
              </Route>

              <Route path="/review/write/:order_item_id" element={<ReviewWrite/>}/>

              {/* ⭐ 공동구매 페이지 추가 */}
              <Route path="/groupdeal" element={<GroupDealListPage />} />
              <Route path="/groupdeal/:id" element={<GroupDealDetailPage />} />

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
              <Route path="*" element={<NotFound404 />} />
            </Route>

            <Route path="/tables" element={<Tables />} />
            <Route path="/checkout" element={<CheckoutPage/>} />

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
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;