// src/pages/home/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import PriceTicker from "../../components/price/PriceTicker";
import HomePriceSpikeSection from "../../components/price/HomePriceSpikeSection";
import ShopProductCard from "../../components/shop/ShopProductCard";
import { getGroupDealList } from "../../api/groupDealApi";
import { shouldShowMainPopup } from "../popup/popup";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Index() {
    useEffect(() => {
    document.title = "Fruitables - Vegetable Website Template";
    if (shouldShowMainPopup()) {
      const popupUrl = `${window.location.origin}/main-popup`;
      window.open(
        popupUrl,
        "mainNotice",
        "width=450,height=480,left=200,top=100,menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=yes"
      );
    }
  }, []);

  useEffect(() => {
    document.title = "FarmDay - 산지직송 농산물";
  }, []);

  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // 👉 메인/하단용 배너
  const [heroBanners, setHeroBanners] = useState([]);

  // ✅ 공지사항 상태 (리스트)
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  // ✅ 공지 상세 모달 상태
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeModalLoading, setNoticeModalLoading] = useState(false);
  const [noticeModalError, setNoticeModalError] = useState(null);

  // ✅ 추천 상품 상태
  const [category, setCategory] = useState("ALL"); // ALL, VEGETABLE, FRUIT, BREAD, MEAT
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 4;
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ✅ 공동구매 상태
  const [groupDeals, setGroupDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [dealPage, setDealPage] = useState(0);
  const DEAL_PAGE_SIZE = 4;

  // ✅ 하단 배너 페이징 상태
  const [bannerPage, setBannerPage] = useState(0);
  const BANNER_PAGE_SIZE = 4;

  // 🔹 배너 조회 (상단/하단에서 같이 사용)
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

  // 🔹 공지사항 리스트 조회
  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await axios.get(`${API_BASE}/api/help/notices`, {
          params: { page: 0, size: 5 },
        });
        setNotices(res.data || []);
      } catch (err) {
        console.error("공지사항 조회 실패", err);
      } finally {
        setLoadingNotices(false);
      }
    }
    fetchNotices();
  }, []);

  // 🔹 추천 상품 조회
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${API_BASE}/api/products`, {
          params: {
            page: 0,
            size: 40, // 넉넉하게 가져와서 슬라이드
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

  // 🔹 공동구매 조회 (list 페이지에서 쓰는 API 그대로 사용)
  useEffect(() => {
    async function fetchGroupDeals() {
      try {
        const list = await getGroupDealList("OPEN");
        setGroupDeals(list || []);
      } catch (err) {
        console.error("홈 공동구매 목록 조회 실패", err);
      } finally {
        setLoadingDeals(false);
      }
    }
    fetchGroupDeals();
  }, []);

  // ✅ 추천 상품 카테고리 필터링
  const filteredProducts = products.filter((p) => {
    switch (category) {
      case "VEGETABLE":
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

  // ✅ 추천 상품 페이지네이션
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  const currentProducts = filteredProducts.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  // ✅ 공동구매 페이지네이션
  const dealTotalPages =
    Math.ceil(groupDeals.length / DEAL_PAGE_SIZE) || 1;
  const currentDeals = groupDeals.slice(
    dealPage * DEAL_PAGE_SIZE,
    (dealPage + 1) * DEAL_PAGE_SIZE
  );

  // ✅ 배너 페이지네이션 (하단 전용)
  const bannerTotalPages =
    Math.ceil(heroBanners.length / BANNER_PAGE_SIZE) || 1;
  const currentBanners = heroBanners.slice(
    bannerPage * BANNER_PAGE_SIZE,
    (bannerPage + 1) * BANNER_PAGE_SIZE
  );

  // 🔹 추천 상품 이전/다음
  const goPrevPage = () => {
    if (totalPages <= 1) return;
    setPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const goNextPage = () => {
    if (totalPages <= 1) return;
    setPage((prev) => (prev + 1) % totalPages);
  };

  // 🔹 공동구매 이전/다음
  const goPrevDealPage = () => {
    if (dealTotalPages <= 1) return;
    setDealPage((prev) =>
      prev === 0 ? dealTotalPages - 1 : prev - 1
    );
  };

  const goNextDealPage = () => {
    if (dealTotalPages <= 1) return;
    setDealPage((prev) => (prev + 1) % dealTotalPages);
  };

  // 🔹 추천상품 자동 슬라이드 (8초)
  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 8000);
    return () => clearInterval(timer);
  }, [totalPages, category]);

  // 🔹 공동구매 자동 슬라이드 (8초)
  useEffect(() => {
    if (dealTotalPages <= 1) return;
    const timer = setInterval(() => {
      setDealPage((prev) => (prev + 1) % dealTotalPages);
    }, 8000);
    return () => clearInterval(timer);
  }, [dealTotalPages]);

  // 🔹 배너 자동 슬라이드 (8초)
  useEffect(() => {
    if (bannerTotalPages <= 1) return;
    const timer = setInterval(() => {
      setBannerPage((prev) => (prev + 1) % bannerTotalPages);
    }, 8000);
    return () => clearInterval(timer);
  }, [bannerTotalPages]);

  // ===========================
  // 🔥 공지 상세 모달 제어
  // ===========================
  const openNoticeModal = async (basicNotice) => {
    const nid = basicNotice.noticeId || basicNotice.id;
    if (!nid) return;

    // 제목/날짜는 먼저 채워두기
    setSelectedNotice({
      noticeId: nid,
      title: basicNotice.title,
      createdDate: basicNotice.createdDate || basicNotice.regDate,
      content: "",
      images: [],
    });
    setNoticeModalError(null);
    setNoticeModalLoading(true);
    setNoticeModalOpen(true);

    try {
      const res = await axios.get(`${API_BASE}/api/help/notices/${nid}`);
      // 상세 + 이미지까지 세팅
      setSelectedNotice(res.data);
    } catch (err) {
      console.error("공지 상세 조회 실패", err);
      setNoticeModalError("공지 내용을 불러오지 못했습니다.");
    } finally {
      setNoticeModalLoading(false);
    }
  };

  const closeNoticeModal = () => {
    setNoticeModalOpen(false);
    setSelectedNotice(null);
    setNoticeModalError(null);
    setNoticeModalLoading(false);
  };

  return (
    <>
      {/* Hero Start - 클릭 시 쇼핑으로 */}
      <div
        onClick={() => navigate("/shop")}
        style={{ cursor: "pointer" }}
      >
        <img src="img/banner-2.jpg" className="img-fluid" alt="" />
      </div>
      {/* Hero End */}

      {/* 🔥 공지 + 시세 요약 카드 섹션 (공지 클릭 → 모달) */}
      <HomePriceSpikeSection
        notices={notices}
        loadingNotices={loadingNotices}
        onNoticeClick={openNoticeModal}
      />

      {/* ✅ 메인 상단 시세 티커 */}
      <div className="container py-4">
        <h3 className="mb-3">오늘의 시세정보</h3>
      </div>
      <PriceTicker />

      {/* ✅ 메인 상품 섹션: 카테고리 + 1줄 4개 + 화살표 슬라이드 */}
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">오늘의 추천 상품</h2>

          {/* 카테고리 필터 */}
          <div
            className="btn-group"
            role="group"
            aria-label="category filter"
          >
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
          <p className="text-muted">
            해당 카테고리에 상품이 없습니다.
          </p>
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

      {/* ✅ 공동구매 섹션 (1줄 4개 + 슬라이드) */}
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">산지직송 공동구매</h2>
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => navigate("/groupdeal")}
          >
            더보기 &gt;
          </button>
        </div>

        {loadingDeals ? (
          <p>공동구매 정보를 불러오는 중입니다...</p>
        ) : groupDeals.length === 0 ? (
          <p className="text-muted">진행 중인 공동구매가 없습니다.</p>
        ) : (
          <>
            <div className="row g-4">
              {currentDeals.map((deal) => (
                <div
                  className="col-md-6 col-lg-3 col-xl-3"
                  key={deal.groupDealId}
                >
                  <div
                    className="card h-100 border-0"
                    style={{
                      borderRadius: "18px",
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
                      transition:
                        "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onClick={() =>
                      navigate(`/groupdeal/${deal.groupDealId}`)
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow =
                        "0 16px 42px rgba(15,23,42,0.18)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 28px rgba(15,23,42,0.08)";
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "75%",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      {deal.thumbnailImageUrl && (
                        <img
                          src={deal.thumbnailImageUrl}
                          alt={deal.title}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>

                    <div className="card-body">
                      <h6 className="card-title text-truncate mb-1">
                        {deal.title}
                      </h6>
                      {deal.subTitle && (
                        <p className="text-muted small text-truncate mb-2">
                          {deal.subTitle}
                        </p>
                      )}

                      <div className="d-flex align-items-baseline gap-2 mb-1">
                        {deal.discountRate != null && (
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "#b91c1c",
                            }}
                          >
                            {Math.round(deal.discountRate)}%
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 800,
                            color: "#166534",
                          }}
                        >
                          {new Intl.NumberFormat("ko-KR").format(
                            deal.dealPrice
                          )}
                          원
                        </span>
                        {deal.originPrice != null && (
                          <span
                            className="text-muted small"
                            style={{ textDecoration: "line-through" }}
                          >
                            {new Intl.NumberFormat("ko-KR").format(
                              deal.originPrice
                            )}
                            원
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {dealTotalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={goPrevDealPage}
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="pagination-btn"
                  onClick={goNextDealPage}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ 하단 배너 섹션 – 티커처럼 왼쪽으로 흘러가기 */}
      <div className="container py-5">
        <h4 className="mb-3">FarmDay</h4>

        {(() => {
          const data = heroBanners && heroBanners.length > 0
            ? heroBanners
            : [
                {
                  id: 1,
                  title: "산지 직송 제철 과일 할인전",
                  subtitle: "오늘 주문하면 내일 도착!",
                  imageUrl: "/img/banner-1.jpg",
                  linkUrl: "/shop",
                },
                {
                  id: 2,
                  title: "신선한 채소 모음전",
                  subtitle: "샐러드 재료 한 번에 준비",
                  imageUrl: "/img/banner-2.jpg",
                  linkUrl: "/shop",
                },
                {
                  id: 3,
                  title: "한우 공동구매 오픈",
                  subtitle: "공동구매로 더 저렴하게",
                  imageUrl: "/img/banner-3.jpg",
                  linkUrl: "/groupdeal",
                },
              ];

          if (!data || data.length === 0) {
            return <p className="text-muted">표시할 배너가 없습니다.</p>;
          }

          const loopData = [...data, ...data];

          return (
            <div className="banner-ticker-wrapper">
              <div className="banner-ticker-track">
                {loopData.map((banner, idx) => (
                  <div
                    key={`${banner.id || banner.bannerId || "b"}-${idx}`}
                    className="banner-ticker-item"
                    onClick={() => {
                      if (!banner.linkUrl) return;
                      if (
                        banner.linkUrl.startsWith("http://") ||
                        banner.linkUrl.startsWith("https://")
                      ) {
                        window.location.href = banner.linkUrl;
                      } else {
                        navigate(banner.linkUrl);
                      }
                    }}
                  >
                    {banner.imageUrl && (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                      />
                    )}
                    <div className="banner-overlay">
                      <div className="banner-overlay-title">
                        {banner.title}
                      </div>
                      {banner.subtitle && (
                        <div className="banner-overlay-subtitle">
                          {banner.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 🔥 공지 상세 모달 */}
      {noticeModalOpen && (
        <>
          {/* 어두운 배경 */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              zIndex: 1990,
            }}
            onClick={closeNoticeModal}
          />

          {/* 가운데 카드 래퍼 */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px",
            }}
          >
            {/* 🧊 모달 카드 (여기가 기준) */}
            <div
              style={{
                position: "relative",          // ✅ X 버튼 absolute 기준
                maxWidth: 640,
                width: "100%",
                maxHeight: "90vh",
                backgroundColor: "#fff",
                borderRadius: 12,
                boxShadow: "0 20px 40px rgba(15,23,42,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ✅ 항상 모달 우측 상단에 붙어 있는 X 버튼 */}
              <button
                type="button"
                onClick={closeNoticeModal}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 20,
                  width: 32,
                  height: 32,
                  borderRadius: "999px",
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: 18,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

              {/* ✅ 내용만 스크롤되는 영역 */}
              <div
                style={{
                  padding: "16px 20px 18px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                {/* 제목 + 날짜 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginBottom: 10,
                  }}
                >
                  <h5
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {selectedNotice?.title || "공지사항"}
                  </h5>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    {selectedNotice?.createdDate
                      ? String(selectedNotice.createdDate).slice(0, 10)
                      : ""}
                  </div>
                </div>

                {noticeModalLoading ? (
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    공지 내용을 불러오는 중입니다...
                  </div>
                ) : noticeModalError ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#b91c1c",
                    }}
                  >
                    {noticeModalError}
                  </div>
                ) : (
                  <>
                    {/* 내용 */}
                    <div
                      style={{
                        fontSize: 14,
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                        marginBottom: 16,
                      }}
                    >
                      {selectedNotice?.content}
                    </div>

                    {/* 이미지 리스트 (있으면) */}
                    {selectedNotice?.images &&
                      selectedNotice.images.length > 0 && (
                        <div
                          style={{
                            borderTop: "1px solid #e5e7eb",
                            paddingTop: 10,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {selectedNotice.images.map((img) => (
                            <img
                              key={img.imageId}
                              src={img.imageUrl}
                              alt=""
                              style={{
                                width: "100%",
                                borderRadius: 8,
                                objectFit: "cover",
                              }}
                            />
                          ))}
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}