import React, { useState, useEffect } from 'react';
import '../../assets/css/storeMypage.css';
import { Link, Outlet, useLocation, useParams, useNavigate } from 'react-router-dom';
import { getStoreInfo } from '../../assets/js/api/MystoreApi';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const StoreMyPage = () => {
  const { pathname } = useLocation();
  const { producerId } = useParams();
  const [store, setStore] = useState(null);

  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const loginUserId = loginUser?.userId;

  useEffect(() => {
    if(!producerId) return;

    getStoreInfo(producerId)
      .then(res => setStore(res.data))
      .catch(err => console.error("스토어 정보 오류:", err));
  }, [producerId]);

  const isOwner = store && loginUserId === store.ownerUserId;

  return (
    <div className="mypage-container">

      {/* 상단 헤더 */}
      <header className="mypage-header">
        <div className="mypage-header-inner">

          {/* 프로필 영역 */}
          <div className="mypage-profile-section">
            <div className="mypage-thumb">
              {store?.thumbnailUrl ? (
                <img src={store.thumbnailUrl} alt="스토어 대표 이미지" />
              ) : (
                <div className="mypage-thumb-placeholder">🏪</div>
              )}
            </div>

            <div className="mypage-info">
              <h1 className="mypage-name">
                {store?.storeName || "스토어 이름"}
              </h1>
              <p className="mypage-desc">
                {store?.description || "스토어 소개가 없습니다."}
              </p>
            </div>

            {/* 스토어 설정 버튼 */}
            {isOwner && (
            <button className="mypage-setting-btn" onClick={() => navigate(`/store/${producerId}/upload`)} > 스토어 설정 </button>)}
          </div>

          {/* 네비게이션 */}
          <nav className="mypage-nav">
            <ul>
              <li className={pathname.includes("mainpro") ? "active" : ""}>
                <Link to="mainpro">메인</Link>
              </li>
              <li className={pathname.includes("list") ? "active" : ""}>
                <Link to="list">전체 상품</Link>
              </li>
              <li className={pathname.includes("question") ? "active" : ""}>
                <Link to="question">상품 Q & A</Link>
              </li>
              {isOwner && (
              <li className={pathname.includes("reviews") ? "active" : ""}>
                <Link to="reviews">상품 리뷰</Link>
              </li>
              )}
              <li className={pathname.includes("info") ? "active" : ""}>
                <Link to="info">스토어 소개</Link>
              </li>
            </ul>
          </nav>

        </div>
      </header>

      {/* 자식 페이지 */}
      <main className="mypage-content">
        <Outlet context={{ store,setStore }} />
      </main>

    </div>
  );
};

export default StoreMyPage;