import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProducerProducts } from '../../assets/js/api/ShopApi';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/storeDetail.css';

const StoreList = () => {//상품 리스트

    const {producerId} = useParams()
    const [products,setProducts] = useState([])

    const [currentPage,setCurrentPage] = useState(1)
    const pageSize = 8;//페이징 처리

    const totalPages = Math.ceil(products.length / pageSize)

    const start = (currentPage -1) * pageSize
    const end = start + pageSize
    const pagedProducts = products.slice(start,end)

    const navigate = useNavigate()

    //페이지 변경 함수
    const changePage = (page) => {
        if(page <1 || page> totalPages) return

        setCurrentPage(page)

        //스크롤 이동(상품 리스트 시작)
        setTimeout(()=>{
            const anchor = document.querySelector('#sort-anchor')
            if(anchor) {
                const rect = anchor.getBoundingClientRect().top
                const absoluteY = window.scrollY + rect;
                const offsetY = absoluteY - 210;//헤더 높이 보정

                window.scrollTo({
                    top:offsetY,
                    behavior:'smooth'
                })
            }
        },10)
    }

    useEffect(() => {
        getProducerProducts(producerId)
        .then(res=>setProducts(res))
        .catch(err => console.error("상품 조회 실패:",err))
    },[producerId])

    const formatPrice = (price) => {
        if(price == null) return "-";
        return price.toLocaleString("ko-KR") + "원";
    }

    return (
        <div className='store-product-list'>
            <div id="sort-anchor"></div>

            <div className='store-list-header'>
                <h3>전체 상품</h3>
                <span className='store-list-count'>총 {products.length}개 상품</span>
            </div>

            {products.length === 0? (
                <p className='store-product-empty'>등록된 상품이 없습니다.</p>
            ):(
                <>
                <div className='store-product-grid'>
                    {pagedProducts.map((p)=> (
                        <div key={p.productId} className='store-product-card' onClick={() => navigate(`/shop/detail/${p.productId}`)} style={{ cursor: "pointer" }}>
                            <div className='store-product-thumb'>
                                <img src={p.mainImage} alt={p.name}/>
                            </div>

                            <div className='store-product-info'>
                                <p className='store-product-name'>{p.name}</p>
                                <p className='store-product-price'>
                                    <span className='store-product-sale'>
                                        {formatPrice(p.price)}
                                    </span>
                                </p>
                            <div className='store-product-meta'>
                                <span className='store-product-badge'>무료배송</span>
                                <span className='store-product-date'>
                                    {p.createdDate?.slice(0,10)}
                               </span>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>

            <nav>
            <ul className="pagination justify-content-center mt-5 gap-2">

                {/* 이전 버튼 */}
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => changePage(currentPage - 1)}>
                        &laquo;
                    </button>
                </li>

                {/* 페이지 번호 */}
                {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                        <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                            <button className="page-link" onClick={() => changePage(page)}>
                                {page}
                            </button>
                        </li>
                    );
                })}

                {/* 다음 버튼 */}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => changePage(currentPage + 1)}>
                                    &raquo;
                                </button>
                            </li>
                        </ul>
                    </nav>
                </>
            )}
        </div>
    );
};
export default StoreList;