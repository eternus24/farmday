import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/store.css';

const StoreCard = ({ store, className = "" }) => {
  const navigate = useNavigate();

  if (!store) return null;

  const handleClick = () => {
    navigate(`/store/${store.producerId}`);
  };

  return (
    <div
      className={`store-card ${className}`}   // 외부 클래스 추가 가능
      onClick={handleClick}
    >
      <img
        src={store.thumbnailUrl}
        alt={store.storeName}
        className="store-card-thumb"
      />

      <div className="store-info">
        <div className="store-label">{store.storeName}</div>
        <p className="store-desc">{store.description}</p>
      </div>
    </div>
  );
};

export default StoreCard;