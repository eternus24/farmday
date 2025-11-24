import React from 'react';
import '../../assets/css/shopDetail.css';
import jejuImg from '../../assets/img/제목 없음.png';

import globe from '../../assets/icons/StreamlinePlumpFoodTruckEventFair.svg';
import group from '../../assets/icons/MdiAccountGroup.svg';
import refri from '../../assets/icons/IconParkOutlineRefrigerator.svg';
import bank from '../../assets/icons/IcOutlineFoodBank.svg';
import cook from '../../assets/icons/StreamlineFoodKitchenwareForkSpoonForkSpoonFoodDineCookUtensilsEatRestaurantDining.svg';

const StoreDesc = ({product,images}) => {//상품 설명
    return (
        <div className='kurly-check-wrap'>
            <h2 className='kurly-check-title'>Framday Check Point</h2>
            <br/>
            <div className='kurly-check-grid'>
                <div className='check-item'>
                    <h4><img src={globe} alt="유통" className="icon"/>생산 유통 과정</h4>
                    <ul>
                        <li>HACCP 인증 시설에서 위생적으로 생산</li>
                        <li>산지에서 수확 즉시 선별 및 품질 검수 진행</li>
                        <li>신선도를 유지하는 최적의 포장,보관 시스템</li>
                    </ul>
                </div>

                <div className='check-item'>
                    <h4><img src={cook} alt="활용" className="icon"/>활용법</h4>
                    <ul>
                        <li>다양한 요리와 조리에 손쉽게 활용 가능</li>
                        <li>식재료 고유의 풍미를 살린 간편 조리 가능</li>
                        <li>일상 식사부터 특별한 메뉴까지 다양하게 어울리는 식재료</li>
                    </ul>
                </div>

                <div className='check-item'>
                    <h4><img src={group} alt="활용" className="icon"/>브랜드와 생산자</h4>
                    <ul>
                        <li>지역 특산물 및 전문 생산자가 직접 관리</li>
                        <li>정직한 재배,양식 과정을 통해 품질 보증</li>
                        <li>지속 가능한 방식으로 자연 친화적 생산</li>
                    </ul>
                </div>

                <div className='check-item'>
                    <h4><img src={refri} alt="보관" className="icon"/>보관 및 저장</h4>
                    <ul>
                        <li>직사광선을 피하고, 서늘한 곳에 보관</li>
                        <li>신선도 유지를 위해 개봉 후 빠른 섭취 권장</li>
                        <li>식재료 종류에 따라 냉장/냉동 보관 시 더 오래 보관 가능</li>
                    </ul>
                </div>
            </div>
            <br/>
            {/* 상세 설명 */}
            {product.detailDesc && (
                <div className='detail-desc-text'>
                    <h3><img src={bank} alt="소개" className="icon"/>상품 소개</h3>
                    <p>{product.detailDesc}</p>
                </div>
            )}

            {/* 상세 이미지 */}
            <div className='detail-info-box'>
                <img src={product.mainImage || product.mainimage} alt={product.name}className="detail-sub-image"/>
            </div>

            <div className='detail-info-box'>
                <img src={jejuImg}/>
            </div>

            {images.map((img,index) => (
                <div key={index} className='detail-info-box'>
                    <img src={img.imageUrl} className="detail-sub-image" />
                </div>
            ))}

        </div>
    );
};

export default StoreDesc;