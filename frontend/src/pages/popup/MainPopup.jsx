// pages/popup/MainPopup.jsx
import React, { useState } from "react";
import { markMainPopupSkippedForToday } from "./popup"
import "../../assets/css/popup.css"

export default function MainPopup() {
  const [dontShowToday, setDontShowToday] = useState(false);

  const handleBannerClick = () => {
    // 👉 이미지 특정 영역 클릭 시 동작
    // 예: 이벤트 페이지로 이동
    window.opener?.location.assign("/event/special");
    window.close(); // 필요하면 팝업도 같이 닫기
  };

  const handleClose = () => {
    if (dontShowToday) {
      markMainPopupSkippedForToday();
    }
    window.close();
  };

  return (
    <div className="popup-container">
      
      <img src="../../../node_modules/img/Gemini_Generated_Image_blf2x0blf2x0blf2.png"
      className="popup-image"/>
      <button
        type="button"
        className="popup-banner-btn"
        onClick={handleBannerClick}
        title="쿠폰 받으러 가기!!"
      />
      
      <div>
        <label className="popup-label">
          <input
            type="checkbox"
            checked={dontShowToday}
            onChange={(e) => setDontShowToday(e.target.checked)}
            className="popup-checkbox"
          />
          오늘 하루 이 창 다시 열지 않기
        </label>
      </div>

      <div>
        <button type="button" onClick={handleClose} className="close-btn">
          닫기
        </button>
      </div>
    </div>
  );
}
