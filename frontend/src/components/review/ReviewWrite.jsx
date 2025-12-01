import React, { useState } from 'react';
import "../../assets/css/review.css";
import { writeReview } from "../../assets/js/api/ReviewApi";
import ReviewTags from './ReviewTags';

const ReviewWrite = ({product}) => {
    
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [fileName, setFileName] = useState(null);
    
    // 후기 카테고리 선택 모드
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showModal,setShowModal] = useState(false);
    const [title,setTitle] = useState("");

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setImageFile(file);
      setFileName(file.name);
    };

    const handleSubmit = async () => {
      if (rating === 0 || content.length < 10) {
        alert("⭐ 별점 + 10자 이상의 리뷰를 입력해주세요.");
        return;
      }

      const reviewData = {
        productId: product.productId,
        title,
        rating,
        content,
        reviewTags: selectedCategories.join(", "),//태그 저장
        fileName,
      };

      try {
        await writeReview(reviewData);
        alert("리뷰가 등록되었습니다");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("등록 실패. 다시 시도해주세요.");
      }
    };

    return (
      <div className="review-write-container">
        {/*좌우 2단 레이아웃 */}
        <div className="review-write-layout">
          
          {/* 왼쪽: 상품 정보 (카테고리 선택 모드에서는 숨김) */}
        <div className="review-left-section">
          <img src={product?.mainImage} className="review-product-image" alt={product?.name}/>
            <div className="review-product-info">
              <h6>{product?.name}</h6>
              <span>{product?.price?.toLocaleString()}원</span>
            </div>
            <br/>
            <button className="review-select-btn" onClick={() => setShowModal(true)} >
              📝 후기 선택하기
            </button>

            {selectedCategories.length > 0 && (
              <div className="selected-review-tags">
                {selectedCategories.map((tag) => (
                  <span key={tag} className="selected-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 작성 폼 */}
          <div className="review-form-section">
            <div className="review-title-box">
              <label className="review-label">리뷰 제목</label>
              <input type="text" className="review-title-input"
                placeholder="예: 신선하고 아삭해서 정말 만족했어요!"
                value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40}/>
            </div>

            {/* 별점 선택 */}
            <div className="review-rating-box">
              <label className="review-label">별점을 선택해주세요</label>
              <div className="star-container">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className="star-icon" onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                    style={{ 
                      color: (hover || rating) >= star ? "#ff9741" : "#e5e5e5",
                      fontSize: "36px"
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="rating-text">
                {rating ? `${rating}점` : "별점을 선택하세요"}
              </div>
            </div>

            {/* 후기 선택 버튼 */}
            <div className="review-textarea-box">
            <label className="review-label">솔직한 사용 후기</label>
            <textarea
              className="review-textarea"
              placeholder="실제 사용 후기를 솔직하게 작성해주세요."
              value={content}
              maxLength={1000}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="char-count">{content.length}/1000</div>
          </div>

            {/* 이미지 업로드 (선택시 왼쪽에 미리보기) */}
            <div className="review-upload-box">
              <label className="upload-label-btn">
                {fileName ? "이미지 변경" : "📷 이미지 업로드"}
                <input type="file" accept="image/*" hidden onChange={handleImageUpload}/>
              </label>
              {fileName && (
                <div className="uploaded-file-name">
                  📎 {fileName}
                </div>
              )}
            </div>

            {/* 등록 버튼 */}
            <div className="review-submit-box">
              <button className="review-submit-btn" onClick={handleSubmit} >
                등록하기
              </button>
            </div>
          </div>
        </div>
        {/* 모달 호출 */}
        {showModal && (
          <ReviewTags selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} onClose={() => setShowModal(false)}/>
       )}      

      </div>
    );
};

export default ReviewWrite;