import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../assets/css/chatbot.css";

const ChatProductCard = ({product}) => {
    
    const navigate = useNavigate();

    const {
        productId, name, mainImage, price
    } = product;

    const formatPrice = (p) => p != null ? `${p.toLocaleString("ko-kr")}원`:"-";
    
    return (
        <div className='chat-product-card' onClick={()=>navigate(`/shop/detail/${product.productId}`)}>
            <div className='chat-product-image-wrap'>
                {mainImage ? (
                    <img src={mainImage} alt={name} className='chat-product-image'/>
                ):(
                    <div className='chat-product-image placeholder'>이미지 없음</div>
                )}
            </div>

            <div className='chat-product-body'>
                <div className='chat-product-name'>{name}</div>
                <div className="chat-product-footer">
                    <span className="chat-product-price">{formatPrice(price)}</span>
                </div>
            </div>
        </div>
    );
};

export default ChatProductCard;