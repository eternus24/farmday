import React, { useState } from 'react';
import "../../assets/css/review.css";

const ReviewTags = ({selectedCategories,setSelectedCategories,onClose}) => {

    // 후기 카테고리 목록
    const categoryList = {
  "상품특징": ["신선해요", "품질이 좋아요", "크기가 적당해요", "향이 좋아요", "색이 선명해요", "모양이 예뻐요", "흠집이 거의 없어요", "알이 굵어요", "보관기간이 길어요"],
  "배송": ["포장이 깔끔해요", "빠른 배송", "파손 없이 도착", "배송기사님 친절", "아이스팩 유지 잘됨", "신선포장 좋음", "정확한 배송 날짜"],
  "맛": ["달콤해요", "아삭해요", "과즙이 많아요", "고소해요", "새콤달콤해요", "담백해요", "풍미가 깊어요"],
  "가격/가성비": ["가격이 합리적", "가성비 좋아요", "양이 많아요", "특가 구매", "가격 대비 만족"],
  "활용도": ["요리에 좋아요", "바로 먹기 좋아요", "선물용 좋아요", "보관 편해요", "손질 쉬워요", "아이 간식 추천"],
  "농가/생산자": ["친환경 재배", "생산자가 믿음가요", "설명이 상세함", "지역 특산품"],
  "재구매 의사": ["다음에도 구매할게요", "재구매 의사 있어요", "추천하고 싶어요"]
};

    const toggleCategory = (tag) => {
      if (selectedCategories.includes(tag)) {
        setSelectedCategories(selectedCategories.filter(t => t !== tag));
      } else if (selectedCategories.length < 6) {
        setSelectedCategories([...selectedCategories, tag]);
      } else {
        alert("최대 6개 선택 가능합니다.");
      }
    };
    
    return (
        <div className="modal-overlay">
      <div className="modal-content">
          <div className="modal-close-x" onClick={onClose}>✕</div>
        <h6 className="modal-title">상세 후기 선택</h6>
        <p>(최대 6개 선택 가능)</p>

        {Object.entries(categoryList).map(([group, items]) => (
          <div key={group} className="review-group">
            <h6>{group}</h6>
            <div className="tag-list">
              {items.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${selectedCategories.includes(tag) ? "active" : ""}`}
                  onClick={() => toggleCategory(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="modal-actions">
          <button className="btn-confirm" onClick={onClose}>선택 완료</button>
        </div>

      </div>
    </div>
  );
};

export default ReviewTags;