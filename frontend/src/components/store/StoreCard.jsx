import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/store.css';

const StoreCard = ({store}) => {

    const navigation = useNavigate();

    if(!store) return null;

    const handleClick = () => {
        navigation(`/store/${store.producerId}`);
    }

    return (
        <div className='store-card' onClick={handleClick}>
            <img src={store.thumbnailUrl} alt={store.storeName} className='store-card-thumb'/>
            <div className='store-info'>
                <div className='store-label'>{store.storeName}</div>
                    <p className='store-desc'>{store.description}</p>
                </div>
            </div>
    );
};

export default StoreCard;