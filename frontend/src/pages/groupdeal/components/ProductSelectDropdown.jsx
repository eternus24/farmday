// 경로: frontend/src/pages/groupdeal/components/ProductSelectDropdown.jsx
import React from "react";

const ProductSelectDropdown = ({ products, selectedProductId, onChange }) => {

  return (
    <div style={styles.container}>
      <div style={styles.label}>📦 상품 선택</div>

      <select
        style={styles.select}
        value={selectedProductId || ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="">상품을 선택하세요</option>

        {products.map((p) => (
          <option key={p.productId} value={p.productId}>
            {p.productName}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "20px",
    marginBottom: "20px",
  },
  label: {
    fontSize: "22px",
    fontWeight: "900",
    marginBottom: "8px",
    color: "#1B5E20",
  },
  select: {
    width: "100%",
    fontSize: "20px",
    padding: "14px",
    borderRadius: "10px",
    border: "2px solid #4CAF50",
    cursor: "pointer",
  }
};

export default ProductSelectDropdown;
