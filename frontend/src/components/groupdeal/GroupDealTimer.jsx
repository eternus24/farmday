// src/components/groupdeal/GroupDealTimer.jsx

import React, { useEffect, useState } from "react";

export default function GroupDealTimer({ endAt }) {
  const [label, setLabel] = useState("");
  const [isUrgent, setIsUrgent] = useState(false); // 3시간 이하 여부

  useEffect(() => {
    if (!endAt) return;

    const THREE_HOURS = 3 * 60 * 60 * 1000;
    const ONE_DAY = 24 * 60 * 60 * 1000;

    const tick = () => {
      const now = Date.now();
      const end = new Date(endAt).getTime();
      const diff = end - now;

      // 이미 마감
      if (diff <= 0) {
        setLabel("마감됨");
        setIsUrgent(false);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const pad = (n) => String(n).padStart(2, "0");

      // 🔴 3시간 이하 → HH : MM : SS 곧 마감!
      if (diff <= THREE_HOURS) {
        setLabel(`${pad(hours)} : ${pad(minutes)} : ${pad(seconds)} 곧 마감!`);
        setIsUrgent(true);
        return;
      }

      // 🟡 24시간 이하 → 마감까지 H시간 M분 S초
      if (diff <= ONE_DAY) {
        setLabel(`마감까지 ${hours}시간 ${minutes}분 ${seconds}초`);
        setIsUrgent(false);
        return;
      }

      // 🟣 24시간 초과 → 마감까지 D일 HH시간 MM분 SS초
      setLabel(
        `마감까지 ${days}일 ${pad(hours)}시간 ${pad(minutes)}분 ${pad(
          seconds
        )}초`
      );
      setIsUrgent(false);
    };

    // 최초 1회 계산
    tick();
    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [endAt]);

  if (!endAt) return null;

  return (
    <span
      className="d-inline-flex align-items-center"
      style={{
        fontSize: "0.85rem",
        color: isUrgent ? "#dc3545" : "#5f3dc4", // 3시간 이내 빨간색
        fontWeight: 600,
      }}
    >
      <span style={{ marginRight: 4 }}>⏰</span>
      <span>{label}</span>
    </span>
  );
}
