// src/components/Header.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import defaultAvatarImg from "../assets/img/user-default1.png";
import { CartContext } from "../contexts/CartContext";
import logoImg from "../assets/img/FarmDay.png";
import ChatbotMain from "./aichat/ChatbotMain"; //민아 - 추가

export default function Header() {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const defaultAvatar = defaultAvatarImg;
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [producerMenuOpen, setProducerMenuOpen] = useState(false);

  const rawPhoto = auth?.photo;

  const profileSrc =
    !rawPhoto || rawPhoto === "null" || rawPhoto === "undefined"
      ? defaultAvatar
      : rawPhoto.startsWith("http")
      ? rawPhoto
      : rawPhoto.startsWith("/")
      ? `${API_BASE}${rawPhoto}`
      : defaultAvatar;

  const { cartAmount, setCartAmount, findCartAmount } =
    useContext(CartContext);

  useEffect(() => {
    findCartAmount();
  }, []);

  const isLoggedIn = auth?.loggedIn;
  const role = auth?.role || "";
  const isProducer = role.includes("PRODUCER");

  // 소비자/일반 유저용 프로필 클릭
  const handleProfileClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/mypage");
  };

  // 로그아웃 처리
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
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loginUser");
    localStorage.removeItem("loginAvatar");

    setAuth({
      loggedIn: false,
      name: "손님",
      photo: null,
      userNo: null,
      role: null,
    });

    navigate("/login");
  };

  return (
    <>
      <div className="container-fluid fixed-top">
        {/* Navbar */}
        <div className="container px-0">
          <nav className="navbar navbar-light bg-white navbar-expand-xl">
            <Link to="/" className="navbar-brand">
              <img
                src={logoImg}
                alt="FarmDay Logo"
                style={{ height: "70px", objectFit: "contain" }}
              />
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
                  홈
                </NavLink>
                <NavLink to="/shop" className="nav-item nav-link">
                  상품
                </NavLink>
                <NavLink to="/groupdeal" className="nav-item nav-link">
                  공동구매
                </NavLink>

                <NavLink to="/price" className="nav-item nav-link">
                  시세정보
                </NavLink>

                <NavLink to="/help" className="nav-item nav-link">
                  고객센터
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

                {/* 로그인 / 로그아웃 + 프로필 */}
                <div className="d-flex align-items-center my-auto">
                  {/* 🔸 생산자: 예전 네비 드롭다운이랑 비슷한 디자인 */}
                  {isLoggedIn && isProducer ? (
                    // ⭐ 우리가 직접 제어하는 커스텀 드롭다운
                    <div
                      className="position-relative"
                      style={{ marginRight: "0.25rem" }}
                    >
                      {/* 토글 영역 */}
                      <div
                        className="d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => setProducerMenuOpen((prev) => !prev)}
                      >
                        <img
                          src={profileSrc}
                          alt="프로필"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginRight: 8,
                          }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: 600, marginRight: 4 }}>
                          {auth.name}님
                        </span>
                        {/* 작은 화살표 아이콘 느낌 */}
                        <span style={{ fontSize: "10px" }}>▼</span>
                      </div>

                      {/* 드롭다운 메뉴 */}
                      {producerMenuOpen && (
                      <div
                        className="bg-white border rounded shadow-sm"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "0",            // ← 프로필 바로 아래 정렬
                          marginTop: "6px",
                          width: "110px",       // ← 딱 적당한 폭
                          zIndex: 1050,
                          fontSize: "13px",
                          overflow: "hidden",
                          // ⭐ 메뉴글씨 가운데
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          className="dropdown-item"
                          style={{ padding: "6px 10px" }}
                          onClick={() => {
                            setProducerMenuOpen(false);
                            navigate("/mypage");
                          }}
                        >
                          마이페이지
                        </button>

                        <button
                          type="button"
                          className="dropdown-item"
                          style={{ padding: "6px 10px" }}
                          onClick={() => {
                            setProducerMenuOpen(false);
                            navigate("/producer");
                          }}
                        >
                          생산자 센터
                        </button>
                      </div>
                    )}
                    </div>
                  ) : (
                    // 🔸 비로그인/일반 소비자: 클릭 시 로그인 or 일반 마이페이지
                    <div
                      onClick={handleProfileClick}
                      style={{ cursor: "pointer" }}
                      className="d-flex align-items-center"
                    >
                      <img
                        src={profileSrc}
                        alt="프로필"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultAvatar;
                        }}
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
                  )}

                  {auth.loggedIn ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm ms-3"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="btn btn-outline-primary btn-sm ms-3"
                    >
                      로그인
                    </Link>
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
      <ChatbotMain />
    </>
  );
}