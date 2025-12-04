import React,{useContext, useState} from 'react';
import '../../assets/css/shopDetail.css';
import { CartContext } from '../../contexts/CartContext';

const ShopOption = ({product}) => {

    const price = product.price || 0;
    //수량
    const [qty,setQty] = useState(1);
    //총 금액 계산
    const total = (price * qty).toLocaleString;
    //상태 값 증가/감소
    const increase = () => setQty(prev=>prev + 1);
    const decrease = () => setQty(prev=> (prev > 1 ? prev -1 : 1));


    //장바구니 등록 기능 (2025-11-24 14:53 추가) ======================
    const { protocol, hostname } = window.location;
    const API_BASE = `${protocol}//${hostname}:8080`;
    const user_id = JSON.parse(window.localStorage.getItem('loginUser')).userId;
    const { findCartAmount } = useContext(CartContext);

    async function insertCart(product_id,product_name) {
        const cartUploadData = [{
            product_id: product_id,
            quantity: qty
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
        <div className='detail-option-wrap'>
            <h4 className='detail-option-title'>상품 선택</h4>

            {/* 선택 박스 */}
            <div className='option-box'>
                <div className='option-name'>{product.name}</div>

                <div className='option-qty'>
                    <button onClick={decrease}>-</button>
                    <span>{qty}</span>
                    <button onClick={increase}>+</button>  
                </div>

                <div className='option-price'>
                    {(price * qty).toLocaleString()}원 
                </div>
            </div>

                {/* 총 금액 */}
                <div className='detail-total-wrap'>
                    <span className='label'>총 상품 금액</span>
                    <span className='total'>{(price * qty).toLocaleString()}원</span>
                </div>

                <div className='detail-btn-wrap'>
                    <button className='btn-buy'>구매하기</button>
                    <button className='btn-price' onClick={() => insertCart(product.productId,product.name)}>장바구니</button>
                </div>
            
        </div>
    );
};

export default ShopOption;