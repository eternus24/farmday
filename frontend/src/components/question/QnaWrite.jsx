import React, { useState, useContext } from 'react';
import "../../assets/css/question.css";
import { insertQuestion } from "../../assets/js/api/QuestionApi";
import { AuthContext } from '../../contexts/AuthContext';

const QnaWrite = ({ storeId, productId, onClose }) => {

  const { auth } = useContext(AuthContext);

  const [qnaTitle, setQnaTitle] = useState("");
  const [qnaContent, setQnaContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [qnaCategory, setQnaCategory] = useState("상품문의");

  const handleSubmit = async () => {
    const loginId = localStorage.getItem("userId");

    const data = {
      productId,
      storeId : storeId,
      writerUserId: auth.name,
      title: qnaTitle,
      content: qnaContent,
      isPrivate: isPrivate ? "Y" : "N",
      status: "WAITING",
      qnaCategory,
    };
      console.log("qnaCategory:", qnaCategory);
      console.log("보내는 data:", data);

    try {
      await insertQuestion(data);
      alert("QnA 문의 등록 완료!");
      window.location.reload();
    } catch (err) {
      console.error("QnA 문의 등록 실패:", err);
      alert("QnA 문의 등록 실패");
    }
  };

  return (
    <div className="qna-modal-backdrop" onClick={onClose}>
      <div className="qna-modal" onClick={(e) => e.stopPropagation()}>

        <div className="qna-modal-header">
          <h3>상품 Q&A 작성하기</h3>
        </div>
        <div className="qna-modal-body">

          {/* 카테고리 */}
        <div className="qna-form-group">
          <label className="qna-form-label">문의 유형</label>
          <select className="qna-form-input" value={qnaCategory}
            onChange={e => setQnaCategory(e.target.value)} >
              
            <option value="상품문의">상품문의</option>
            <option value="배송문의">배송문의</option>
            <option value="환불/교환문의">환불/교환문의</option>
            <option value="주문/결제문의">주문/결제문의</option>
            <option value="포장문의">포장문의</option>
            <option value="기타문의">기타문의</option>
          </select>
        </div>


          {/* 작성자 */}
          <div className="qna-form-group">
            <label className="qna-form-label">작성자</label>
            <input className="qna-form-input" readOnly value={auth.name} />
          </div>

          {/* 제목 */}
          <div className="qna-form-group">
            <label className='qna-form-label'>제목</label>
            <input type="text" className="qna-form-input" value={qnaTitle}
              onChange={(e) => setQnaTitle(e.target.value)} placeholder="제목을 입력하세요"/>
          </div>

          {/* 내용 */}
          <div className="qna-form-group">
            <label className='qna-form-label'>내용</label>
            <textarea className="qna-textarea" value={qnaContent}
              onChange={(e) => setQnaContent(e.target.value)} placeholder="문의 내용을 입력하세요" />
            <div className="qna-char-count">{qnaContent.length} / 1000</div>
          </div>

          {/* 비공개 체크 */}
          <label className="qna-private-check">
            <input type="checkbox" checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)}
            />비공개로 작성하기 </label>
        </div>

        <div className="qna-modal-footer">
          <button className="qna-btn-cancel" onClick={onClose}>
            취소
          </button>
          <button className="qna-btn-submit" onClick={handleSubmit}>
            등록
          </button>
          </div>
      </div>
    </div>
  );
};

export default QnaWrite;