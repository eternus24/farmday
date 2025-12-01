// 경로: frontend/src/pages/groupdeal/components/QASection.jsx
import React from "react";

const QASection = ({ qaList, onAnswer }) => {
  return (
    <div style={styles.section}>
      <div style={styles.title}>❓ 소비자 질문</div>

      {/* 질문이 하나도 없으면 */}
      {(!qaList || qaList.length === 0) && (
        <div style={styles.noQA}>
          아직 질문이 없습니다.
        </div>
      )}

      {/* 질문 목록 */}
      {qaList && qaList.length > 0 && (
        <div style={styles.list}>
          {qaList.map((item, idx) => (
            <div key={idx} style={styles.qaItem}>
              
              {/* 질문 내용 */}
              <div style={styles.questionBox}>
                <div style={styles.qLabel}>Q.</div>
                <div style={styles.qText}>{item.question}</div>
              </div>

              {/* 답변 있는지 여부 */}
              {item.answer ? (
                <div style={styles.answerBox}>
                  <div style={styles.aLabel}>🌿 농부 답변:</div>
                  <div style={styles.aText}>{item.answer}</div>
                </div>
              ) : (
                <button
                  style={styles.answerBtn}
                  onClick={() => onAnswer(item.questionId)}
                >
                  답변하기
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
    marginTop: "35px",
    borderTop: "2px solid #ececec",
    paddingTop: "18px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "16px",
  },
  noQA: {
    fontSize: "18px",
    color: "#777",
    marginBottom: "10px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  qaItem: {
    background: "#FAFFFA",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #E6F4E6",
  },
  questionBox: {
    display: "flex",
    marginBottom: "10px",
  },
  qLabel: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#1B5E20",
    marginRight: "8px",
  },
  qText: {
    fontSize: "20px",
    lineHeight: "28px",
  },
  answerBox: {
    marginTop: "12px",
    paddingLeft: "6px",
  },
  aLabel: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0277BD",
    marginBottom: "5px",
  },
  aText: {
    fontSize: "18px",
  },
  answerBtn: {
    width: "100%",
    padding: "14px",
    fontSize: "20px",
    fontWeight: "800",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default QASection;
