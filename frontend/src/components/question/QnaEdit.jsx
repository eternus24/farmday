import React, { useState } from 'react';
import { updateQuestion } from "../../assets/js/api/QuestionApi";

const QnaEdit = ({qna,onClose,refreshQnaList}) => {//답변 수정

    const [title,setTitle] = useState(qna.title)
    const [content,setContent] = useState(qna.content)
    const [isPrivate,setIsPrivate] = useState(qna.isPrivate==='Y')
    const [qnaCategory,setQnaCategory] = useState(qna.qnaCategory||'상품문의')
    
    const handleSave = async() => {
        const data = {
            qnaId: qna.qnaId,
            title,
            content,
            isPrivate:isPrivate ? 'Y' : 'N',
            qnaCategory,
        }

        try{
            await updateQuestion(data);
            alert("QnA 수정 완료!");
            refreshQnaList();
            onClose();
        }catch(err){
            console.error("QnA 수정 실패:", err);
            alert("QnA 수정 실패");
        }
    }

    return (
        <div className='qna-modal-backdrop' onClick={onClose}>
            <div className='qna-modal-improved' onClick={(e) => e.stopPropagation()}>
                <div className="qna-modal-header">
                  <h3>Q&A 수정하기</h3>
                </div>
                <div className="qna-modal-body">
                {/* 제목 */}
                  <div className="qna-form-group">
                    <label className="qna-form-label">제목</label>
                    <input className='qna-form-input' value={title} 
                      onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div className="qna-form-group">
                    <label className="qna-form-label">문의 유형</label>
                    <select
                      className="qna-form-input"
                      value={qnaCategory}
                      onChange={e => setQnaCategory(e.target.value)}
                    >
                      <option value="상품문의">상품문의</option>
                      <option value="배송문의">배송문의</option>
                      <option value="환불/교환문의">환불/교환문의</option>
                      <option value="주문/결제문의">주문/결제문의</option>
                      <option value="포장문의">포장문의</option>
                      <option value="기타문의">기타문의</option>
                    </select>
                  </div>

                  {/* 내용 */}
                  <div className="qna-form-group">
                    <label className="qna-form-label">내용</label>
                    <textarea 
                      className='qna-form-textarea' 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                    />
                  </div>

                  {/* 비공개 체크 */}
                  <label className='qna-private-check'>
                      <input 
                        type="checkbox" 
                        checked={isPrivate} 
                        onChange={() => setIsPrivate(!isPrivate)} 
                      />
                      <span>비공개로 작성하기</span>
                  </label>
                </div>
                {/* ⭐ 수정: 버튼 영역 */}
                <div className='qna-modal-footer'>
                    <button className='qna-btn-cancel' onClick={onClose}>
                      취소
                    </button>
                    <button className='qna-btn-submit' onClick={handleSave}>
                      저장
                    </button>
                </div>
            </div>
        </div>
    );
};
export default QnaEdit;