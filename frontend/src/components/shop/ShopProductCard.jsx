import React from 'react'
import { useNavigate } from "react-router-dom";
import '../../assets/css/shopfilter.css';

const ShopProductCard = ({product}) => {//상품 카드(이미지/가격/찜 버튼)

    //한국 기준 가격표
    const formatPrice = (price) => price.toLocaleString('ko-kr') + '원';
    console.log("렌더링되는 product:", product);//확인용

    const navigate = useNavigate()

    return (
        <div className='rounded position-relative fruite-item shadow-sm'>
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
                {/* 상품명 */}
                <h5 className='fw-bold mb-2'>{product.name}</h5>
                {/* 요약 설명 (2줄 제한) */}
                <p className='text-muted' style={{
                    minHeight: "40px",
                    fontSize: "14px"
                }}>
                    {product.summary}
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