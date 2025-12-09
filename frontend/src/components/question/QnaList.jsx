import React, { useState, useContext } from "react";
import "../../assets/css/question.css";
import { AuthContext } from "../../contexts/AuthContext";
import { deleteQuestion } from "../../assets/js/api/QuestionApi";
import QnaEdit from "./QnaEdit";

const QnaList = ({ qnaList,refreshQnaList }) => {

  const { auth } = useContext(AuthContext);
  const [openId, setOpenId] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const loginUserId = loginUser?.userId;

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
      alert("QnA 삭제 완료");
      refreshQnaList();
    } catch {
      alert("QnA 삭제 실패");
    }
  };

  return (
    <div className="qna-table-wrapper">

      {/* 테이블 헤더 */}
      <div className="qna-table-header">
        <div className="head-state">상태</div>
        <div className="head-category">카테고리</div>
        <div className="head-title">제목</div>
        <div className="head-writer">작성자</div>
        <div className="head-date">작성일</div>
      </div>

    {qnaList.length === 0? (
      <div className="qna-empty">
        현재 등록된 문의가 없습니다.
      </div>
      ):(
      qnaList.map((q) => {
        const isPrivate = q.isPrivate === "Y";  // 비밀글 여부
        const isWriter =
          String(q.writerUserId) === String(loginUserId);

        const isAdmin =
          auth.role === "ADMIN";

        const isMyStoreProducer =
          auth.role === "PRODUCER" &&
          String(q.storeId) === String(auth.storeId);

        const canView =
          !isPrivate ||        // 일반글 → 전체 공개
          isWriter ||          // 작성자는 항상 가능
          isAdmin ||           // ADMIN은 모든 비밀글 열람 가능
          isMyStoreProducer;  // PRODUCER는 내 스토어 비밀글만 가능

        const isOpen = openId === q.qnaId;

        return (
          <div key={q.qnaId} className="qna-row">

            {/* 상단 요약 줄 */}
            <div
              className="qna-summary-row"
              onClick={() => toggleOpen(q.qnaId)}
            >
              <div>
                {q.status === "ANSWERED" ? (
                  <span className="state-done">답변완료</span>
                ) : (
                  <span className="state-wait">미답변</span>
                )}
              </div>

              <div className="qna-category-badge">
                {q.qnaCategory}
              </div>

              <div className="qna-title-area">
                {!canView ? (
                  <>
                    <span className="lock-icon">🔒</span>
                    <span className="qna-title-text">비밀글입니다</span>
                  </>
                ) : (
                  <span className="qna-title-text">{q.title}</span>
                )}
              </div>

              <div>{q.writerUserId?.replace(/(?<=.{2})./g, "*")}</div>
              <div>{q.createdDate?.slice(0, 10)}</div>
            </div>

            {/* 펼침 상세 */}
            {isOpen && (
              <div className="qna-detail-box">

                {!canView ? (
                  <div className="qna-private-msg">
                    🔒 작성자만 확인 가능합니다.
                  </div>
                ) : (
                  <>
                    {/* Q 박스 */}
                    <div className="q-box">
                      <div className="q-box-label">Q</div>
                      <div className="q-box-content">{q.content}</div>
                    </div>

                    {/* A 박스 */}
                    {q.answerContent && (
                      <div className="a-box">
                        <div className="a-box-left">
                          <span className="a-badge">답변</span>
                          <span className="seller-label">판매자</span>
                        </div>
                        <div className="a-content">{q.answerContent}</div>
                      </div>
                    )}

                    {/* 버튼 */}
                    {q.writerUserId === loginUserId && (
                      <div className="qa-btn-area">
                        <button
                          className="qa-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(q);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="qa-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(q.qnaId);
                          }}
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
      }))}

      {/* 수정 모달 */}
      {editModal && (
        <QnaEdit
          qna={editModal}
          onClose={() => setEditModal(null)}
          refresh={() => window.location.reload()} refreshQnaList={refreshQnaList}
        />
      )}

    </div>
  );
};

export default QnaList;