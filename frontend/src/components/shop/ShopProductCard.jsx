import React, { useContext } from 'react'
import { useNavigate } from "react-router-dom";
import '../../assets/css/shopfilter.css';
import { CartContext } from '../../contexts/CartContext';

const ShopProductCard = ({product}) => {//상품 카드(이미지/가격/찜 버튼)

    //한국 기준 가격표
    const formatPrice = (price) => price.toLocaleString('ko-kr') + '원';
    console.log("렌더링되는 product:", product);//확인용

    const navigate = useNavigate()


    //장바구니 등록 기능 (2025-11-24 14:53 추가) ======================
    const { protocol, hostname } = window.location;
    const API_BASE = `${protocol}//${hostname}:8080`;
    const user_id = JSON.parse(window.localStorage.getItem('loginUser')).userId;
    const { findCartAmount } = useContext(CartContext);

    async function insertCart(product_id,product_name) {
        const cartUploadData = [{
            product_id: product_id,
            quantity: 1
        }]
        const res = await fetch(`${API_BASE}/cart/insertCart/${user_id}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cartUploadData),
        });
        if (!res.ok) {
            const msg = await res.text();
            if (res.status === 400 && msg === "ALREADY_IN_CART") {
                alert("이미 장바구니에 있는 상품입니다.");
                return;
            }
            throw new Error(`HTTP ${res.status}`);
        }
        alert(`${product_name}을(를) 장바구니에 담았습니다.`)

        await findCartAmount();
    }
    // ===========================================================


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

                <button className='btn border border-secondary rounded-pill px-3 text-primary' onClick={() => insertCart(product.productId,product.name)}>
                    <i className='fa fa-shopping-bag me-2 text-primary'></i>
                Add to cart
                </button>
                </div>
            </div>
        </div>
    );
};

export default ShopProductCard;