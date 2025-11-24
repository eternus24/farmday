import React,{useState} from 'react';
import '../../assets/css/shopDetail.css';

const ShopOption = ({product}) => {

    const price = product.price || 0;
    //수량
    const [qty,setQty] = useState(1);
    //총 금액 계산
    const total = (price * qty).toLocaleString;
    //상태 값 증가/감소
    const increase = () => setQty(prev=>prev + 1);
    const decrease = () => setQty(prev=> (prev > 1 ? prev -1 : 1));

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
                    <button className='btn-price'>장바구니</button>
                </div>
            
        </div>
    );
};

export default ShopOption;