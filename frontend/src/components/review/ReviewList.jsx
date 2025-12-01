import React from 'react';
import "../../assets/css/review.css";
import { FaRegThumbsUp } from "react-icons/fa";

const ReviewList = ({reviews}) => {//리뷰 전체 목록 렌더링
    
  return (
        <div className='review-wrapper'>

            {reviews.map((r) => (
               <div key={r.reviewId} className='review-row'>
                <div className="d-flex justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                  <img src={r.userPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className='review-avatar' alt='profile'/>
                  <span className='review-user'>
                    {r.writerUserId.slice(0,3)}****
                  </span>

                  <span className='review-rating'>
                    {"★".repeat(Math.round(r.rating))}
                    {"☆".repeat(5 - Math.round(r.rating))}
                  </span>
                </div>

                <div className='text-muted' style={{fontSize: '13px', fontWeight: '500'}}>
                  {new Date(r.createdDate).toLocaleDateString()}
                </div>
              </div>

              <div className='mb-2' style={{fontSize: '14px', color: '#666', fontWeight: '500'}}>
                후기 : <span className='fw-semibold' style={{color: '#000'}}>{r.title}</span>
              </div>

              {/* 컨텐츠 이미지 */}
              <div className='d-flex justify-content-between gap-4'>
                <div style={{flex:1}}>
                  <div className='review-content-text'>
                    {r.content}
                  </div>
            </div>

            {r.imageUrl && (
              <img src={r.imageUrl} alt="review" className="review-thumbnail" />
            )}
          </div>

          {/* 좋아요 버튼 */}
          <button className="btn btn-light btn-sm mt-3 like-btn">
            <FaRegThumbsUp /> 도움이 돼요 {r.likeCount}
          </button>

          {/* 판매자 답글 표시 */}
          {r.reply && (
            <div className="seller-reply">
              <strong>판매자</strong><br/>
              {r.reply}
            </div>
          )}

        </div>
      ))}

    </div>
  );
};

export default ReviewList;