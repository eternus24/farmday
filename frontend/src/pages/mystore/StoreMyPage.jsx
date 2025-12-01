import React, { useState, useEffect } from 'react';
import '../../assets/css/store.css';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { getStoreInfo } from '../../assets/js/api/ShopApi';


const StoreMyPage = () => {//상품 페이지

  //상세 페이지 탭
  const {pathname} = useLocation();
  const{producerId} = useParams();
  const [store,setStore] = useState(null);

    useEffect(() => {
  getStoreInfo(producerId)
    .then(store => {
      setStore(store); 
    })
    .catch(err => console.error("스토어 정보 오류:", err));
}, [producerId]);


  return (
    <div className="store-page-container">

      {/* 왼쪽 사이드바 */}
      <aside className="store-sidebar">
        <div className="store-profile-box">
          <div className="store-thumb">
            {store?.thumbnailUrl && (
              <img src={store.thumbnailUrl} alt="스토어 대표 이미지" />
            )}
          </div>

          <div className="store-name">
            {store?.storeName || "스토어 이름"}
          </div>
          <div className="store-desc">
            {store?.description || "설명란"}
          </div>
          <div>
            {store?.phone || "연락처"}
          </div>
          <div>
            {store?.addr || "주소"}
          </div>
          <div>
            {store?.createdDate || "설립일"}
          </div>

        </div>

        <nav className="store-nav">
          <ul>
            <li className={pathname.includes("mainpro") ? "active" : ""}>
              <Link to="mainpro">메인 상품</Link>
            </li>
            <li className={pathname.includes("list") ? "active" : ""}>
              <Link to="list">상품 리스트</Link>
            </li>
            <li className={pathname.includes("question") ? "active" : ""}>
              <Link to="question">문의 관리</Link>
            </li>
          </ul>
        </nav>

        <button className='store-upload-btn'>스토어 설정</button>
      </aside>

      {/* 메인 영역 */}
      <main className="store-main">
        <Outlet/>
      </main>

    </div>
  );
};

export default StoreMyPage;