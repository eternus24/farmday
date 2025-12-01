import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../../assets/css/shopfilter.css';

const ShopProductCard = ({product}) => {//상품 카드(이미지/가격/찜 버튼)

    //한국 기준 가격표
    const formatPrice = (price) => price.toLocaleString('ko-kr') + '원';
    console.log("렌더링되는 product:", product);//확인용
    
    const [liked, setLiked] = useState(false);
    const navigate = useNavigate()

    //요일 배열
    const days = ["일", "월", "화", "수", "목", "금", "토"];

    // 날짜 포맷
    const formatDate = (dateString) => {
    if (!dateString) return "";

        const date = new Date(dateString);
        const weekday = days[date.getDay()];

        return `${date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        })} (${weekday})`;
    };
    return (
        <div className='product-card-wrapper'onClick={()=>navigate(`/shop/detail/${product.productId}`)}>
            {/* 상품 이미지 */}
            <div className="fruite-img" style={{ height: "200px", overflow: "hidden" }}
            onClick={()=>navigate(`/shop/detail/${product.productId}`)}>
                <img
                    src={(product.mainImage || product.mainimage)?.trim()}
                    alt={product.name}
                    style={{
                        height: "100%",
                        width:"100%",
                        objectFit: "cover",
                        objectPosition:"center"
                    }}
                />
            </div>

            {/* 상품 본문 */}
            <div className='p-3 border-secondary border-top-0 rounded-bottom bg-white'>
            {/* 상품명 + 하트 버튼 (여기에 배치!!) */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className='fw-bold mb-0'>{product.name}</h5>

                {/* 하트 아이콘 */}
                <span onClick={(e) => { e.stopPropagation();
                        setLiked(!liked); }}
                    style={{ cursor: "pointer", fontSize: "22px", fontWeight: "bold",
                        color: liked ? "#ff5052ff" : "#cccccc" }} > ♥
                </span>
            </div>

            <p className='text-muted' style={{
                minHeight: "45px",
                fontSize: "15px"
            }}>
                <p className="product-date">
                    재배일&nbsp; <span>{formatDate(product.createdDate)}</span>
                </p>
            </p>
                {/* 가격&장바구니 버튼 */}
                <div className='d-flex justify-content-between align-items-center mt-3'>
                    <p className='text-dark fs-5 fw-bold mb-0'>
                        {formatPrice(product.price)}
                    </p>

                <button className='btn border border-secondary rounded-pill px-3 text-primary'>
                    <i className='fa fa-shopping-bag me-2 text-primary'></i>
                Add to cart
                </button>
                </div>
            </div>
        </div>
    );
};

export default ShopProductCard;