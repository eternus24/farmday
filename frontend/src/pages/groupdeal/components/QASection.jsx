import React from "react";

const QASection = ({ qaList, onAnswer, onEditAnswer, onDeleteAnswer }) => {
  return (
    <div style={styles.section}>
      <div style={styles.title}>🙋‍♀️ 고객 질문 & 답변</div>

      {/* 질문이 하나도 없으면 */}
      {(!qaList || qaList.length === 0) && (
        <div style={styles.noQA}>
          아직 등록된 질문이 없습니다.
          <br />
          궁금한 내용을 먼저 남겨보세요 😊
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
                <div style={styles.qText}>
                  {/* 🔹 제목이 있으면 위에 굵게 표시 */}
                  {item.title && (
                    <div style={styles.qTitle}>{item.title}</div>
                  )}

                  {/* 🔹 본문: content > question 순서로 사용 */}
                  <div>{item.content || item.question}</div>
                </div>
              </div>

              {/* 답변 있는지 여부 */}
              {item.answer ? (
                <div style={styles.answerBox}>
                  {/* 상단: 라벨 + (수정/삭제 버튼) */}
                  <div style={styles.answerHeaderRow}>
                    <div style={styles.aLabel}>💬 판매자 답변</div>

                    {(onEditAnswer || onDeleteAnswer) && (
                      <div style={styles.answerActions}>
                        {onEditAnswer && (
                          <button
                            type="button"
                            style={styles.actionBtn}
                            onClick={() =>
                              onEditAnswer(item.questionId, item.answer)
                            }
                          >
                            수정
                          </button>
                        )}
                        {onDeleteAnswer && (
                          <button
                            type="button"
                            style={styles.actionBtnDanger}
                            onClick={() => onDeleteAnswer(item.questionId)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 답변 본문 */}
                  <div style={styles.aText}>{item.answer}</div>
                </div>
              ) : (
                // 답변이 아직 없으면: 답변 작성 버튼
                onAnswer && (
                  <button
                    style={styles.answerBtn}
                    onClick={() =>
                      onAnswer(
                        item.questionId,
                        item.title || item.content || item.question
                      )
                    }
                  >
                    답변 작성하기
                  </button>
                )
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
    marginTop: 12,
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#222",
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
    color: "#274501",
    borderRadius: "999px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qText: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#333",
    flex: 1,
  },
  // 🔹 제목 스타일
  qTitle: {
    fontSize: "15px",
    fontWeight: 700,
    marginBottom: "4px",
    color: "#111",
  },
  answerBox: {
    marginTop: "14px",
    padding: "12px 14px",
    background: "#f9fcf3",
    borderRadius: "10px",
    border: "1px solid #e1efcf",
  },
  answerHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  aLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a6d00",
  },
  aText: {
    fontSize: "15px",
    color: "#222",
    lineHeight: "22px",
    marginTop: "2px",
  },
  answerActions: {
    display: "flex",
    gap: "6px",
  },
  actionBtn: {
    padding: "4px 10px",
    fontSize: "13px",
    borderRadius: "999px",
    border: "1px solid #c8e29a",
    backgroundColor: "#fafff2",
    color: "#4a6d00",
    cursor: "pointer",
  },
  actionBtnDanger: {
    padding: "4px 10px",
    fontSize: "13px",
    borderRadius: "999px",
    border: "1px solid #ffb3b3",
    backgroundColor: "#fff",
    color: "#d72626",
    cursor: "pointer",
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
