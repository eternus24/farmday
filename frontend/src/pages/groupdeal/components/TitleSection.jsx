// 경로: frontend/src/pages/groupdeal/components/TitleSection.jsx
import React from "react";

const TitleSection = ({ title, subTitle }) => {
  return (
    <div style={styles.box}>
      <div style={styles.title}>{title}</div>
      <div style={styles.subTitle}>{subTitle}</div>
    </div>
  );
};

const styles = {
  box: {
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#1B5E20",
    marginBottom: "5px",
  },
  subTitle: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#444",
  },
};

export default TitleSection;
