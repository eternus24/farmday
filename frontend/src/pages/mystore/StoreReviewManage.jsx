import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getStoreReviews, updateReply } from '../../assets/js/api/ReviewApi';
import '../../assets/css/storeReviewReply.css';

const StoreReviewManage = () => {

  const { store } = useOutletContext();
  const [reviews, setReviews] = useState([]);
  const [editingReply, setEditingReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [tab, setTab] = useState("written");

  useEffect(() => {
    if (!store?.storeId) return;

    getStoreReviews(store.storeId)
      .then(res => setReviews(res))
      .catch(err => console.error("스토어 리뷰 조회 실패: ", err));
  }, [store]);

  const handleReplySave = async (reviewId) => {
    try {
      await updateReply(reviewId, replyText);

      setReviews(prev =>
        prev.map(r =>
          r.reviewId === reviewId ? { ...r, reply: replyText } : r
        )
      );

      alert("답글이 등록되었습니다.");
      setEditingReply(null);
      setReplyText("");
    } catch (err) {
      console.error("답글 저장 실패:", err);
      alert("답글 저장 실패");
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (tab === "written") return true;
    if (tab === "unwritten") return !r.reply;
  });

  return (
    <div className='review-manage-container'>

      {/* ✅ 탭 유지 */}
      <div className="review-tab-nav">
        <button className={tab === "written" ? "active" : ""} onClick={() => setTab("written")}>
          전체 리뷰
        </button>
        <button className={tab === "unwritten" ? "active" : ""} onClick={() => setTab("unwritten")}>
          미답변 리뷰
        </button>
      </div>

      {/* ✅ 리스트 테이블 */}
      <table className="review-list-table">
        <thead>
          <tr>
            <th>상태</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {filteredReviews.length === 0 ? (
            <tr>
              <td colSpan="5" className="review-empty">등록된 리뷰가 없습니다.</td>
            </tr>
          ) : (
            filteredReviews.map((r) => (
              <React.Fragment key={r.reviewId}>
                <tr>
                  <td>
                    <span className={r.reply ? "status-done" : "status-wait"}>
                      {r.reply ? "완료" : "미답변"}
                    </span>
                  </td>
                  <td className="review-title">{r.title}</td>
                  <td>{r.writerUserId}</td>
                  <td>{r.createdDate}</td>
                  <td>
                    <button
                      className="reply-btn"
                      onClick={() => {
                        setEditingReply(r.reviewId);
                        setReplyText(r.reply || "");
                      }}
                    >
                      {r.reply ? "답글 수정" : "답글 작성"}
                    </button>
                  </td>
                </tr>

                {/* ✅ 하단 답글 입력 영역 */}
                {editingReply === r.reviewId && (
                  <tr className="reply-row">
                    <td colSpan="5">
                      <textarea
                        className="reply-textarea"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                        placeholder="답글을 입력하세요..."
                      />
                      <div className="reply-actions">
                        <button onClick={() => setEditingReply(null)}>취소</button>
                        <button className="save" onClick={() => handleReplySave(r.reviewId)}>
                          저장
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StoreReviewManage;