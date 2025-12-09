import React, { useEffect, useState } from 'react';
import ReviewStats from '../../components/review/ReviewStats';
import ReviewList from '../../components/review/ReviewList';
import "../../assets/css/review.css"
import { fetchReviews, likeReview, updateReview } from '../../assets/js/api/ReviewApi';
import {useNavigate} from 'react-router-dom'

const StoreReviewPage = ({productId}) => {

    const navigate = useNavigate()

    const [reviews,setReviews] = useState([])
    const [sort, setSort] = useState("latest")
    const [keyword, setKeyword] = useState("")

    const loginUser = JSON.parse(localStorage.getItem("loginUser"));
    const loginUserNo = loginUser?.userNo;  
    const loginUserId = loginUser?.userId;

    const loadReviews = async () => {
        try {
        const response = await fetchReviews(productId, sort, keyword, loginUserNo);

        const fixedReviews = response.data.map(r => ({
            ...r,
            liked: r.liked === 1,
        }));

        setReviews(fixedReviews);

        } catch (err) {
        console.error("리뷰 로딩 실패:", err);
        }
    };

    const handleLike = async (reviewId) => {
        try {
        const res = await likeReview(reviewId, loginUserNo);
        const { liked, likeCount, message } = res.data;

        alert(message);

        setReviews((prev) =>
            prev.map((r) =>
            r.reviewId === reviewId
                ? { ...r, liked, likeCount }
                : r
            )
        );

        } catch (err) {
        console.error("좋아요 실패: ", err);
        }
    };

    useEffect(() => {
        if (!productId) return;
        loadReviews();
    }, [productId, sort, keyword]);


    const handleUpdate = async (reviewId, data) => {
        try {
            await updateReview({
            reviewId: Number(reviewId),
            title: String(data.title),
            content: String(data.content)
            });

            alert("리뷰가 수정되었습니다.");
            loadReviews();
        } catch (err) {
            console.error(err);
            alert("리뷰 수정 실패");
        }
        };

    return (
        <div className='review-page-container'>
            <div className='review-header'>
                <button className='review-write-btn' onClick={()=>navigate('/mypage')}>리뷰 작성하기</button>
            </div>
            {/* 리뷰 별점 */}
            <ReviewStats reviews={reviews} />

            <div className='review-sort-search'>
                <div className='sort-options'>
                    <span className={sort === "recommended" ? "active" : ""} onClick={() => setSort("recommended")}>추천순</span>
                    <span className={sort === "latest" ? "active" : ""} onClick={() => setSort("latest")}>최신순</span>
                    <span className={sort === "rating" ? "active" : ""} onClick={() => setSort("rating")}>별점순</span>
            </div>

            <input type='text' placeholder='리뷰 검색 (제목 / 내용)' value={keyword} onChange={(e) => setKeyword(e.target.value)} className='review-search' />
            </div>

            {reviews.length === 0? (
                <div className='review-empty'>
                    현재 등록된 리뷰가 없습니다.
                </div>
            ):(    
                <ReviewList reviews={reviews} onLike={handleLike} onUpdate={handleUpdate} />
            )}
        </div>
    );
};

export default StoreReviewPage;