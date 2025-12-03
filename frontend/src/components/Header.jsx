// src/components/Header.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import defaultAvatarImg from "../assets/img/user-default1.png";
import { CartContext } from "../contexts/CartContext";

export default function Header() {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const defaultAvatar = defaultAvatarImg; // 프로젝트 맞게 수정
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const profileSrc = auth.photo
    ? auth.photo.startsWith("http")
      ? auth.photo // 카카오 같은 외부 URL이면 그대로
      : `${API_BASE}${auth.photo}` // /uploads/... 는 백엔드 도메인 붙여주기
    : defaultAvatar;

  const { cartAmount, setCartAmount, findCartAmount } =
    useContext(CartContext);

  useEffect(() => {
    findCartAmount();
  }, []);

  // ✅ 프로필 클릭 시 역할에 따른 이동 처리
  const handleProfileClick = () => {
    if (!auth.loggedIn) {
      navigate("/login");
      return;
    }

    const role = auth.role || "";

    // "PRODUCER" 또는 "ROLE_PRODUCER" 모두 커버
    if (role.includes("PRODUCER")) {
      navigate("/producer");
    } else {
      navigate("/mypage");
    }
  };

  // ✅ 로그아웃 처리
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (err) {
      console.error("[Header] 로그아웃 요청 실패:", err);
      // 서버 에러 나도 클라이언트 토큰은 지울 거라서 그냥 진행
    }

    // ✅ 클라이언트 토큰/유저정보 모두 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loginUser");
    localStorage.removeItem("loginAvatar"); // 🔹 추가

    // ✅ 상태 초기화
    setAuth({
      loggedIn: false,
      name: "손님",
      photo: null,
      userNo: null,
      role: null,
    });

    // ✅ 로그인 페이지로 이동 (원하면 "/" 로 바꿔도 됨)
    navigate("/login");
  };

  return (
    <>
      <div className="container-fluid fixed-top">
        {/* Navbar */}
        <div className="container px-0">
          <nav className="navbar navbar-light bg-white navbar-expand-xl">
            <Link to="/" className="navbar-brand">
              <h1 className="text-primary display-6">Fruitables</h1>
            </Link>

            <button
              className="navbar-toggler py-2 px-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarCollapse"
            >
              <span className="fa fa-bars text-primary"></span>
            </button>

            <div
              className="collapse navbar-collapse bg-white"
              id="navbarCollapse"
            >
              <div className="navbar-nav mx-auto">
                <NavLink to="/" className="nav-item nav-link">
                  Home
                </NavLink>
                <NavLink to="/shop" className="nav-item nav-link">
                  Shop
                </NavLink>
                <NavLink to="/shop-detail" className="nav-item nav-link">
                  Shop Detail
                </NavLink>

                <div className="nav-item dropdown">
                  <a
                    href="#"
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    Pages
                  </a>
                  <div className="dropdown-menu m-0 bg-secondary rounded-0">
                    <NavLink className="dropdown-item">
                      Cart
                    </NavLink>
                    <NavLink to="/checkout" className="dropdown-item">
                      Checkout
                    </NavLink>
                    <NavLink to="/testimonial" className="dropdown-item">
                      Testimonial
                    </NavLink>
                    <NavLink to="/404" className="dropdown-item">
                      404 Page
                    </NavLink>
                  </div>
                </div>

                <NavLink to="/contact" className="nav-item nav-link">
                  Contact
                </NavLink>
              </div>

              {/* 우측 아이콘 영역 */}
              <div className="d-flex m-3 me-0">
                <button
                  className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-4"
                  data-bs-toggle="modal"
                  data-bs-target="#searchModal"
                >
                  <i className="fas fa-search text-primary"></i>
                </button>
                <a href="/cart" className="position-relative me-4 my-auto">
                  <i className="fa fa-shopping-bag fa-2x"></i>
                  <span
                    className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1"
                    style={{ top: -5, left: 15, height: 20, minWidth: 20 }}
                  >
                    {cartAmount}
                  </span>
                </a>

                {/* ✅ 로그인 / 로그아웃 영역 */}
                <div className="d-flex align-items-center my-auto">
                  <div
                    onClick={handleProfileClick}
                    style={{ cursor: "pointer" }}
                    className="d-flex align-items-center"
                  >
                    <img
                      src={profileSrc}
                      alt="프로필"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: 8,
                      }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      {auth.name}님
                    </span>
                  </div>

                  {auth.loggedIn ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm ms-3"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="btn btn-outline-primary btn-sm ms-3"
                      >
                        로그인
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Modal Search Start */}
      <div
        className="modal fade"
        id="searchModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content rounded-0">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Search by keyword
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body d-flex align-items-center">
              <div className="input-group w-75 mx-auto d-flex">
                <input
                  type="search"
                  className="form-control p-3"
                  placeholder="keywords"
                  aria-describedby="search-icon-1"
                />
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