// src/components/chatbot/ChatMessage.jsx
import React from "react";
import ChatProductCard from "./ChatProductCard";

const ChatMessage = ({ from, text, buttons, category, products, onButtonClick }) => {
  return (
    <div className={`chat-message ${from}`}>
      <div className={`bubble ${products ? "has-products" : ""}`}>
        {text && <div className="message-text">{text}</div>}

        {/* 버튼들 */}
        {buttons && buttons.length > 0 && (
          <div className="button-group">
            {buttons.map((btn, idx) => (
              <button key={idx} className="menu-button" onClick={() => onButtonClick(btn)} >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* 상품 카드 슬라이더 */}
        {products && products.length > 0 && (
          <div className="chat-product-slider">
            {products.map((p) => (
              <ChatProductCard key={p.productId} product={p}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
