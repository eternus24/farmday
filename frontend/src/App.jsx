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

// 공동구매(소비자 + 판매자)
import GroupDealListPage from "./pages/groupdeal/GroupDealListPage";
import GroupDealDetailPage from "./pages/groupdeal/GroupDealDetailPage";
import GroupDealManagePage from "./pages/groupdeal/GroupDealManagePage";
import ProducerGroupDealCreatePage from "./pages/groupdeal/ProducerGroupDealCreatePage";
import PricePage from "./components/price/PricePageContent";

// 사용자 SHOP 관련
import ShopMain from './pages/shop/ShopMain';
import ShopDetail from "./pages/shop/ShopDetail";

//생산자 페이지
import StoreMyPage from './pages/mystore/StoreMyPage';
import StoreDashboard from './pages/mystore/StoreDashboard';
import StoreCreate from './pages/mystore/StoreCreate';
import StoreList from './pages/mystore/StoreList';
import StoreQuestion from './pages/mystore/StoreQuestion';

import Tables from './pages/tables/tables'
import Orders from './pages/orders/orders'
import CheckoutPage from './pages/orders/Checkout'
import { SuccessPage } from './pages/orders/Success'
import { FailPage } from './pages/orders/Fail'
import MyPage from './pages/mypage/mypage'
import ScrollToTop from "./components/common/ScrollToTop";
import OrderDelivery from "./pages/mypage/OrderDelivery";
import ReviewWrite from "./components/review/ReviewWrite";

import AwsTest from "./pages/mypage/AwsTest";
import FindId from "./pages/login/FindId";
import PasswordResetRequest from "./pages/login/PasswordResetRequest";
import PasswordResetForm from "./pages/login/PasswordResetForm";
import AdminBannerPage from "./pages/admin/AdminBannerPage";
import AdminNoticePage from "./pages/admin/AdminNoticePage";
import AdminProducerApprovalPage from "./pages/admin/AdminProducerApprovalPage";
import AdminProductManagePage from "./pages/admin/AdminProductManagePage";
import HelpCenter from "./pages/help/HelpCenter";
import StoreEditPage from "./pages/mystore/StoreEditPage";
import StoreReviewManage from "./pages/mystore/StoreReviewManage";
import StoreInfoPage from "./pages/mystore/StoreInfoPage";

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

  // 🔹 loginUser에서 userNo / photo / name 꺼내두기
  let userNo = null;
  let photo = null;
  let userName = null;
  let roleFromLoginUser = null;
  let loginUserId = null;

  const loginUserStr = localStorage.getItem("loginUser");
  if (loginUserStr) {
    try {
      const user = JSON.parse(loginUserStr);
      userNo = user.userNo ?? null;
      photo = user.photo || null;
      userName = user.name || user.username || user.userId || null;
      roleFromLoginUser = user.role || null;
      loginUserId = user.userId || null;
    } catch (e) {
      console.error("[App] loginUser 파싱 실패:", e);
    }
  }

  if (!token) {
    return { loggedIn: false, name: "손님", photo, userNo, role: null, userId: null, };
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  const payload = parseJwt(token);
  if (!payload) {
    return { loggedIn: false, name: "손님", photo, userNo, role: null, userId: null, };
  }

  const nameFromToken =
    payload.name || payload.username || payload.userId || payload.sub;

  // 🔹 loginUser.name 이 있으면 그걸 우선, 없으면 토큰에서
  const finalName = userName || nameFromToken || "손님";

  // 🔹 JWT 안에서 role 꺼내보기 (백엔드 구현에 따라 다를 수 있음)
  const roleFromToken =
    payload.role ||
    (Array.isArray(payload.roles) ? payload.roles[0] : null) ||
    (Array.isArray(payload.authorities) ? payload.authorities[0] : null) ||
    (Array.isArray(payload.auth) ? payload.auth[0] : null);

  const finalRole = roleFromLoginUser || roleFromToken || null;

  // 🔹 userId도 토큰에서 백업으로 한 번 더 시도 (혹시 loginUser가 비어있는 경우 대비)
  const idFromToken =
    payload.userId || payload.sub || payload.username || payload.name;

  const finalUserId = loginUserId || idFromToken || null;

  return {
    loggedIn: true,
    name: finalName,
    photo,
    userNo,
    role: finalRole,
    userId: finalUserId,
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
              <Route path="/mypage/orders/${order.orderId}/delivery" element={<OrderDelivery/>} />

              {/*  사용자 SHOP */}
              <Route path="/shop" element={<ShopMain />} />
              <Route path="/shop/detail/:id" element={<ShopDetail />} />

              {/* 생산자 페이지 */}
              <Route path="store/:producerId" element={<StoreMyPage />}>
                <Route index element={<StoreDashboard />} />
                <Route path="mainpro" element={<StoreDashboard />} />
                <Route path="list" element={<StoreList />} />
                <Route path="info" element={<StoreInfoPage/>} />
                <Route path="question" element={<StoreQuestion />} />
                <Route path="reviews" element={<StoreReviewManage/>}/>
                <Route path="upload" element={<StoreEditPage />} />
              </Route>

              <Route path="/review/write/:order_item_id" element={<ReviewWrite/>}/>

              {/* 공동구매(소비자 + 판매자) */}
              <Route path="/groupdeal" element={<GroupDealListPage />} />
              <Route
                path="/groupdeal/new"
                element={<ProducerGroupDealCreatePage />}
              />
              <Route
                path="/groupdeal/:groupDealId"
                element={<GroupDealDetailPage />}
              />
              <Route
                path="/producer/groupdeal/:groupDealId/manage"
                element={<GroupDealManagePage />}
              />

              <Route path="/price" element={<PricePage />} />

              {/* 생산자 마이페이지 */}
              <Route path="/producer" element={<ProducerLayout />}>
                <Route index element={<ProducerDashboard />} />
                <Route path="orders" element={<ProducerOrdersPage />} />
                <Route path="orders/:orderId" element={<ProducerOrderDetailPage />} />
                <Route path="products" element={<ProducerProductsPage />} />
                <Route path="profile" element={<ProducerProfilePage />} />
                <Route path="create" element={<StoreCreate />} />
              </Route>

              <Route path="/help" element={<HelpCenter/>}/>

              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/find-id" element={<FindId />} />
              <Route path="/password/reset-request" element={<PasswordResetRequest />} />
              <Route path="/reset-password" element={<PasswordResetForm />} />
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
              <Route
                path="banners"
                element={
                  <RequireAdmin>
                    <AdminBannerPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="notices"
                element={
                  <RequireAdmin>
                    <AdminNoticePage />
                  </RequireAdmin>
                }
              />
              <Route
                path="producers"
                element={
                  <RequireAdmin>
                    <AdminProducerApprovalPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="products"
                element={
                  <RequireAdmin>
                    <AdminProductManagePage />
                  </RequireAdmin>
                }
              />
            </Route>
            <Route path="/awstest" element={<AwsTest/>}/>
          </Routes>
        </BrowserRouter>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;