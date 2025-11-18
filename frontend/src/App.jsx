
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

  import Index from './pages/index'
  import NotFound404 from './pages/404/404'
  import Shop from './pages/shop/shop'
  import Cart from './pages/cart/cart';
  import Checkout from './pages/checkout/checkout';
  import Contact from './pages/contact/contact';
  import ShopDetail from './pages/shop-detail/shop-detail';
  import Testimonial from './pages/testimonial/testimonial';
  import Layout from './layouts/Layout'
  import Test from './pages/test/test'
  import ProducerLayout from './pages/producer/ProducerLayout'
  import ProducerDashboard from './pages/producer/ProducerDashboard'
  import ProducerOrdersPage from './pages/producer/ProducerOrdersPage'
  import ProducerOrderDetailPage from './pages/producer/ProducerOrderDetailPage'
  import ProducerProductsPage from './pages/producer/ProducerProductsPage'
  import ProducerProfilePage from './pages/producer/ProducerProfilePage'
import Login from './pages/login/Login'
import Signup from './pages/signup/Signup'
import PreSignupEmail from './pages/signup/PreSignupEmail'

 function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop-detail" element={<ShopDetail />} />
          <Route path="/testimonial" element={<Testimonial />} />

                    {/* ✅ 생산자 마이페이지 라우트 추가 */}
          <Route path="/producer" element={<ProducerLayout />}>
            {/* /producer  → 대시보드 */}
            <Route index element={<ProducerDashboard />} />

            {/* /producer/orders  → 판매관리 메인(신규/완료/매출 탭) */}
            <Route path="orders" element={<ProducerOrdersPage />} />

            {/* /producer/orders/:orderId  → 주문 처리 페이지 */}
            <Route path="orders/:orderId" element={<ProducerOrderDetailPage />} />

            {/* /producer/products  → 상품 관리 */}
            <Route path="products" element={<ProducerProductsPage />} />

            {/* /producer/profile  → 프로필 관리 */}
            <Route path="profile" element={<ProducerProfilePage />} />
          </Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pre-signup" element={<PreSignupEmail />} />
          <Route path="*" element={<NotFound404 />} />
          <Route path="/test" element={<Test />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
 }
 export default App
