import React, { useState } from 'react';
import ShopProductCard from './ShopProductCard';//상품카드

const ShopProductList = ({products, filters, sortOption, currentPage, setCurrentPage}) => {

    //페이징처리
    const pageSize = 15;

    // 필터링 로직
    const filteredProducts = products.filter(item => {
        //키워드 검색 - toLowerCase(소문자) - includes(검사)
        const matchKeyword = !filters.keyword || item.name.toLowerCase().includes(filters.keyword.toLowerCase());

        //카테고리(배열)
        const matchCategory = !filters.categories?.length || filters.categories.includes(item.baseCategoryId);

        //가격
        const matchPrice = !filters.price || item.price <= filters.price;

        //세 조건 모두 true일 경우
        return matchKeyword && matchCategory && matchPrice;
    })

    let sortedProducts = [...filteredProducts];

        switch (sortOption) {
        case "신상품순":
            sortedProducts.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            break;

        case "낮은 가격순":
            sortedProducts.sort((a, b) => a.price - b.price);
            break;

        case "높은 가격순":
            sortedProducts.sort((a, b) => b.price - a.price);
            break;

        default:
            break;
        }

        const total = sortedProducts.length
        const totalPages = Math.ceil(total / pageSize)
        
        //페이징 처리
        const start = (currentPage -1) * pageSize
        const end = start + pageSize
        const pagedProducts = sortedProducts.slice(start,end)

        const changePage = (page) => {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);

        // 스크롤 이동 (상품 리스트 시작 지점 기준)
        setTimeout(() => {
            //main에서 설정한 위치로 변경
            const anchor = document.querySelector('#sort-anchor');
            if (anchor) {
                const rect = anchor.getBoundingClientRect().top;
                const absoluteY = window.scrollY + rect;
                const offsetY = absoluteY - 120; // 헤더 높이 보정

                window.scrollTo({
                    top: offsetY,
                    behavior: "smooth"
                });
            }
        }, 10);
    };

    return (
        <>
        <div className='product-list-top-anchor'></div>
            <div className='row g-4'>
                {pagedProducts.length > 0 ? (
                    pagedProducts.map((p) => {
                        console.log("list item =", p);  
                        return (
                            <div key={p.productId} className='col-md-6 col-lg-4 col-xl-4'>
                                <ShopProductCard product={p} />
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-5">
                        <h5>조건에 맞는 상품이 없습니다.</h5>
                    </div>
                )}
            </div>

            {/* 페이지 네비게이션 */}
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
    );
};

export default ShopProductList;