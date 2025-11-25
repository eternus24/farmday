// src/pages/groupdeal/GroupDealDetailPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupDealTimer from "../../components/groupdeal/GroupDealTimer";
import GroupDealDetailTabs from "../../layouts/GroupDealDetailTabs";
import {
  getGroupDealDetail,
} from "../../api/groupDealApi";

const PRIMARY_DEEP_GREEN = "#166534";
const ACCENT_ORANGE = "#E65100";

function GroupDealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const priceSectionRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isImageHover, setIsImageHover] = useState(false);

  // DTO -> 화면용 데이터로 변환
  function mapDetailDtoToView(detail) {
    if (!detail) return null;
    
    const originPrice =
      detail.originPrice != null ? Number(detail.originPrice) : 0;
    const dealPrice = detail.dealPrice != null ? Number(detail.dealPrice) : 0;
    const discountRate =
      detail.discountRate != null ? Number(detail.discountRate) : 0;

    const legacyMainImage =
      detail.mainImagePath || detail.imagePath || detail.imageUrl || null;

    const imageUrls =
      detail.imageUrls && detail.imageUrls.length > 0
        ? detail.imageUrls
        : legacyMainImage
        ? [legacyMainImage]
        : [];

    return {
      ...detail,
      originPrice,
      dealPrice,
      discountRate,
      mainImagePath: imageUrls.length > 0 ? imageUrls[0] : null,
      imagePaths: imageUrls,
      deliveryInfo: detail.deliveryText,
      maxMemberCount:
        detail.maxMemberCount != null
          ? detail.maxMemberCount
          : detail.minMemberCount,
      endAt:
        typeof detail.endAt === "string"
          ? detail.endAt
          : detail.endAt
          ? String(detail.endAt)
          : "",
    };
  }

  // 상세 정보 + 팀 목록 조회
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [detailRes] = await Promise.all([
          getGroupDealDetail(id),
        ]);

        const mapped = mapDetailDtoToView(detailRes);
        setDeal(mapped);
      } catch (e) {
        console.error(e);
        setError(e.message || "공동구매 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  // 스크롤 시 하단 고정 바 노출 여부
  useEffect(() => {
    const handleScroll = () => {
      if (!priceSectionRef.current) return;
      const rect = priceSectionRef.current.getBoundingClientRect();
      const headerOffset = 80;
      setShowStickyBar(rect.top <= headerOffset);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // 🔥 혼자 구매: 이미 들고 있는 deal(= GroupDealDetailDto 매핑 결과)을 주문 페이지로 넘김
  const handleSoloBuy = () => {
    if (!deal) return;

    // 여기서 새로운 DTO, 새로운 API 전혀 필요 없음
    // order 페이지에서 useLocation().state 로 deal을 받으면 됨
    navigate("/order", { state: { groupDeal: deal } });
  };

  if (loading) {
    return (
      <div className="container my-4">
        <p>공동구매 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="container my-4">
        <p>{error || "공동구매 정보를 찾을 수 없습니다."}</p>
      </div>
    );
  }

  const mainImage =
    deal.mainImagePath ||
    (deal.imagePaths && deal.imagePaths.length > 0
      ? deal.imagePaths[0]
      : null);

  const soloPrice = deal.originPrice;
  const groupPrice = deal.dealPrice;
  const saveAmount =
    typeof soloPrice === "number" &&
    typeof groupPrice === "number" &&
    soloPrice > groupPrice
      ? soloPrice - groupPrice
      : 0;
  const savePercent =
    saveAmount > 0
      ? Math.round((saveAmount / soloPrice) * 100)
      : deal.discountRate;

  const safeCurrent = Number(deal.currentMemberCount) || 0;
  const safeMax = Number(deal.maxMemberCount) || 0;

  const progressPercent = safeMax > 0 ? (safeCurrent / safeMax) * 100 : 0;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("페이지 주소가 복사되었습니다!");
    } catch (e) {
      alert("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
    }
  };

  return (
    <div className="container my-3">
      {/* 상단: 뒤로가기 + 찜/공유 */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <button
          type="button"
          className="btn btn-link p-0 me-2"
          onClick={() => window.history.back()}
        >
          ← 뒤로가기
        </button>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm rounded-pill px-3"
            style={{
              backgroundColor: isLiked ? "rgba(22,101,52,0.08)" : "#ffffff",
              borderColor: isLiked ? PRIMARY_DEEP_GREEN : "#e5e7eb",
              color: isLiked ? PRIMARY_DEEP_GREEN : "#6b7280",
              fontWeight: 600,
            }}
            onClick={() => setIsLiked((prev) => !prev)}
          >
            {isLiked ? "♥ 찜" : "♡ 찜"}
          </button>

          <button
            type="button"
            className="btn btn-sm rounded-pill px-3"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              color: "#4b5563",
              fontWeight: 600,
            }}
            onClick={handleShare}
          >
            공유
          </button>
        </div>
      </div>

      <div className="row">
        {/* 왼쪽 이미지 영역 */}
        <div className="col-md-6 mb-3">
          <div
            className="overflow-hidden"
            style={{
              borderRadius: "18px",
              backgroundColor: "#f3f4f6",
              boxShadow: isImageHover
                ? "0 24px 40px rgba(15,23,42,0.25)"
                : "0 16px 30px rgba(15,23,42,0.15)",
              transform: isImageHover
                ? "translateY(-6px) scale(1.02)"
                : "translateY(0)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={() => setIsImageHover(true)}
            onMouseLeave={() => setIsImageHover(false)}
          >
            <div className="ratio ratio-4x3">
              {mainImage && (
                <img
                  src={mainImage}
                  alt={deal.productName}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 정보 영역 */}
        <div className="col-md-6 mb-3">
          <div className="small text-muted mb-1">{deal.region}</div>
          <h3 className="mb-1 fw-bold">{deal.productName}</h3>

          <div className="small text-muted mb-2">
            ⭐ {deal.rating} ({deal.reviewCount}) · {deal.soldCount}개 판매
          </div>

          <div className="mb-2">
            <GroupDealTimer endAt={deal.endAt} />
          </div>
          <div
            className="progress mb-1"
            style={{
              height: "8px",
              backgroundColor: "#f1f1f1",
              borderRadius: "10px",
            }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${progressPercent}%`,
                background:
                  "linear-gradient(90deg, #166534 0%, #15803d 50%, #4ade80 100%)",
                borderRadius: "10px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div className="d-flex justify-content-between small text-muted mb-3">
            <span>
              {safeCurrent}/{safeMax}명 참여중
            </span>
            <span>
              마감:{" "}
              {deal.endAt && deal.endAt.includes("T")
                ? deal.endAt.split("T")[0]
                : deal.endAt}
            </span>
          </div>

          <div className="mb-1 d-flex align-items-baseline">
            <span
              className="fw-bold"
              style={{
                color: ACCENT_ORANGE,
                fontSize: "1.8rem",
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              {savePercent}%
            </span>
            <span
              className="fw-bold ms-2"
              style={{ fontSize: "1.6rem", letterSpacing: "-0.03em" }}
            >
              {groupPrice.toLocaleString()}
              <span className="small ms-1">원</span>
            </span>
            <span className="text-muted text-decoration-line-through small ms-2">
              {soloPrice.toLocaleString()}원
            </span>
          </div>
          {saveAmount > 0 && (
            <div className="small text-muted mb-3">
              함께 구매 시 {saveAmount.toLocaleString()}원 절약
            </div>
          )}

          <div
            className="mb-3"
            style={{ borderTop: "1px solid #e5e7eb" }}
          ></div>

          <div className="mb-3 small">
            이 상품은{" "}
            <span className="fw-bold" style={{ color: "#E65100" }}>
              내일 도착, 무료배송
            </span>
            <span className="text-muted ms-2">
              {deal.deliveryInfo || ""}
            </span>
          </div>

          <div className="mb-2">
            <div className="fw-semibold">공동구매 인원</div>
            <div className="small text-muted">
              최소 {deal.minMemberCount}명 / 최대 {deal.maxMemberCount}명
            </div>
          </div>

          {/* 혼자 구매 / 함께 구매 버튼 */}
          <div className="mt-3 d-flex gap-2">
            <button
              className="btn flex-fill fw-semibold"
              style={{
                borderColor: PRIMARY_DEEP_GREEN,
                color: PRIMARY_DEEP_GREEN,
                backgroundColor: "#ffffff",
              }}
              onClick={handleSoloBuy}
            >
              혼자 구매
            </button>

          </div>
        </div>
      </div>

      {/* 아래 탭 섹션 시작 위치 */}
      <div ref={priceSectionRef} className="mt-4">
        <GroupDealDetailTabs deal={deal} />
      </div>

      {/* 하단 고정 바 */}
      {showStickyBar && (
        <div
          className="position-fixed bottom-0 start-0 end-0 bg-white border-top py-2"
          style={{ zIndex: 1000, boxShadow: "0 -2px 8px rgba(0,0,0,0.06)" }}
        >
          <div className="container d-flex flex-column flex-md-row align-items-md-center gap-3 justify-content-between">
            <div className="small">
              <div className="mb-1">
                <GroupDealTimer endAt={deal.endAt} />
              </div>
              <div className="d-flex align-items-baseline">
                <span
                  className="fw-bold"
                  style={{
                    color: ACCENT_ORANGE,
                    fontSize: "1rem",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {savePercent}%
                </span>
                <span
                  className="fw-bold ms-2"
                  style={{ fontSize: "1.2rem", letterSpacing: "-0.03em" }}
                >
                  {groupPrice.toLocaleString()}원
                </span>
                <span className="text-muted text-decoration-line-through small ms-2">
                  {soloPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex-grow-1 d-none d-md-block">
              <div
                className="progress"
                style={{
                  height: "8px",
                  backgroundColor: "#f1f1f1",
                  borderRadius: "10px",
                }}
              >
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${progressPercent}%`,
                    background:
                      "linear-gradient(90deg, #166534 0%, #15803d 50%, #4ade80 100%)",
                    borderRadius: "10px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div className="d-flex justify-content-between small text-muted mt-1">
                <span>
                  {deal.currentMemberCount}/{deal.maxMemberCount}명 참여중
                </span>
                <span>
                  마감:{" "}
                  {deal.endAt && deal.endAt.includes("T")
                    ? deal.endAt.split("T")[0]
                    : deal.endAt}
                </span>
              </div>
            </div>

            {/* 하단 버튼: 혼자 구매 / 함께 구매 */}
            <div className="d-flex gap-2">
              <button
                className="btn fw-semibold"
                style={{
                  borderColor: PRIMARY_DEEP_GREEN,
                  color: PRIMARY_DEEP_GREEN,
                  backgroundColor: "#ffffff",
                }}
                onClick={handleSoloBuy}
              >
                혼자 구매
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDealDetailPage;
