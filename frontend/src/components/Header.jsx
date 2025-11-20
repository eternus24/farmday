// src/components/Header.jsx
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[Header] JWT 파싱 실패:', e);
    return null;
  }
}

export default function Header() {
  const [userName] = useState(() => {
    // 1. 토큰 가져오기
    let token = localStorage.getItem('accessToken');
    console.log('[Header] raw token from localStorage:', token);

    if (!token) {
      console.log('[Header] 토큰 없음 → 손님');
      return '손님';
    }

    // 2. Bearer 제거
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // 3. 페이로드 파싱
    const payload = parseJwt(token);
    console.log('[Header] decoded payload:', payload);

    if (!payload) {
      console.log('[Header] payload 없음 → 손님');
      return '손님';
    }

    // 4. 이름 후보들
    const nameFromToken =
      payload.name ||
      payload.username ||
      payload.userId ||
      payload.sub; // 스프링 시큐리티 기본 username

    console.log('[Header] nameFromToken:', nameFromToken);

    if (!nameFromToken) {
      console.log('[Header] nameFromToken 없음 → 손님');
    }

    return nameFromToken || '손님';
  });

  return (
    <>
      {/* Spinner Start */}
      {/* <div
        id="spinner"
        className="show w-100 vh-100 bg-white position-fixed translate-middle top-50 start-50  d-flex align-items-center justify-content-center"
      >
        <div className="spinner-grow text-primary" role="status"></div>
      </div> */}
      {/* Spinner End */}

      <div className="container-fluid fixed-top">
        {/* Navbar */}
        <div className="container px-0">
          <nav className="navbar navbar-light bg-white navbar-expand-xl">
            <Link to="/" className="navbar-brand">
              <h1 className="text-primary display-6">Fruitables</h1>
            </Link>

            {/* ... 토글러/Collapse ... */}
            <button
              className="navbar-toggler py-2 px-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarCollapse"
            >
              <span className="fa fa-bars text-primary"></span>
            </button>

            <div className="collapse navbar-collapse bg-white" id="navbarCollapse">
              <div className="navbar-nav mx-auto">
                <NavLink to="/" className="nav-item nav-link">Home</NavLink>
                <NavLink to="/shop" className="nav-item nav-link">Shop</NavLink>
                <NavLink to="/shop-detail" className="nav-item nav-link">Shop Detail</NavLink>

                <div className="nav-item dropdown">
                  {/* dropdown 토글은 그대로 a 태그 사용 (부트스트랩 data-bs-toggle 용) */}
                  <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Pages</a>
                  <div className="dropdown-menu m-0 bg-secondary rounded-0">
                    <NavLink to="/cart" className="dropdown-item">Cart</NavLink>
                    <NavLink to="/checkout" className="dropdown-item">Checkout</NavLink>
                    <NavLink to="/testimonial" className="dropdown-item">Testimonial</NavLink>
                    {/* 404는 별도 라우트(/404)를 하나 더 두거나, 테스트용 링크면 이대로 둬도 됨 */}
                    <NavLink to="/404" className="dropdown-item">404 Page</NavLink>
                  </div>
                </div>

                <NavLink to="/contact" className="nav-item nav-link">Contact</NavLink>
              </div>

              {/* ... 우측 아이콘 영역 Start */}
              <div className="d-flex m-3 me-0">
              <button
                className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-4"
                data-bs-toggle="modal"
                data-bs-target="#searchModal"
              >
                <i className="fas fa-search text-primary"></i>
              </button>
              <a href="#" className="position-relative me-4 my-auto">
                <i className="fa fa-shopping-bag fa-2x"></i>
                <span
                  className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1"
                  style={{ top: -5, left: 15, height: 20, minWidth: 20 }}
                >
                  3
                </span>
              </a>

              <div className="d-flex align-items-center my-auto">
                <i className="fas fa-user fa-2x"></i>
                <span
                  className="ms-2"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  {userName}
                </span>
              </div>
            </div>
              {/* ... 우측 아이콘 영역 End */}

            </div>
          </nav>
        </div>
      </div>

      {/* Modal Search Start */}
      <div className="modal fade" id="searchModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content rounded-0">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Search by keyword
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body d-flex align-items-center">
              <div className="input-group w-75 mx-auto d-flex">
                <input type="search" className="form-control p-3" placeholder="keywords" aria-describedby="search-icon-1" />
                <span id="search-icon-1" className="input-group-text p-3">
                  <i className="fa fa-search"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Search End */}
    </>
  );
}
