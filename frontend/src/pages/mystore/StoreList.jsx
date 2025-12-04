import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducerProducts } from '../../assets/js/api/ShopApi';
import '../../assets/css/storeList.css';

const StoreList = () => {
    const { producerId } = useParams();
    const [products, setProducts] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const navigate = useNavigate();

    const totalPages = Math.ceil(products.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const pagedProducts = products.slice(start, start + pageSize);

    const changePage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        setTimeout(() => {
            const anchor = document.querySelector('#productlist-anchor');
            if (anchor) {
                const rect = anchor.getBoundingClientRect().top;
                const absoluteY = window.scrollY + rect - 210;
                window.scrollTo({ top: absoluteY, behavior: 'smooth' });
            }
        }, 10);
    };

    useEffect(() => {
        getProducerProducts(producerId)
            .then(res => setProducts(res))
            .catch(err => console.error("상품 조회 실패:", err));
    }, [producerId]);

    const formatPrice = (price) => {
        if (price == null) return "-";
        return price.toLocaleString("ko-KR") + "원";
    };

    return (
        <div className="productlist-container">
            <div id="productlist-anchor"></div>

            {/* 헤더 */}
            <div className="productlist-header">
                <h3>전체 상품</h3>
                <span className="productlist-count">총 {products.length}개 상품</span>
            </div>

            {products.length === 0 ? (
                <p className="productlist-empty">등록된 상품이 없습니다.</p>
            ) : (
                <>
                    <div className="productlist-grid">
                        {pagedProducts.map((p) => (
                            <div
                                key={p.productId}
                                className="productlist-card"
                                onClick={() => navigate(`/shop/detail/${p.productId}`)}
                            >
                                <div className="productlist-thumb">
                                    <img src={p.mainImage} alt={p.name} />
                                </div>

                                <div className="productlist-info">
                                    <p className="productlist-name">{p.name}</p>

                                    <p className="productlist-price">
                                        <span className="productlist-sale">
                                            {formatPrice(p.price)}
                                        </span>
                                    </p>

                                    <div className="productlist-meta">
                                        <span className="productlist-badge">무료배송</span>
                                        <span className="productlist-date">
                                            {p.createdDate?.slice(0, 10)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 페이지네이션 */}
                    <nav>
                        <ul className="productlist-pagination">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button onClick={() => changePage(currentPage - 1)}>&laquo;</button>
                            </li>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                return (
                                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                                        <button onClick={() => changePage(page)}>{page}</button>
                                    </li>
                                );
                            })}

                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button onClick={() => changePage(currentPage + 1)}>&raquo;</button>
                            </li>
                        </ul>
                    </nav>
                </>
            )}
        </div>
    );
};

export default StoreList;