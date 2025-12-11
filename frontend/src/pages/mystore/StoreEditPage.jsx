// src/pages/store/StoreEditPage.jsx
import React, { useEffect, useState } from 'react';
import '../../assets/css/storeEdit.css';
import { getStoreInfo, updateStoreInfo } from "../../assets/js/api/MystoreApi";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";

export default function StoreEditPage() {
  const { producerId } = useParams();
  const { store: parentStore, setStore } = useOutletContext();
  const [storeData, setStoreData] = useState(null);
  const navigate = useNavigate();

  const BANK_OPTIONS = [
    "농협은행", "국민은행", "우리은행", "신한은행",
    "기업은행", "하나은행", "카카오뱅크", "토스뱅크"
  ];

  useEffect(() => {
    if (parentStore) {
      setStoreData(parentStore);
      return;
    }

    getStoreInfo(producerId)
      .then((res) => setStoreData(res.data))
      .catch((err) => console.error("스토어 정보 불러오기 실패:", err));
  }, [producerId, parentStore]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      console.log("수정 요청 storeData:", storeData);

      // ⚠️ 여기서 updateStoreInfo가
      //  - 스토어 정보 + 생산자 정보 둘 다 업데이트하도록
      //    백엔드에서 한 번에 처리해주는 구조라면 이대로 OK
      //  - 아니고 둘로 분리했다면 MystoreApi에
      //    updateStoreBasic / updateProducerInfo 같은 걸 나눠서 만들어야 함
      await updateStoreInfo(storeData);

      setStore(storeData);
      alert("스토어 정보가 수정되었습니다.");
      navigate(`/store/${producerId}/mainpro`);
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  const handleCancel = () => {
    navigate(`/store/${producerId}/mainpro`);
  };

  if (!storeData) {
    return (
      <div className="store-edit-loading">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="store-edit-container">
      {/* 기본 정보 */}
      <section className="edit-section">
        <h3>기본 정보</h3>

        <div className="input-group">
          <label>스토어 이름</label>
          <input
            type="text"
            name="storeName"
            value={storeData.storeName || ''}
            onChange={handleChange}
            placeholder="스토어 이름을 입력하세요"
          />
        </div>

        <div className="input-group">
          <label>스토어 소개</label>
          <textarea
            name="description"
            value={storeData.description || ''}
            onChange={handleChange}
            placeholder="스토어를 소개해주세요"
            rows="4"
          />
        </div>
      </section>

      {/* 연락처 정보 (producer.biz_phone 매핑) */}
      <section className="edit-section">
        <h3>연락처 정보</h3>

        <div className="input-group">
          <label>전화번호</label>
          <input
            type="tel"
            name="phone"
            value={storeData.phone || ''}
            onChange={handleChange}
            placeholder="010-0000-0000"
          />
        </div>
      </section>

      {/* 주소 정보 (producer.biz_addr 매핑) */}
      <section className="edit-section">
        <h3>주소 정보</h3>

        <div className="input-group">
          <label>주소</label>
          <input
            type="text"
            name="addr"
            value={storeData.addr || ''}
            onChange={handleChange}
            placeholder="사업장 주소를 입력하세요"
          />
        </div>

        {/* ⚠ addrDetail 컬럼/필드 제거에 맞춰서 상세 주소 입력 제거
            나중에 컬럼 추가하면 여기 다시 살리면 됨 */}
      </section>

      {/* 사업자/정산 정보 */}
      <section className="edit-section">
        <h3>사업자/정산 정보</h3>

        <div className="input-group">
          <label>정산 은행</label>
          <select
            name="bankName"
            value={storeData.bankName || ''}
            onChange={handleChange}
            className="bank-select"
          >
            <option value="">은행 선택  ▼</option>
            {BANK_OPTIONS.map((bankName) => (
              <option key={bankName} value={bankName}>
                {bankName}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>계좌번호</label>
          <input
            type="text"
            name="bankAccountNo"
            value={storeData.bankAccountNo || ''}
            onChange={handleChange}
            placeholder="변경하실 계좌번호를 입력해주세요."
          />
        </div>

        <div className="input-group">
          <label>예금주</label>
          <input
            type="text"
            name="accountHolder"
            value={storeData.accountHolder || ''}
            onChange={handleChange}
            placeholder="변경하실 예금주를 입력해주세요."
          />
        </div>
      </section>

      <div className="button-group">
        <button className="cancel-btn" onClick={handleCancel}>
          취소
        </button>
        <button className="save-btn" onClick={handleSubmit}>
          저장하기
        </button>
      </div>
    </div>
  );
}