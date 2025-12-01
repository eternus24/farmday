// 경로: frontend/src/pages/groupdeal/components/NoticeSection.jsx
import React from "react";

const NoticeSection = ({ noticeList, onAddNotice }) => {

  return (
    <div style={styles.section}>
      <div style={styles.title}>📢 공지사항</div>

      {(!noticeList || noticeList.length === 0) && (
        <div style={styles.noNotice}>등록된 공지가 없습니다.</div>
      )}

      {noticeList && noticeList.length > 0 && (
        <div style={styles.list}>
          {noticeList.map((n, idx) => (
            <div key={idx} style={styles.noticeItem}>
              <div style={styles.date}>
                {new Date(n.createdAt).toLocaleDateString()}
              </div>
              <div style={styles.content}>{n.content}</div>
            </div>
          ))}
        </div>
      )}

      <button style={styles.button} onClick={onAddNotice}>
        + 공지 추가하기
      </button>
    </div>
  );
};

const styles = {
  section: {
    marginTop: "28px",
    padding: "18px",
    borderTop: "2px solid #eee",
    fontSize: "18px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "16px",
  },
  noNotice: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "14px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  noticeItem: {
    padding: "12px",
    borderRadius: "8px",
    background: "#F1FFF0",
  },
  date: {
    fontWeight: "700",
    marginBottom: "4px",
  },
  content: {
    fontSize: "18px",
  },
  button: {
    marginTop: "8px",
    width: "100%",
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "14px 10px",
    border: "none",
    borderRadius: "10px",
    fontSize: "20px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default NoticeSection;
