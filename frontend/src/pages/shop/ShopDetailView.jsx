import React, { useState } from 'react';
import StoreInfoBox from '../../components/store/StoreInfoBox';
import '../../assets/css/shopDetail.css';
import StoreDesc from '../../components/store/StoreDesc';
import ShopOption from './ShopOption';
import StoreCard from '../../components/store/StoreCard';
import StoreReviewPage from '../mystore/StoreReviewPage';
import QuestionPage from '../../components/question/QuestionPage';

const ShopDetailView = ({product,images,store,productId,storeId}) => {//상품 페이지

    //상세 페이지 탭
    const [tab,setTab] = useState('desc')

    return (
        <div className='detail-container'>
            {/* 이미지+타이틀 */}
            <div className='detail-top'>
            <div className="detail-left">
                <img className='detail-image' src={product.mainImage} alt={product.name} />

                {/* 사진 아래 브랜드 카드 */}
                {store && <StoreCard store={store} />}
            </div>
            
                <div className='detail-info'>
                    <h2>{product.name}</h2>
                    <p className="detail-summary">{product.summary}</p>

                <div className='detail-price-wrap'>
                    <span className='detail-price'>
                        {product?.price?.toLocaleString()}원
                        </span>
                </div>
            <table className="detail-basic-table mt-4">
                        <tbody>
                            <tr>
                                <th>원산지</th>
                                <td>{product.originRegion || "-"}</td>
                            </tr>
                            <tr>
                                <th>등급</th>
                                <td>{product.grade || "-"}</td>
                            </tr>
                            <tr>
                                <th>단위</th>
                                <td>{product.unitName || "-"}</td>
                            </tr>
                            <tr>
                                <th>재고</th>
                                <td>{product.stockQty} 개</td>
                            </tr>
                            <tr>
                                <th>수확일</th>
                                <td>{product.harvestDate || "-"}</td>
                            </tr>
                            <tr>
                                <th>유통기한</th>
                                <td>{product.expireDate || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                    <ShopOption product={product}/>
                </div>
            </div>

            <div className="detail-tabs">
                <div className={`tab-item ${tab === 'desc' ? 'active' : ''}`}
                    onClick={() => setTab('desc')}>상품 설명</div>

                <div className={`tab-item ${tab === 'review' ? 'active' : ''}`}
                    onClick={() => setTab('review')}>
                    후기 ({product.reviews?.length || 0})
                </div>

                <div className={`tab-item ${tab === 'qna' ? 'active' : ''}`}
                    onClick={() => setTab('qna')}>문의</div>

                <div className={`tab-item ${tab === 'delivery' ? 'active' : ''}`}
                    onClick={() => setTab('delivery')}>배송 정보</div>
            </div>

        {/* 탭에 따른 내용 출력 */}
            <div className='detail-tab-content'>
                {tab === 'desc' && <p>{product.description}</p>}

                {tab === 'desc' && (
                    <StoreDesc product={product} images={images}/>
                )}
                {tab === 'review' && (
                    <StoreReviewPage productId={productId} />
                )}
                {tab === 'qna' && (
                    <QuestionPage productId={productId} product={product} store={store} storeId={store.storeId}/>
                )}
                {tab === 'delivery' && (//배송/교환/반품 안내
                    <StoreInfoBox/>
                )}
            </div>
        </div>
    );
};

export default ShopDetailView;