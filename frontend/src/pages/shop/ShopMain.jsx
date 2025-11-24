import React, { useEffect,useState } from 'react';

import ShopFilter from '../../components/shop/ShopFilter';//목록 필터(카테고리/가격..)
import ShopCategory from '../../components/shop/ShopCategory';//대중소 카테고리 목록
import ShopProductList from '../../components/shop/ShopProductList'
import { getProductList } from "../../assets/js/api/ShopApi.js";

const ShopMain = () => {//페이지 역할

  const [filters, setFilters] = useState({
    keyword:"",
    categories: [],
    price: 0
  });

  const [sortOption, setSortOption] = useState('추천순')
  const [currentPage,setCurrentPage] = useState(1)
  const [products,setProducts] = useState([])//db 상품 리스트 저장

  //상품 목록 함수
  const loadProducts = async () => {
  try {
    const params = {
      keyword: filters.keyword,
      categories: filters.categories,
      price: filters.price ?? 0,
      sort:
        sortOption === "낮은 가격순"
          ? "lowPrice"
          : sortOption === "높은 가격순"
          ? "highPrice"
          : sortOption === "신상품순"
          ? "new"
          : "default"
    };

      const data = await getProductList(params); //data 정의 필수

      console.log("🔍 받아온 데이터:", data);
      console.log("배열인가?", Array.isArray(data));

      //프론트에서 사용하는 camelCase 구조로 저장!
      setProducts(data);
      setCurrentPage(1);

    } catch (err) {
      console.error("상품 목록 로딩 오류:", err);
    }
  };

  //필터 정렬
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  },[filters,sortOption]);

  //카테고리별 갯수 - db도 함께 적용 필요!
  const categoryCount = {
    "과일/견과": 12,
    "채소/버섯": 18,
    "곡물/콩류": 24,
    "수산물/해산물": 9,
    "축산물/육류": 7
  }

  return (
    <div className='container-fluid fruite py-5'>
        <div className="text-center mb-4">
          <h1 className="shop-title">🛒 제철 과일 상품</h1>
        </div>

      <div className='container py-5'>
        <div className='row g-4'>

          {/* left filter */}
        <div className='col-lg-3'>
          <div className='filter-container-wrap'>
              <ShopFilter filters={filters} setFilters={setFilters} categoryCount={categoryCount} setCurrentPage={setCurrentPage} setSortOption={setSortOption}/>
              <ShopCategory/>
          </div>
        </div>

          {/* right filter */}
          <div className="col-lg-9">

          <div id="sort-anchor"></div>
          <div className="sort-tabs">
            {["추천순", "신상품순","낮은 가격순", "높은 가격순"].map((tab) => (
              <span key={tab} className={`sort-item ${sortOption === tab ? "active" : ""}`}
                onClick={() => {setSortOption(tab); setCurrentPage(1)}}>
                {tab}
              </span>
            ))}
          </div>

          <ShopProductList products={products} filters={filters} sortOption={sortOption} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
        </div>  
      </div>
    </div>
  </div>
      
  );
};

export default ShopMain;