// 경로: frontend/src/pages/groupdeal/components/PriceInfo.jsx
import React from "react";

const PriceInfo = ({ originPrice, dealPrice, discountRate }) => {
  // ✅ 문자열/undefined/null 방어용 숫자 변환
  const safeOrigin = Number(originPrice ?? 0);
  const safeDeal = Number(dealPrice ?? 0);
  const hasDiscountRate =
    discountRate !== null &&
    discountRate !== undefined &&
    !Number.isNaN(Number(discountRate));
  const safeDiscount = hasDiscountRate ? Number(discountRate) : null;

  // 절감 금액 계산 (원하면 표시용)
  const diff = safeOrigin - safeDeal;

  return (
    <div style={styles.box}>
      {/* 공동구매 가격 */}
      <div style={styles.row}>
        <span style={styles.label}>공동구매 가격</span>
        <span style={styles.dealPrice}>
          {safeDeal.toLocaleString()}원
        </span>
      </div>

      {/* 기존 시세 */}
      <div style={styles.row}>
        <span style={styles.label}>기존 시세</span>
        <span style={styles.originPrice}>
          {safeOrigin.toLocaleString()}원
        </span>
      </div>

      {/* 절감금액 / 할인율 */}
      {safeOrigin > 0 && (
        <div style={styles.row}>
          <span style={styles.label}>이번 공동구매로</span>
          <span style={styles.saveBox}>
            <span style={styles.saveAmount}>
              {diff > 0 ? `${diff.toLocaleString()}원 절약` : "가격 동일"}
            </span>
            {safeDiscount !== null && (
              <span style={styles.discount}>
                ({safeDiscount.toFixed(1)}%↓)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  box: {
    marginTop: "20px",
    marginBottom: "20px",
    backgroundColor: "#f6fff4",
    padding: "16px 20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  label: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
  },
  dealPrice: {
    fontSize: "26px",
    fontWeight: "900",
    color: "#2E7D32",
  },
  originPrice: {
    fontSize: "18px",
    color: "#6b7280",
    textDecoration: "line-through",
  },
  saveBox: {
    display: "flex",
    gap: "6px",
    alignItems: "baseline",
  },
  saveAmount: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#C62828",
  },
  discount: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#C62828",
  },
};

export default PriceInfo;
