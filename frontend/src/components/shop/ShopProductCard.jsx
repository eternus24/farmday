import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../../assets/css/shopfilter.css';
import { CartContext } from '../../contexts/CartContext';

const ShopProductCard = ({product}) => {//상품 카드(이미지/가격/찜 버튼)

    //한국 기준 가격표
    const formatPrice = (price) => price.toLocaleString('ko-kr') + '원';
    console.log("렌더링되는 product:", product);//확인용
    
    const [liked, setLiked] = useState(false);
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
        alert(`${product_name}을(를) 장바구니에 담았습니다.`);

        await findCartAmount();
    }

    async function checkWishlist() {
        const response = await fetch(`${API_BASE}/mypage/isWishlistExist?user_id=${user_id}&product_id=${product.productId}`);
        const data = await response.json();
        setLiked(data);
    }

    useEffect(() => {
        checkWishlist();
    },[])

    async function toggleWishlist(e) {
        const response = await fetch(`${API_BASE}/mypage/clickWishlistBtn?user_id=${user_id}&product_id=${product.productId}`, {
            method: "POST",
            credentials: "include",
        });
        if (response.ok) {
            setLiked(!liked);
            if (liked) {
                alert("["+product.name+"] 상품을 찜 목록에서 제거했습니다.");
            } else {
                alert("["+product.name+"] 상품을 찜 목록에 추가했습니다.");
            }
        } else {
            console.error("찜목록 토글 실패:", response.statusText);
        }
    }

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
                        toggleWishlist(e); }}
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

                <button className='btn border border-secondary rounded-pill px-3 text-primary' onClick={(e) => { e.stopPropagation(); insertCart(product.productId, product.name);}}>
                    <i className='fa fa-shopping-bag me-2 text-primary'></i>
                장바구니
                </button>
                </div>
            </div>
        </div>
    );
};

export default ShopProductCard;