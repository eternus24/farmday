// src/pages/store/StoreInfoPage.jsx
import React from 'react';
import '../../assets/css/storeEdit.css';
import { useOutletContext } from "react-router-dom";

const StoreInfoPage = () => {
  const { store } = useOutletContext();

  if (!store) return <div>정보를 불러오는 중...</div>;

  return (
    <div className="info-container">
      {/* 타이틀 */}
      <h1 className="info-title">{store.storeName}</h1>
      <p className="info-subtitle">
        {store.description || '스토어 소개가 아직 등록되지 않았습니다.'}
      </p>

      {/* 상단 정보 카드 */}
      <div className="info-grid">
        {/* 스토어 기본 정보 */}
        <div className="info-card">
          <h2>스토어 정보</h2>

          <div className="info-row">
            <span className="label">주소</span>
            {/* addrDetail, region 컬럼 제거 → 주소만 표기 */}
            <span className="value">
              {store.addr || '-'}
            </span>
          </div>

          <div className="info-row">
            <span className="label">연락처</span>
            <span className="value">
              {store.phone || '-'}
            </span>
          </div>
        </div>

        {/* 생산자 정보 */}
        <div className="info-card">
          <h2>생산자 정보</h2>

          <div className="info-row">
            <span className="label">사업자등록번호</span>
            <span className="value">
              {store.bizNo || '-'}
            </span>
          </div>

          <div className="info-row">
            <span className="label">정산 은행명</span>
            <span className="value">
              {store.bankName || '-'}
            </span>
          </div>

          <div className="info-row">
            <span className="label">정산 계좌번호</span>
            <span className="value">
              {store.bankAccountNo || '-'}
            </span>
          </div>

          <div className="info-row">
            <span className="label">예금주</span>
            <span className="value">
              {store.accountHolder || '-'}
            </span>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="info-card info-delivery-card">
          <h2>배송 안내</h2>

          <ul className="info-delivery-list">
            <li>• 평균 배송기간은 1~3일이며, 산지 직송으로 신선하게 배송됩니다.</li>
            <li>• 제주/도서산간 지역은 추가 배송비가 발생할 수 있습니다.</li>
            <li>• 주문량 증가 시 배송이 지연될 수 있습니다.</li>
            <li>• 배송 문의는 Q&A 또는 고객센터로 문의해주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StoreInfoPage;