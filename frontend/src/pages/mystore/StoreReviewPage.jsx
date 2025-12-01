import React, { useEffect, useState } from 'react';
import ReviewStats from '../../components/review/ReviewStats';
import ReviewList from '../../components/review/ReviewList';
import "../../assets/css/review.css"
import { fetchReviews } from '../../assets/js/api/ReviewApi';
import ReviewFilter from '../../components/review/ReviewFilter';
import {useNavigate} from 'react-router-dom'

const StoreReviewPage = ({productId}) => {

    const navigate = useNavigate()

    const [reviews,setReviews] = useState([])
    const [sort, setSort] = useState("latest")
    const [keyword, setKeyword] = useState("")

    const loadReviews = async() => {
        try{
            const response = await fetchReviews(productId,sort,keyword)
            setReviews(response.data)
        }catch(err){
            console.error('리뷰 로딩 실패:',err)
        }
    }

    useEffect(()=>{
        loadReviews()
    },[sort,keyword])

    return (
        <div className='review-page-container'>
            <div className='review-header'>
                <button className='review-write-btn' onClick={()=>navigate('/review/write')}>리뷰 작성하기</button>
            </div>
            {/* 리뷰 별점 */}
            <ReviewStats reviews={reviews} />

            <ReviewFilter sort={sort} setSort={setSort} keyword={keyword} setKeyword={setKeyword} />

            <div className='review-sort-search'>
                <div className='sort-options'>
                    <span className={sort === "recommended" ? "active" : ""} onClick={() => setSort("recommended")}>추천순</span>
                    <span className={sort === "latest" ? "active" : ""} onClick={() => setSort("latest")}>최신순</span>
                    <span className={sort === "rating" ? "active" : ""} onClick={() => setSort("rating")}>별점순</span>
            </div>

            <input type='text' placeholder='리뷰 검색 (제목 / 내용)' value={keyword} onChange={(e) => setKeyword(e.target.value)} className='review-search' />
            </div>
            <ReviewList reviews={reviews} onDelete={loadReviews} />

        </div>
    );
};

export default StoreReviewPage;