import React, { useState } from 'react';
import "../../assets/css/review.css";
import { FaRegThumbsUp, FaThumbsUp, FaEdit, FaTimes } from "react-icons/fa";
import defaultAvatarImg from '../../assets/img/farmer.png';

const ReviewList = ({ reviews, onLike, onUpdate }) => {

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const loginUserId = loginUser?.userId;

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const startEdit = (r) => {
    setEditId(r.reviewId);
    setEditTitle(r.title);
    setEditContent(r.content);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditContent("");
  };

  const submitEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    onUpdate(editId, {
      title: editTitle,
      content: editContent,
    });

    cancelEdit();
  };

  // Header와 동일한 이미지 처리 함수
  const getProfileSrc = (photo) => {
    if (!photo || photo === "null" || photo === "undefined") {
      return defaultAvatarImg;
    }

    if (photo.startsWith("http")) return photo;
    if (photo.startsWith("/")) return `${API_BASE}${photo}`;

    return defaultAvatarImg;
  };

  return (
    <div className='review-wrapper'>

      {reviews.map((r) => {
        const isWriter = String(r.writerUserId) === String(loginUserId);
        const isEditing = editId === r.reviewId;

        const profileSrc =
        String(r.writerUserId) === String(loginUserId)
          ? getProfileSrc(loginUser?.photo) 
          : getProfileSrc(r.userPhoto); 

        return (
          <div key={r.reviewId} className='review-row'>

            {/* 상단 정보 */}
            <div className="d-flex justify-content-between mb-3">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={profileSrc}
                  className='review-avatar'
                  alt='profile'
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatarImg;
                  }}
                />

                <span className='review-user'>
                  {r.writerUserId.slice(0, 3)}****
                </span>

                <span className='review-rating'>
                  {"★".repeat(Math.round(r.rating))}
                  {"☆".repeat(5 - Math.round(r.rating))}
                </span>
              </div>

              <div className='text-muted review-date'>
                {new Date(r.createdDate).toLocaleDateString()}
              </div>
            </div>

            {/* 수정 모드 */}
            {isEditing ? (
              <div className="review-edit-box">

                <input
                  className="review-edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />

                <textarea
                  className="review-edit-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />

                <div className="review-edit-actions">
                  <button className="btn-edit-save" onClick={submitEdit}>
                    저장
                  </button>
                  <button className="btn-edit-cancel" onClick={cancelEdit}>
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 일반 출력 */}
                <div className='mb-2 review-title-line'>
                  후기 : <span className='review-title-text'>{r.title}</span>
                </div>

                <div className='d-flex justify-content-between gap-4'>
                  <div style={{ flex: 1 }}>
                    <div className='review-content-text'>
                      {r.content}
                    </div>
                  </div>

                  {r.imageUrl && (
                    <img src={r.imageUrl} alt="review" className="review-thumbnail" />
                  )}
                </div>
              </>
            )}

            {/* 좋아요 */}
            <div className="review-action-row">
              <button
                className={`btn btn-sm like-btn ${r.liked ? "liked" : ""}`}
                onClick={() => onLike(r.reviewId)}
              >
                {Number(r.liked) === 1 ? <FaThumbsUp /> : <FaRegThumbsUp />}
                {" "}
                좋아요 ({r.likeCount ?? 0})
              </button>

              {isWriter && !isEditing && (
                <button
                  className="review-edit-btn"
                  onClick={() => startEdit(r)}
                >
                  <FaEdit /> 수정
                </button>
              )}
            </div>

            {/* 판매자 답글 */}
            {r.reply && (
              <div className="seller-reply">
                <strong>판매자</strong><br />
                {r.reply}
              </div>
            )}

          </div>
        );
      })}

    </div>
  );
};

export default ReviewList;