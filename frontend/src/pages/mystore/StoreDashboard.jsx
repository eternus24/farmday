import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProducerProducts } from '../../assets/js/api/ShopApi';

const StoreDashboard = () => {//오늘 월간 판매 통계, 인기상품 top5

  const {producerId} = useParams()
  const [products, setProducts] = useState([])
  const navigate = useNavigate()

  //데이터 로드
  useEffect(()=> {
    getProducerProducts(producerId)
      .then((res) => setProducts(res))
      .catch((err) => console.error('상품 조회 실패: ', err))
  },[producerId])

  //인기 top5
  const top5 = [...products]
    .sort((a,b) => (b.salesCount || 0 ) - (a.salesCount || 0))
    .slice(0,5)

  //최근 등록/판매 상품
  const recent = [...products]
    .sort((a,b) => new Date(b.createdDate) - new Date(a.createdDate))
    .slice(0,3)


    return (
        <>
        {/* TOP5 */}
        <section className="store-top-section">
          <h2>인기 TOP 5</h2>
          <div className="top-product-list">
            {top5.length === 0? (
              <p className='empty-text'>데이터가 없습니다.</p>
            ):(
              top5.map((p) => (
                <div className='top-product-card' key={p.productId} onClick={()=> navigate(`/shop/detail/${p.productId}`)}>
                  <div className='thumb'>
                    <img src={p.mainImage} alt={p.name}/>
                  </div>
                  <div className='top-title'>{p.name}</div>
                </div>
              ))
            )}
            </div>
          </section>

        {/* 최근 상품
        <section className="store-recent-section">
          <h2>최근 등록/판매 상품</h2>

          <div className="recent-list">
            {recent.length === 0? (
              <p className='empty-text'>최근 등록된 상품이 없습니다.</p>
            ):(
              recent.map((p) => (
                <div className='recent-card'>

                </div>
                </div>
                </section> */}
        </>
    );
};

export default StoreDashboard;