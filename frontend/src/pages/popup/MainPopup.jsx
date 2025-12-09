// pages/popup/MainPopup.jsx
import React, { useContext, useState } from "react";
import { markMainPopupSkippedForToday } from "./popup"
import "../../assets/css/popup.css"
import { AuthContext } from "../../contexts/AuthContext";

export default function MainPopup() {
  const [dontShowToday, setDontShowToday] = useState(false);
  const { auth } = useContext(AuthContext);

  const { protocol, hostname } = window.location;
  const API_BASE = `${protocol}//${hostname}:8080`;
  const user_id = JSON.parse(window.localStorage.getItem('loginUser')).userId;
  const loginUser = JSON.parse(localStorage.getItem("loginUser") || "{}");
  const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem("accessToken");

  async function addWinterEventCoupon() {
    try {
      const res = await fetch(
        `${API_BASE}/api/mypage/coupon/addWinterEventCoupon?user_id=${user_id}`,
          {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
              'Content-Type': 'application/json',
              Authorization: token.startsWith('Bearer ')
                ? token
                : `Bearer ${token}`,
            },
          }
      );
      const bodyText = await res.text();
      const code = (bodyText || "").trim();

      if (!res.ok) {
        if (code === "already_having_same_coupon") {
          alert("이미 같은 쿠폰을 보유하고 있습니다.");
          return;
        }
        throw new Error(code || `HTTP ${res.status}`);
      }

      if (code === "already_having_same_coupon") {
        alert("이미 같은 쿠폰을 보유하고 있습니다.");
        return;
      }

      alert("쿠폰을 등록했습니다.");

    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("addWinterEventCoupon failed:", e);
      alert("쿠폰 등록에 실패했습니다.");
    }
  }


  const handleBannerClick = () => {
    addWinterEventCoupon();
    // window.close();
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
