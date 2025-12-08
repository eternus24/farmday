// src/pages/home/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PriceTicker from "../../components/price/PriceTicker";
import HomePriceSpikeSection from "../../components/price/HomePriceSpikeSection";
import axios from "axios";
import ShopProductCard from "../../components/shop/ShopProductCard";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Index() {
  useEffect(() => {
    document.title = "FarmDay - 산지직송 농산물";
  }, []);

  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // 👉 메인 캐러셀용 배너 (지금은 안 쓰고 있긴 함)
  const [heroBanners, setHeroBanners] = useState([]);

  // ✅ 카테고리 상태
  const [category, setCategory] = useState("ALL"); // ALL, VEGETABLE, FRUIT, BREAD, MEAT

  // ✅ 페이지 상태
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 4; // 한 줄에 4개

  // ✅ 상품 리스트 상태
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function fetchHeroBanners() {
      try {
        const res = await axios.get(`${API_BASE}/api/banners/active`);
        setHeroBanners(res.data || []);
      } catch (err) {
        console.error("메인 배너 조회 실패", err);
      }
    }
    fetchHeroBanners();
  }, []);

  // ✅ 메인 화면용 상품 목록 불러오기 (여러 개 가져와야 페이징이 의미 있음)
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${API_BASE}/api/products`, {
          params: {
            page: 0,
            size: 40, // 최대 10페이지(4개×10)까지 보여줄 수 있게 넉넉히
          },
        });
        setProducts(res.data || []);
      } catch (err) {
        console.error("메인 상품 목록 조회 실패", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  // ✅ 카테고리 필터링
  const filteredProducts = products.filter((p) => {
    switch (category) {
      case "VEGETABLE":
        // TODO: 실제 카테고리 조건으로 변경
        return p.baseCategoryId === 1;
      case "FRUIT":
        return p.baseCategoryId === 2;
      case "BREAD":
        return p.baseCategoryId === 3;
      case "MEAT":
        return p.baseCategoryId === 4;
      case "ALL":
      default:
        return true;
    }
  });

  // ✅ 페이지네이션 계산 (한 페이지 = 4개)
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  const currentProducts = filteredProducts.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  // 🔹 이전/다음 페이지 (순환형)
  const goPrevPage = () => {
    if (totalPages <= 1) return;
    setPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const goNextPage = () => {
    if (totalPages <= 1) return;
    setPage((prev) => (prev + 1) % totalPages);
  };

  // 🔹 자동 슬라이드 (8초마다 다음 페이지)
  useEffect(() => {
    if (totalPages <= 1) return; // 한 페이지뿐이면 자동 넘김 안 함

    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 8000);

    return () => clearInterval(timer);
  }, [totalPages, category]); // 카테고리 바뀌면 다시 0페이지부터

  return (
    <>
      {/* Hero Start */}
      <div
        onClick={() => navigate("/shop")}
        style={{ cursor: "pointer" }}
      >
        <img src="img/banner-2.jpg" className="img-fluid" alt="" />
      </div>
      {/* Hero End */}

      <HomePriceSpikeSection />

      {/* ✅ 메인 상단 시세 티커 */}
      <PriceTicker />

      {/* ✅ 메인 상품 섹션: 카테고리 + 1줄 4개 + 화살표 슬라이드 */}
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">오늘의 추천 상품</h2>

          {/* 카테고리 필터 */}
          <div className="btn-group" role="group" aria-label="category filter">
            <button
              type="button"
              className={`btn btn-sm rounded-pill mx-1 ${
                category === "ALL"
                  ? "btn-secondary text-white"
                  : "btn-outline-secondary"
              }`}
              onClick={() => {
                setCategory("ALL");
                setPage(0);
              }}
            >
              전체
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill mx-1 ${
                category === "VEGETABLE"
                  ? "btn-secondary text-white"
                  : "btn-outline-secondary"
              }`}
              onClick={() => {
                setCategory("VEGETABLE");
                setPage(0);
              }}
            >
              채소
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill mx-1 ${
                category === "FRUIT"
                  ? "btn-secondary text-white"
                  : "btn-outline-secondary"
              }`}
              onClick={() => {
                setCategory("FRUIT");
                setPage(0);
              }}
            >
              과일
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill mx-1 ${
                category === "BREAD"
                  ? "btn-secondary text-white"
                  : "btn-outline-secondary"
              }`}
              onClick={() => {
                setCategory("BREAD");
                setPage(0);
              }}
            >
              빵/곡류
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill mx-1 ${
                category === "MEAT"
                  ? "btn-secondary text-white"
                  : "btn-outline-secondary"
              }`}
              onClick={() => {
                setCategory("MEAT");
                setPage(0);
              }}
            >
              육류
            </button>
          </div>
        </div>

        {/* 상품 카드 한 줄 4개 */}
        {loadingProducts ? (
          <p>상품을 불러오는 중입니다...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-muted">해당 카테고리에 상품이 없습니다.</p>
        ) : (
          <>
            <div className="row g-4">
              {currentProducts.map((product) => (
                <div
                  className="col-md-6 col-lg-3 col-xl-3"
                  key={product.productId}
                >
                  <ShopProductCard product={product} />
                </div>
              ))}
            </div>

            {/* 좌우 화살표만 있는 컨트롤 (페이지 수 표시는 제거) */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={goPrevPage}
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="pagination-btn"
                  onClick={goNextPage}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer 등 나머지 섹션 */}
      {/* Footer */}
    </>
  );
}