// 경로: frontend/src/pages/groupdeal/components/QASection.jsx
import React from "react";

const QASection = ({ qaList, onAnswer }) => {
  return (
    <div style={styles.section}>
      <div style={styles.title}>🙋‍♀️ 고객 질문 & 답변</div>

      {/* 질문이 하나도 없으면 */}
      {(!qaList || qaList.length === 0) && (
        <div style={styles.noQA}>
          아직 등록된 질문이 없습니다.<br/>궁금한 내용을 먼저 남겨보세요 😊
        </div>
      )}

      {/* 질문 목록 */}
      {qaList && qaList.length > 0 && (
        <div style={styles.list}>
          {qaList.map((item, idx) => (
            <div key={idx} style={styles.qaItem}>
              
              {/* 질문 내용 */}
              <div style={styles.questionBox}>
                <div style={styles.qLabel}>Q</div>
                <div style={styles.qText}>{item.question}</div>
              </div>

              {/* 답변 있는지 여부 */}
              {item.answer ? (
                <div style={styles.answerBox}>
                  <div style={styles.aLabel}>💬 판매자 답변</div>
                  <div style={styles.aText}>{item.answer}</div>
                </div>
              ) : (
                <button
                  style={styles.answerBtn}
                  onClick={() => onAnswer(item.questionId)}
                >
                  답변 작성하기
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
    borderTop: "2px solid #e5e7eb",
    paddingTop: "20px",
    fontFamily: `"Noto Sans KR", sans-serif`,
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#111",
  },
  noQA: {
    fontSize: "15.5px",
    color: "#777",
    marginBottom: "10px",
    lineHeight: "22px",
    textAlign: "center",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  qaItem: {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #dce8c8",
    boxShadow: "0px 3px 10px rgba(0,0,0,0.05)",
  },
  questionBox: {
    display: "flex",
    marginBottom: "10px",
    alignItems: "flex-start",
    gap: "8px",
  },
  qLabel: {
    fontSize: "18px",
    fontWeight: "700",
    background: "#ccf09e",
    color: "#3a4b00",
    borderRadius: "50%",
    width: "26px",
    height: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qText: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#333",
    flex: 1,
  },
  answerBox: {
    marginTop: "14px",
    padding: "12px 14px",
    background: "#f9fcf3",
    borderRadius: "10px",
    border: "1px solid #e1efcf",
  },
  aLabel: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#4a6d00",
  },
  aText: {
    fontSize: "15px",
    color: "#222",
    lineHeight: "22px",
  },
  answerBtn: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "700",
    background: "#a6e000",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "6px",
    transition: "0.15s",
  },
};

export default QASection;