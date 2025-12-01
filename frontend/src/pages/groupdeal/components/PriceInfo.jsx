// 경로: frontend/src/pages/groupdeal/components/PriceInfo.jsx
import React from "react";

const PriceInfo = ({ originPrice, dealPrice, discountRate }) => {
  return (
    <div style={styles.box}>
      <div style={styles.label}>공동구매 가격</div>
      <div style={styles.dealPrice}>
        {dealPrice.toLocaleString()}원
      </div>

      <div style={styles.label}>기존 시세</div>
      <div style={styles.originPrice}>
        {originPrice.toLocaleString()}원
      </div>

      {discountRate !== null && discountRate !== undefined && (
        <>
          <div style={styles.label}>할인율</div>
          <div style={styles.discount}>
            {discountRate.toFixed(1)}%
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  box: {
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "20px",
    backgroundColor: "#f6fff4",
    padding: "20px 10px",
    borderRadius: "8px",
  },
  label: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  dealPrice: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#2E7D32",
    marginBottom: "20px",
  },
  originPrice: {
    fontSize: "22px",
    color: "#666",
    textDecoration: "line-through",
    marginBottom: "20px",
  },
  discount: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#C62828",
  },
};

export default PriceInfo;
