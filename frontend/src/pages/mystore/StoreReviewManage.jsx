import React, {useEffect,useState} from 'react';
import { useOutletContext } from 'react-router-dom';
import { getStoreReviews,updateReply } from '../../assets/js/api/ReviewApi';
import '../../assets/css/storeReviewReply.css';

const StoreReviewManage = () => {

    const {store} = useOutletContext();
    const [reviews, setReviews] = useState([]);
    const [editingReply,setEditingReply] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [tab, setTab] = useState("written")

    useEffect(() => {
        if(!store?.storeId) return;

        getStoreReviews(store.storeId)
            .then(res => setReviews(res))
            .catch(err => console.error("스토어 리뷰 조회 실패: ", err))
    },[store])

    const handleReplySave = async(reviewId) => {
        try{
            await updateReply(reviewId,replyText);

           setReviews(prev => 
            prev.map(r => 
                r.reviewId === reviewId ? { ...r, reply: replyText } : r
                )
            );
            alert("답글이 등록되었습니다.")
            setEditingReply(null);
            setReplyText("");
        }catch(err){
            console.error("답글 저장 실패:",err);
            alert("답글 저장 실패");
        }
    }

    const filteredReviews = reviews.filter(r => {
        if(tab === "written") return true;
        if(tab === "unwritten") return !r.reply;
    })

    return (
        <div className='review-manage-container'>
            <div className="review-tab-nav">
                <button className={tab === "written" ? "active" : ""} onClick={() => setTab("written")}>
                    전체 리뷰
                </button>
                <button className={tab === "unwritten" ? "active" : ""} onClick={() => setTab("unwritten")}>
                    미답변 리뷰
                </button>
            </div>

            {!reviews || reviews.length === 0 ? (
                <div className='review-empty-state'>
                    <div className='empty-icon'>📝</div>
                    <p>등록된 리뷰가 없습니다.</p>
                </div>
            ):(
                <div className="review-grid">
                    {filteredReviews.map((r) => (
                        <div key={r.reviewId} className='review-card-modern'>
                            {/* 리뷰 헤더 */}
                            <div className='review-card-header'>
                                <div className='review-title-modern'>{r.title}</div>
                                {r.reply && (
                                    <span className='reply-status-badge'>답변완료</span>
                                )}
                            </div>

                            {/* 리뷰 내용 */}
                            <div className='review-content-modern'>{r.content}</div>

                            {/* 이미지 */}
                            {r.imageUrl && (
                                <div className='review-image-wrapper'>
                                    <img src={r.imageUrl} alt='리뷰 이미지' className='review-image-modern'/>
                                </div>
                            )}

                            {/* 기존 답글 표시 */}
                            {r.reply && editingReply !== r.reviewId && (
                                <div className='seller-reply-display'>
                                    <div className='reply-header'>
                                        <span className='seller-badge-modern'>판매자</span>
                                        <span className='reply-label'>답글</span>
                                    </div>
                                    <div className='reply-content'>{r.reply}</div>
                                </div>
                            )}

                            {/* 답글 작성/수정 영역 */}
                            {editingReply === r.reviewId ? (
                                <div className='reply-edit-form'>
                                    <div className='reply-form-header'>
                                        <span className='seller-badge-modern'>판매자</span>
                                        <span className='reply-label'>답글 {r.reply ? '수정' : '작성'}</span>
                                    </div>
                                    <textarea 
                                        value={replyText} 
                                        onChange={(e) => setReplyText(e.target.value)} 
                                        rows={4} 
                                        className='reply-textarea-modern'
                                        placeholder='고객님께 답글을 작성해주세요...'
                                    />
                                    <div className='reply-action-buttons'>
                                        <button 
                                            className='reply-cancel-btn-modern' 
                                            onClick={() => {
                                                setEditingReply(null);
                                                setReplyText("");
                                            }}
                                        >
                                            취소
                                        </button>
                                        <button 
                                            className='reply-save-btn-modern' 
                                            onClick={() => handleReplySave(r.reviewId)}
                                        >
                                            저장
                                        </button>
                                    </div>
                                </div>
                            ):(
                                <button 
                                    className='reply-write-btn-modern' 
                                    onClick={() => {
                                        setEditingReply(r.reviewId); 
                                        setReplyText(r.reply || "");
                                    }}
                                >
                                    {r.reply ? "답글 수정" : "답글 작성"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StoreReviewManage;