// 경로: frontend/src/pages/groupdeal/components/DeliveryStatusSection.jsx
import React from "react";

const DeliveryStatusSection = ({ status, onChangeStatus }) => {
  return (
    <div style={styles.section}>
      <div style={styles.title}>🚚 배송/진행 상태</div>

      <div style={styles.statusBox}>
        <div style={styles.currentLabel}>현재 상태:</div>
        <div style={styles.currentValue}>{convertStatus(status)}</div>
      </div>

      <div style={styles.btnContainer}>
        <button
          style={statusBtnStyle(status, 'OPEN')}
          onClick={() => onChangeStatus("OPEN")}
        >
          모집중
        </button>

        <button
          style={statusBtnStyle(status, 'PREPARE_SHIPPING')}
          onClick={() => onChangeStatus("PREPARE_SHIPPING")}
        >
          발송 준비중
        </button>

        <button
          style={statusBtnStyle(status, 'SHIPPING')}
          onClick={() => onChangeStatus("SHIPPING")}
        >
          배송중
        </button>

        <button
          style={statusBtnStyle(status, 'DONE')}
          onClick={() => onChangeStatus("DONE")}
        >
          배송 완료
        </button>
      </div>
    </div>
  );
};

const convertStatus = (s) => {
  switch (s) {
    case "OPEN": return "모집중";
    case "PREPARE_SHIPPING": return "발송 준비중";
    case "SHIPPING": return "배송중";
    case "DONE": return "배송 완료";
    default: return s;
  }
};

const styles = {
  section: {
    marginTop: "35px",
    paddingTop: "18px",
    borderTop: "2px solid #eee",
  },
  title: {
    fontSize: "24px",
    fontWeight: "900",
    marginBottom: "18px",
  },
  statusBox: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  currentLabel: {
    fontSize: "20px",
    fontWeight: "600",
    marginRight: "12px",
  },
  currentValue: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#1B5E20",
  },
  btnContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
};

const statusBtnStyle = (current, me) => ({
  fontSize: "20px",
  padding: "16px",
  borderRadius: "10px",
  fontWeight: "800",
  cursor: "pointer",
  border: current === me ? "3px solid #1B5E20" : "2px solid #ddd",
  color: current === me ? "white" : "#333",
  backgroundColor: current === me ? "#4CAF50" : "white",
});

export default DeliveryStatusSection;
