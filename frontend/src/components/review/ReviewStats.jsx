import React from 'react';
import "../../assets/css/review.css"
import CilGlass from '../../assets/icons/CilGlass.svg';

const ReviewStats = ({reviews}) => {//평균 별점 출력 + 그래프
    
    if(!reviews || reviews.length ===0) return null

    //평균 별점
    const avgRaing = (//모든 리뷰 별점을 더한다음 리뷰 갯수로 나눠서 평균 계산
        reviews.reduce((sum,r) => sum + r.rating,0) / reviews.length
    ).toFixed(1)

    //별점 분포 계산
    const ratingLevels = [5,4,3,2,1];
    //해당 별점을 가진 리뷰만 걸러서 배열로 저장
    const ratingCount = ratingLevels.map(star =>
    reviews.filter(r => r.rating === star).length
    );

    //태그분석 - 태그를 펼쳐서 하나의 배열로 제작
    const tags = reviews.flatMap(r => r.productTags?.split(",") || [])
    const tagStats = Object.entries(
        tags.reduce((acc,t)=> {
            acc[t] = (acc[t] || 0) +1
            return acc
        },{})
    ).sort((a,b)=> b[1] -a[1])
    
    return (
        <div className="review-card shadow-sm p-4 mb-4 rounded">

        <div className="d-flex gap-5 align-items-center">
            
            {/* 왼쪽: 평균 별점 */}
            <div className="text-center" style={{ minWidth: "140px" }}>
            <h1 className="fw-bold" style={{ fontSize: "48px", color: "#333" }}>
                ⭐ {avgRaing}
            </h1>
            <div className="text-muted">{reviews.length}개의 리뷰 기반</div>
            </div>

            {/* 오른쪽: 별점 그래프 */}
            <div className="flex-grow-1 rating-chart">
            {ratingLevels.map((star, idx) => (
                <div key={star} className="d-flex align-items-center mb-2">
                <span style={{ width: "40px", fontSize: "14px", color:"#444" }}>
                    {star}점
                </span>

                <div className="progress flex-grow-1 me-2" style={{ height: "8px" }}>
                    <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{
                        width: `${(ratingCount[idx] / reviews.length) * 100}%`,
                    }}
                    />
                </div>

                <span style={{ width: "20px", fontSize:"14px", color:"#333" }}>
                    {ratingCount[idx]}
                </span>
                </div>
            ))}
            </div>
        </div>

        {/* ----- 키워드 섹션 ----- */}
        <h5 className="fw-semibold mt-4 mb-3"><img src={CilGlass} alt="돋보기"/>리뷰 키워드</h5>
        <div className="d-flex flex-wrap gap-2">
            {tagStats.map(([tag,count],i)=>(
            <span key={i} className='badge bg-light text-dark border px-3 py-2'>
                {tag} <span className='text-success fw-bold'>({count})</span>
            </span>
            ))}
        </div>

        </div>
    );
};

export default ReviewStats;