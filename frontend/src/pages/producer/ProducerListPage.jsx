import React, { useEffect, useState } from 'react';
import { getProducerStoreList } from "../../assets/js/api/ProducerStoreApi";
import { useNavigate } from "react-router-dom"
import "../../assets/css/producerCard.css"

const ProducerListPage = () => {

    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {
        getProducerStoreList()
            .then(res => {
                setStores(res.data ?? res);
            })
            .catch(err => {
                console.error("입점 생산자 조회 실패:", err)
            })
    }, [])

    const filteredStores = stores.filter(store =>
        store.storeName?.toLowerCase().includes(keyword.toLowerCase()) ||
        store.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        store.regionSi?.toLowerCase().includes(keyword.toLowerCase()) ||
        store.regionGun?.toLowerCase().includes(keyword.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStores.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const pagedStores = filteredStores.slice(startIdx, startIdx + pageSize);

    return (
        <div className='producer-page'>
            <h2 className='page-title'>입점 생산자</h2>

            <div className='store-search-wrapper'>
                <input 
                    type='text' 
                    className='store-search-input'
                    placeholder='🔍 상점명, 지역, 설명으로 검색하세요' 
                    value={keyword} 
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            <div className='store-grid'>
                {pagedStores.length === 0? (
                    <div className='empty-result'>
                        <span className='empty-icon'>🔍</span>
                        <p>"{keyword}"에 대한<br/>
                        검색 결과가 없습니다.</p>
                    </div>
                ):(
                pagedStores.map((store, index) => (
                    <div key={`${store.producerId}_${index}`} className='producer-card' onClick={() => navigate(`/store/${store.producerId}`)} style={{cursor:"pointer"}}>
                        <div className='producer-card-image'>
                            <img 
                                src={store.thumbnailUrl || '/default-store.jpg'} 
                                alt={store.storeName}
                            />
                        </div>
                        <div className='producer-card-content'>
                            <div className='producer-card-header'>
                                <h3 className='producer-name'>{store.storeName}</h3>
                                {store.regionSi && (
                                    <span className='producer-location'>
                                        📍 {store.regionSi} {store.regionGun}
                                    </span>
                                )}
                            </div>
                            <p className='producer-description'>
                                {store.description || '신선한 농산물을 제공합니다.'}
                            </p>
                            {store.phone && (
                                <div className='producer-contact'>
                                    <span className='contact-icon'>📞</span>
                                    <span className='contact-text'>{store.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))
                )}
            </div>

            {totalPages > 0 && (
                <div className='pagination'>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button 
                            key={page} 
                            className={currentPage === page ? "active" : ""}
                            onClick={() => {setCurrentPage(page)

                            // 페이징 처리 시 스크롤
                            window.scrollTo({
                                top:0,
                                left:0,
                                behavior:"smooth",
                            })
                        }}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProducerListPage;