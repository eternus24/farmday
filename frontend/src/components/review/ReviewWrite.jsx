import React, { useState, useContext } from "react";
import "../../assets/css/review.css";
import { writeReview } from "../../assets/js/api/ReviewApi";
import ReviewTags from "./ReviewTags";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

export default function ReviewWrite() {

  const { auth } = useContext(AuthContext);   //로그인 정보 가져오기
  const location = useLocation();
  const orderItem = location.state;
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const product = {
    productId: orderItem?.product_id,
    name: orderItem?.product_name,
    mainImage: orderItem?.main_image,
    price: orderItem?.price_at_order
  };

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleImageUploadLocal = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setFileName(file.name);
  };

  /** ================================
   *   리뷰 저장 + 이미지 업로드
   =================================*/
  const handleSubmit = async () => {
    if (rating === 0 || content.length < 10) {
      alert("⭐ 별점 + 10자 이상의 리뷰를 입력해주세요.");
      return;
    }

    let uploadedImageUrl = "";

    try {
      /** 1) S3 업로드- 아마존 서버 업로드 */
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);

        const uploadRes = await fetch("http://192.168.0.76:8080/api/images/upload", {
          method: "POST",
          body: fd
        });

        if (!uploadRes.ok) throw new Error("이미지 업로드 실패");

        const uploadData = await uploadRes.json(); // {url:"xxx"}
        uploadedImageUrl = uploadData.url;
      }

      /** 2) 리뷰 작성 (writerUserId 포함) */
      const reviewData = {
        productId: product.productId,
        orderItemId: orderItem.order_item_id,
        writerUserId: loginUser?.userId,    
        title,
        rating,
        content,
        productTags: selectedCategories.join(", "),
        imageUrl: uploadedImageUrl
      };

      console.log("보내는 리뷰 데이터:", reviewData);
      const res = await writeReview(reviewData);

      if(res?.data?.earnPoint){
        alert(`✅ 리뷰가 등록되었습니다!\n\n🎁 적립 포인트: ${res.data.earnPoint.toLocaleString()}P`)
      }else {
        alert("리뷰가 등록되었습니다.")
      }
      window.history.back();
    } catch (e) {
      console.error(e);
      alert("리뷰 등록 실패: " + e.message);
    }
  };

  return (
    <div className="review-write-container">
      <div className="review-write-layout">

        {/* LEFT: 상품 정보 */}
        <div className="review-left-section">
          <img src={product.mainImage} alt={product.name} className="review-product-image" />

          <div className="review-product-info">
            <h3>{product.name}</h3>
            <p>{product.price?.toLocaleString()}원</p>
          </div>

          <button className="review-select-btn" onClick={() => setShowModal(true)}>
            📝 후기 선택하기
          </button>

          {selectedCategories.length > 0 && (
            <div className="selected-review-tags">
              {selectedCategories.map(tag => (
                <span key={tag} className="selected-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: 리뷰 작성 */}
        <div className="review-form-section">

          {/* 제목 */}
          <div className="review-title-box">
            <label className="review-label">리뷰 제목</label>
            <input
              type="text"
              className="review-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={40}
              placeholder="예: 신선하고 만족했어요!"
            />
          </div>

          {/* 별점 */}
          <div className="review-rating-box">
            <label className="review-label">별점 선택</label>
            <div className="star-container">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="star-icon" onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                  style={{
                    color: (hover || rating) >= star ? "#ff9741" : "#e5e5e5"
                  }}> ★ </span>
              ))}
            </div>
            <div className="rating-text">
              {rating ? `${rating}점` : "별점을 선택하세요"}
            </div>
          </div>

          {/* 후기 내용 */}
          <div className="review-textarea-box">
            <label className="review-label">솔직한 후기</label>
            <textarea
              className="review-textarea"
              maxLength={1000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="실제 사용 후기를 솔직하게 작성해주세요."
            ></textarea>
            <div className="char-count">{content.length}/1000</div>
          </div>

          {/* 이미지 업로드 */}
          <div className="review-upload-box">
            <label className="upload-label-btn">
              {fileName ? "이미지 변경" : "📷 이미지 업로드"}
              <input type="file" accept="image/*" hidden onChange={handleImageUploadLocal} />
            </label>

            {fileName && <div className="uploaded-file-name">📎 {fileName}</div>}
          </div>

          {/* 등록 버튼 */}
          <div className="review-submit-box">
            <button className="review-submit-btn" onClick={handleSubmit}>
              등록하기
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ReviewTags selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}