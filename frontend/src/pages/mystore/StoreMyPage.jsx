import React from 'react';
import '../../assets/css/store.css';

const StoreMyPage = () => {//상품 페이지
  return (
    <div className="store-page-container">

      {/* 왼쪽 사이드바 */}
      <aside className="store-sidebar">
        <div className="store-profile-box">
          <div className="store-thumb"></div>
          <div className="store-name">스토어 이름</div>
          <div className="store-desc">설명란</div>
        </div>

        <nav className="store-nav">
          <ul>
            <li className="active">상품 등록</li>
            <li>상품 리스트</li>
            <li>상품 현황</li>
            <li>문의 관리</li>
            <li>사용자 후기</li>
          </ul>
        </nav>
      </aside>

      {/* 메인 영역 */}
      <main className="store-main">
        
        {/* TOP5 */}
        <section className="store-top-section">
          <h2>인기 TOP 5</h2>
          <div className="top-product-list">
            {[1,2,3,4,5].map(i => (
              <div className="top-product-card" key={i}>
                <div className="thumb"></div>
                <div>상품명 {i}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 최근 상품 */}
        <section className="store-recent-section">
          <h2>최근 등록/판매 상품</h2>

          <div className="recent-list">
            {[1,2,3].map(i => (
              <div className="recent-card" key={i}>
                <div className="thumb"></div>
                <div className="recent-info">
                  <div className="recent-title">상품명 {i}</div>
                  <div className="recent-desc">간단한 설명 표시</div>
                </div>
              </div>
            ))}
          </div>

        </section>
      </main>

    </div>
  );
};

export default StoreMyPage;