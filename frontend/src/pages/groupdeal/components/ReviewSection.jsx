// 경로: frontend/src/pages/groupdeal/components/ReviewSection.jsx
import React from "react";

const ReviewSection = ({ reviews, onReply }) => {
  return (
    <div style={styles.section}>
      <div style={styles.title}>⭐ 소비자 리뷰</div>

      {(!reviews || reviews.length === 0) && (
        <div style={styles.noReview}>아직 리뷰가 없습니다.</div>
      )}

      {reviews && reviews.length > 0 && (
        <div style={styles.list}>
          {reviews.map((r, idx) => (
            <div key={idx} style={styles.reviewItem}>
              
              {/* 별점 */}
              <div style={styles.rating}>
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>

              {/* 리뷰 내용 */}
              <div style={styles.comment}>
                {r.comment}
              </div>

              {/* 소비자 정보 */}
              <div style={styles.reviewer}>
                {r.userName} · {new Date(r.createdAt).toLocaleDateString()}
              </div>

              {/* 생산자 답글 또는 버튼 */}
              {r.reply ? (
                <div style={styles.replyBox}>
                  <div style={styles.replyLabel}>🌿 생산자 답변:</div>
                  <div style={styles.replyText}>{r.reply}</div>
                </div>
              ) : (
                <button
                  style={styles.replyBtn}
                  onClick={() => onReply(r.reviewId)}
                >
                  답변 남기기
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  section: {
    marginTop: "40px",
    borderTop: "2px solid #eee",
    paddingTop: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "900",
    marginBottom: "18px",
  },
  noReview: {
    fontSize: "18px",
    color: "#777",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    fontSize: "18px",
  },
  reviewItem: {
    background: "#FEFFFE",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #E1EDE1",
  },
  rating: {
    fontSize: "22px",
    color: "#FFC107",
    marginBottom: "8px",
  },
  comment: {
    fontSize: "18px",
    marginBottom: "10px",
  },
  reviewer: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "14px",
  },
  replyBox: {
    marginTop: "10px",
    background: "#F0FFEF",
    borderRadius: "8px",
    padding: "10px",
  },
  replyLabel: {
    fontWeight: "700",
    marginBottom: "4px",
  },
  replyText: {
    fontSize: "18px",
  },
  replyBtn: {
    width: "100%",
    background: "#4CAF50",
    color: "white",
    padding: "14px",
    fontSize: "18px",
    fontWeight: "800",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  }
};

export default ReviewSection;
