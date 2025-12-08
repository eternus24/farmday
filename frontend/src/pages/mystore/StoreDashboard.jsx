import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { getProducerProducts } from '../../assets/js/api/ShopApi';
import { getStoreReviews } from '../../assets/js/api/ReviewApi';
import '../../assets/css/store.css';

const StoreDashboard = () => {

  const {producerId} = useParams()
  const [products, setProducts] = useState([])
  const navigate = useNavigate()
  const {store,setStore} = useOutletContext()
  
  const [reviews,setReviews]  = useState([])//리뷰 저장
  const [currentIndex,setCurrentIndex] = useState(0)//슬라이드

  //데이터 로드
  useEffect(()=> {
  getProducerProducts(producerId)
    .then((res) => setProducts(res))
    .catch((err) => console.error('상품 조회 실패: ', err))

    if (store?.storeId) {
      console.log("리뷰 조회 storeId:", store.storeId);

  //리뷰
  getStoreReviews(store.storeId)
    .then((res) => setReviews(res))
    .catch((err) => console.error('리뷰 조회 실패: ', err))
    }
},[producerId,store])

  // 자동 슬라이드 (2초마다)
  useEffect(() => {
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev+1) % reviews.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => prev === 0 ? reviews.length -1 : prev -1
    )
  }

  //최근 등록/판매 상품
  const recent = [...products]
    .sort((a,b) => new Date(b.createdDate) - new Date(a.createdDate))
    .slice(0,3)

    return (
        <>
        {/* 리뷰 슬라이드 */}
        <section className='store-review-slide'>
  {reviews.length === 0 ? (
    <p className='empty-text'>등록된 리뷰가 없습니다.</p>
  ) : (
    <div className='review-slide-box'>

      <div className='review-item'>
        
        <div className='store-review-rating'>
          {'⭐'.repeat(reviews[currentIndex].rating)}
        </div>

          <p className='store-review-content'>
            {reviews[currentIndex].content}
          </p>

          {reviews[currentIndex].title && (
            <div className="store-review-title">
              {reviews[currentIndex].title}
            </div>
          )}

          <div className='store-review-meta'>
            <span className='review-user'>
              {reviews[currentIndex].writerUserId.replace(/(?<=.{3})./g, '*')}
            </span>

            <span className='review-date'>
              {reviews[currentIndex].createdDate?.slice(0, 10)}
            </span>
          </div>
        </div>
      </div>
      )}
      </section>
            
        {/* 최근 상품 */}
        <section className="store-recent-section">
          <h2>최근 등록/인기 상품</h2>

          <div className="recent-list">
            {recent.length === 0? (
              <p className='empty-text'>최근 등록된 상품이 없습니다.</p>
            ):(
              recent.map((p) => (
                <div className="recent-card" key={p.productId}
                  onClick={() => navigate(`/shop/detail/${p.productId}`)} >
                <div className="thumb">
                  <img src={p.mainImage} alt={p.name} />
                </div>

                <div className="recent-info">
                  <div className="recent-title">{p.name}</div>
                  <div className="recent-desc">
                    {p.summary || "등록된 설명이 없습니다."}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
};
export default StoreDashboard;