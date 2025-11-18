// src/router.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx"; // 홈을 App으로 쓰는 경우

import Shop from "./pages/shop/shop.jsx";
import ShopDetail from "./pages/shop-detail/shop-detail.jsx";
import Contact from "./pages/contact/contact.jsx";
import Checkout from "./pages/checkout/checkout.jsx";
import Cart from "./pages/cart/cart.jsx";
import Testimonial from "./pages/testimonial/testimonial.jsx";
import NotFound404 from "./pages/404/404.jsx";
import Test from "./pages/test/test.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },          // 홈
  { path: "/shop", element: <Shop /> },
  { path: "/shop-detail", element: <ShopDetail /> },
  { path: "/contact", element: <Contact /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/cart", element: <Cart /> },
  { path: "/testimonial", element: <Testimonial /> },
  { path: "*", element: <NotFound404 /> },

  { path: "/test", element: <Test /> },
]);
