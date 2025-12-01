import React, { useState, useContext } from "react";
import "../../assets/css/question.css";
import { AuthContext } from "../../contexts/AuthContext";
import { deleteQuestion } from "../../assets/js/api/QuestionApi";
import QnaEdit from "./QnaEdit";

const QnaList = ({ qnaList }) => {
  
  const { auth } = useContext(AuthContext);
  const loginId = auth?.name || localStorage.getItem("userId"); 
  const [openId, setOpenId] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const onEdit = (qna) => {
    setEditModal(qna);
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteQuestion(id);
      alert("QnA 문의 삭제 완료!");
      window.location.reload();
    } catch(err) {
      console.error("QnA 문의 삭제 실패:", err);
      alert("QnA 문의 삭제 실패");
    }
  };

  return (
    <div className="qna-list-modern">
      
      {qnaList.length === 0 && (
        <div className="qna-empty-state">
          <div className="empty-icon">💬</div>
          <p>현재 등록된 문의가 없습니다.</p>
        </div>
      )}

      {qnaList.map((q) => {
        const canView =
          !q.isPrivate ||
          String(q.writerUserId) === String(loginId) ||
          auth.role === "ADMIN" ||
          auth.role === "PRODUCER";

        return (
          <div key={q.qnaId} className="qna-card-modern">
            
            {/* 카드 헤더 */}
            <div className="qna-card-header" onClick={() => toggleOpen(q.qnaId)}>
              
              {/* 왼쪽: 상태 + 카테고리 + 제목 */}
              <div className="qna-card-left">
                {/* 답변 상태 뱃지 */}
                <span
                  className={`qna-status-badge ${
                    q.status === "ANSWERED" ? "answered" : "waiting"
                  }`}
                >
                  {q.status === "ANSWERED" ? "답변완료" : "미답변"}
                </span>

                {/* 카테고리 뱃지 */}
                <span className="qna-category-badge">
                  {q.qnaCategory || "기타문의"}
                </span>

                {/* 제목 */}
                <div className="qna-card-title">
                  {!canView ? (
                    <>
                      <span className="lock-icon">🔒</span>
                      <span>비밀글입니다</span>
                    </>
                  ) : (
                    q.title
                  )}
                </div>
              </div>

              <div className="qna-card-right">
                <div className="qna-card-meta">
                  <span className="qna-writer">
                    {q.writerUserId?.replace(/(?<=.{2})./g, "*")}
                  </span>
                  <span className="qna-date">
                    {q.createdDate?.slice(0, 10)}
                  </span>
                </div>

              {/* 펼치기 아이콘 */}
              <div className="qna-expand-icon">
                {openId === q.qnaId ? "▲" : "▼"}
              </div>
            </div>
            </div>

            {/* 카드 본문 (펼쳤을 때) */}
            {openId === q.qnaId && (
              <div className="qna-card-body">
                {!canView ? (
                  <div className="qna-private-msg">
                    🔒 작성자만 확인할 수 있는 글입니다.
                  </div>
                ) : (
                  <>
                    {/* 질문 내용 */}
                    <div className="qna-question-content">
                      <div className="content-label">문의 내용</div>
                      <div className="content-text">{q.content}</div>
                    </div>

                    {/* 판매자 답변 */}
                    {q.answerContent && (
                      <div className="qna-answer-content">
                        <div className="answer-label">
                          <span className="seller-badge">판매자</span>
                          <span>답변</span>
                        </div>
                        <div className="answer-text">{q.answerContent}</div>
                      </div>
                    )}

                    {/* 작성자 본인일 때만 수정/삭제 버튼 */}
                    {q.writerUserId === loginId && (
                      <div className="qna-action-buttons">
                        <button 
                          className="qna-action-btn edit" 
                          onClick={() => onEdit(q)}
                        >
                          수정
                        </button>
                        <button 
                          className="qna-action-btn delete" 
                          onClick={() => onDelete(q.qnaId)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* 수정 모달 */}
      {editModal && (
        <QnaEdit
          qna={editModal}
          onClose={() => setEditModal(null)}
          refresh={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default QnaList;