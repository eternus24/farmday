import React, { useEffect, useState } from 'react';
import '../../assets/css/storeEdit.css';
import { getStoreInfo, updateStoreInfo } from "../../assets/js/api/MystoreApi";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";

export default function StoreEditPage() {

  const { producerId } = useParams();
  const { store: parentStore,setStore } = useOutletContext();
  const [storeData, setStoreData] = useState(null);
  const navigate = useNavigate();

    const BANK_OPTIONS = [
    "농협은행", "국민은행", "우리은행", "신한은행", "기업은행", "하나은행", "카카오뱅크", 
    "토스뱅크" ];

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
      await updateStoreInfo(storeData);
      setStore(storeData)

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

  if (!storeData) return (
    <div className="store-edit-loading">
      <div className="loading-spinner"></div>
      <p>로딩 중...</p>
    </div>
  );

  return (
    <div className="store-edit-container">

      <section className="edit-section">
        <h3>기본 정보</h3>
        
        <div className="input-group">
          <label>스토어 이름</label>
          <input type="text" name="storeName"  value={storeData.storeName || ''} 
            onChange={handleChange} placeholder="스토어 이름을 입력하세요" />
        </div>

        <div className="input-group">
          <label>스토어 소개</label>
          <textarea name="description" value={storeData.description || ''} 
            onChange={handleChange} placeholder="스토어를 소개해주세요" rows="4" />
        </div>
      </section>

      <section className="edit-section">
        <h3>연락처 정보</h3>
        
        <div className="input-group">
          <label>전화번호</label>
          <input type="tel" name="phone" value={storeData.phone || ''} 
            onChange={handleChange} placeholder="010-0000-0000" />
        </div>
      </section>

      <section className="edit-section">
        <h3>주소 정보</h3>
        
        <div className="input-group">
          <label>주소</label>
          <input type="text" name="addr" value={storeData.addr || ''} 
            onChange={handleChange} placeholder="기본 주소를 입력하세요" />
        </div>

        <div className="input-group">
          <label>상세 주소</label>
          <input type="text" name="addrDetail" value={storeData.addrDetail || ''} 
            onChange={handleChange} placeholder="상세 주소를 입력하세요"/>
        </div>
      </section>

      <section className="edit-section">
        <h3>사업자 개인정보</h3>
        <div className='input-group'>
            <label>정산 은행</label>
            <select name="bankName" value={storeData.bankName || ''} 
            onChange={handleChange} className="bank-select" >
            
            <option value="">은행 선택  ▼</option>
            {BANK_OPTIONS.map(bankName => (
                <option key={bankName} value={bankName}>{bankName}</option>
            ))}
            </select>
        </div>

        <div className='input-group'>
            <label>계좌번호</label>
            <input type='text' name='bankAccountNo' value={storeData.bankAccountNo || ''}
            onChange={handleChange} placeholder='변경하실 계좌번호를 입력해주세요.'/>
        </div>

        <div className='input-group'>
            <label>예금주</label>
            <input type='text' name='accountHolder' value={storeData.accountHolder || ''}
            onChange={handleChange} placeholder='변경하실 예금주를 입력해주세요.'/>
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