import React, { useState } from 'react';
import '../../assets/css/shopfilter.css';
import menu from '../../assets/icons/menu-outline.svg';
import price from '../../assets/icons/credit-card-outline.svg';

//목록 필터(카테고리/가격/재배방식/정렬)
const ShopFilter = ({filters,setFilters,setCurrentPage,setSortOption}) => {
    
    //선택한 카테고리
    const categoryList = [
        { id: 1, label: "과일/견과" },        
        { id: 2, label: "채소/버섯" },     
        { id: 3, label: "곡물/콩류" },
        { id: 4, label: "수산물/해산물" },     
        { id: 5, label: "축산물/육류" }
        ];
    
    //카테고리 체크 기능
    const toggleCategory = (categoryName) => {
        setFilters(prev=>{
            const selected = prev.categories || [];
            const updated = selected.includes(categoryName)
            ? selected.filter(item=>item !== categoryName)//이미 선택 -> 제거
            : [...selected,categoryName]//없으면 -> 추가

            return {...prev, categories: updated};
        })
        setCurrentPage(1)
    }

    const handleKeyword = (e)=>{//검색어 입력 변화
        setFilters(prev => ({...prev,keyword: e.target.value}))
        setCurrentPage(1)
    }
    const handlePrice = (e) => {
        const value = Number(e.target.value);
        setFilters(prev => ({
            ...prev,
            price: value === 0 ? null : value
        }));
        setCurrentPage(1);
        };
    const resetFilter = ()=>{//초기화 버튼
        setFilters({
            keyword:'',
            categories:[],
            price:0
        })
        setSortOption('추천순');
        setCurrentPage(1)
    }
    

    return (
        <div className='filter-container'>

        {/* 초기화 버튼 */}
        <div className='reset-box'>
            <button className='reset-btn' onClick={resetFilter}>초기화</button>
        </div>

        <div className='filter-block'>
            {/* 검색 */}
            <input type='text' placeholder='검색어 입력' onChange={(e) => {
                setFilters(prev => ({...prev, keyword:e.target.value}))
            }} className='keyword-input'/>
        </div>

            {/* 카테고리 */}
            <div className='filter-block'>
                <div className='filter-header'>
                <span>
                    <img src={menu} alt="카테고리" className="icon"/>카테고리
                </span>
                </div>
                <ul className="filter-list">
                    {categoryList.map((cat) => {
                        const isSelected = filters.categories?.includes(cat.id);//목록 확인

                        return (
                            <li key={cat.id} className={`filter-item ${isSelected ? "selected" : ""}`} onClick={() => toggleCategory(cat.id)}>
                                <input type="checkbox" checked={isSelected} onChange={() => toggleCategory(cat.id)} onClick={(e) => e.stopPropagation()}/>

                                <span>{cat.label}</span>
                            </li>
                        );
                    })}
                </ul>
        </div>

            {/* 가격 */}
            <div className='filter-block'>
                <div className='filter-header'>
                <span>
                    <img src={price} alt="가격" className="icon"/>가격
                </span>
                </div>

                    <div className='price-slider'>
                        <input type='range' min='0' max='50000' value={filters.price} onChange={handlePrice} className='price-range'/>
                    </div>

                    <div className='price-value'>
                        {(filters.price ?? 0).toLocaleString()}원
                    </div>
            </div>
        
        </div>
    );
};

export default ShopFilter;