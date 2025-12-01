// 경로: frontend/src/pages/groupdeal/GroupDealManagePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// ✅ 생산자 대시보드 + 상품 목록 API
import {
  getProducerGroupDealDashboard,
  getProductList,
} from "../../api/groupDealApi";

// 이미 만들어둔 컴포넌트들
import BarProgress from "./components/BarProgress";
import PriceInfo from "./components/PriceInfo";
import DeliveryStatusSection from "./components/DeliveryStatusSection";
import ParticipantListSection from "./components/ParticipantListSection";
import NoticeSection from "./components/NoticeSection";
import QASection from "./components/QASection";
import ReviewSection from "./components/ReviewSection";
import TitleSection from "./components/TitleSection";
import ProductSelectDropdown from "./components/ProductSelectDropdown";
import ImageUploadBox from "./components/ImageUploadBox";

// 숫자 포맷
function formatNumber(n) {
  if (n == null) return "-";
  return new Intl.NumberFormat("ko-KR").format(n);
}

// 날짜 포맷
function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("ko-KR");
}

// 아코디언 섹션
function AccordionSection({
  id,
  title,
  description,
  activeId,
  onToggle,
  children,
}) {
  const isActive = activeId === id;

  return (
    <div className="mb-3">
      <button
        type="button"
        className="w-100 d-flex justify-content-between align-items-center px-3 py-2 border-0"
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: 10,
          cursor: "pointer",
        }}
        onClick={() => onToggle(id)}
      >
        <div className="text-start">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{title}</div>
          {description && (
            <div
              className="text-muted"
              style={{ fontSize: "0.8rem", marginTop: 2 }}
            >
              {description}
            </div>
          )}
        </div>
        <div style={{ fontSize: "1.2rem" }}>{isActive ? "▴" : "▾"}</div>
      </button>

      <div
        style={{
          overflow: "hidden",
          transition: "max-height 0.25s ease",
          maxHeight: isActive ? 1000 : 0,
        }}
      >
        {isActive && (
          <div
            className="border rounded-3 px-3 py-3 mt-2"
            style={{ backgroundColor: "#ffffff" }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// 공통 모달
function CommonModal({
  open,
  title,
  placeholder,
  value,
  onChange,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1050,
        backgroundColor: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg"
        style={{ width: "100%", maxWidth: 480 }}
      >
        <div className="px-4 py-3 border-bottom d-flex justify-content-between">
          <h5 className="mb-0" style={{ fontWeight: 700 }}>
            {title}
          </h5>
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-3">
          <textarea
            className="form-control"
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        </div>
        <div className="px-4 py-3 border-top d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light" onClick={onClose}>
            취소
          </button>
          <button type="button" className="btn btn-dark" onClick={onConfirm}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

const GroupDealManagePage = () => {
  const { groupDealId } = useParams();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 상품 목록 (ProductSelectDropdown 에 내려줄 용도)
  const [products, setProducts] = useState([]);

  // 상단 아코디언
  const [activeAccordion, setActiveAccordion] = useState("status"); // 기본: 진행 현황

  // 하단 탭
  const [activeTab, setActiveTab] = useState("notice"); // notice | qa | review

  // 공통 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // notice | qa | review
 const [, setModalTargetId] = useState(null);

  const [modalText, setModalText] = useState("");

  // 공동구매 대시보드 데이터 로딩
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProducerGroupDealDashboard(groupDealId);

        if (!data) {
          setError("공동구매 정보를 찾을 수 없습니다.");
        } else {
          setDeal(data);
        }
      } catch (e) {
        console.error(e);
        setError("공동구매 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [groupDealId]);

  // 상품 목록 로딩 (드롭다운에서 사용할 리스트)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const list = await getProductList();
        // API 응답 예: [{ productId, productName, ... }]
        setProducts(list || []);
      } catch (e) {
        console.error("상품 목록을 불러오지 못했습니다.", e);
      }
    };

    fetchProducts();
  }, []);

  const handleOpenAccordion = (id) => {
    setActiveAccordion((prev) => (prev === id ? "" : id));
  };

const handleOpenModal = (type, targetId = null, defaultText = "") => {
  setModalType(type);
  setModalTargetId(targetId);  // ✅ 그대로 사용 가능
  setModalText(defaultText);
  setModalOpen(true);
};

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalType(null);
    setModalTargetId(null);
    setModalText("");
  };

  const handleConfirmModal = () => {
    // 실제 API 연동은 나중에 연결
    if (!modalType) return;

    if (modalType === "notice") {
      window.alert("공지 등록 기능은 추후 API 연동 시 구현해주세요.");
    } else if (modalType === "qa") {
      window.alert("질문 답변 기능은 추후 API 연동 시 구현해주세요.");
    } else if (modalType === "review") {
      window.alert("리뷰 답글 기능은 추후 API 연동 시 구현해주세요.");
    }

    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <p className="text-center text-muted py-5">불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <div className="alert alert-danger my-5 text-center">{error}</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <p className="text-center text-muted py-5">
          공동구매 정보를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  const currentQty = deal.currentQuantity ?? 0;
  const minQty = deal.minMemberCount ?? 0;
  const maxQty = deal.maxMemberCount ?? null;

  const statusBadgeColor =
    deal.status === "OPEN"
      ? "#16a34a"
      : deal.status === "PREPARE_SHIPPING"
      ? "#2563eb"
      : deal.status === "SHIPPING"
      ? "#7c3aed"
      : "#6b7280";

  return (
    <div
      className="container"
      style={{
        marginTop: 120,
        marginBottom: 80,
        maxWidth: 1180,
      }}
    >
      {/* 상단 요약 헤더 */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div
              className="text-muted mb-1"
              style={{ fontSize: "0.8rem", letterSpacing: "0.02em" }}
            >
              공동구매 관리
            </div>
            <h2 style={{ fontWeight: 800, fontSize: "1.6rem" }}>
              {deal.title || "제목 미입력"}
            </h2>
            {deal.subTitle && (
              <div
                className="text-muted"
                style={{ fontSize: "0.9rem", marginTop: 4 }}
              >
                {deal.subTitle}
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div
              className="px-3 py-1 rounded-pill"
              style={{
                backgroundColor: "#f3f4f6",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              ID: {deal.groupDealId}
            </div>
            <div
              className="px-3 py-1 rounded-pill text-white"
              style={{
                backgroundColor: statusBadgeColor,
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {deal.status || "상태 미정"}
            </div>
            <div className="text-end">
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                }}
              >
                생성일 {formatDateTime(deal.createdAt)}
              </div>
              {deal.updatedAt && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                  }}
                >
                  수정일 {formatDateTime(deal.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 진행 요약 줄 */}
        <div
          className="mt-3 p-3 rounded-3"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <div className="d-flex flex-wrap align-items-center gap-4">
            <div>
              <div className="text-muted small">진행률</div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#b91c1c",
                }}
              >
                {minQty > 0 ? Math.round((currentQty / minQty) * 100) : 0}%
              </div>
            </div>
            <div>
              <div className="text-muted small">모집 수량</div>
              <div style={{ fontWeight: 700 }}>
                {formatNumber(currentQty)} / {formatNumber(minQty)}
                {maxQty && ` (최대 ${formatNumber(maxQty)})`}
              </div>
            </div>
            <div>
              <div className="text-muted small">공동구매가</div>
              <div style={{ fontWeight: 700 }}>
                {formatNumber(deal.dealPrice)}원
              </div>
            </div>
            <div>
              <div className="text-muted small">마감일</div>
              <div style={{ fontWeight: 700 }}>
                {deal.endAt ? deal.endAt.slice(0, 10) : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상단 아코디언 3개 */}
      <div className="mb-4">
        {/* 공동구매 기본 정보 */}
        <AccordionSection
          id="basic"
          title="공동구매 기본 정보"
          description="상품, 제목, 설명, 이미지, 생산 관련 정보를 관리합니다."
          activeId={activeAccordion}
          onToggle={handleOpenAccordion}
        >
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <small className="text-muted d-block mb-1">상품 선택</small>
                <ProductSelectDropdown
                  products={products}
                  selectedProductId={deal.productId}
                  onChange={(productId) =>
                    setDeal((prev) => ({ ...prev, productId }))
                  }
                />
              </div>

              <div className="mb-3">
                <TitleSection
                  title={deal.title}
                  subTitle={deal.subTitle}
                  onChangeTitle={(title) =>
                    setDeal((prev) => ({ ...prev, title }))
                  }
                  onChangeSubTitle={(subTitle) =>
                    setDeal((prev) => ({ ...prev, subTitle }))
                  }
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <small className="text-muted d-block mb-1">대표 이미지</small>
              <ImageUploadBox
                imageUrl={deal.mainImageUrl}
                onImageChange={(url) =>
                  setDeal((prev) => ({ ...prev, mainImageUrl: url }))
                }
              />
              <div className="form-text mt-1">
                대표 상품 또는 농장 사진을 등록해주세요.
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* 가격 & 시세 */}
        <AccordionSection
          id="price"
          title="가격 & 시세"
          description="공동구매 가격과 최근 시세, 할인율을 확인합니다."
          activeId={activeAccordion}
          onToggle={handleOpenAccordion}
        >
          <PriceInfo
            dealPrice={deal.dealPrice}
            marketPrice={deal.marketPrice}
            discountRate={deal.discountRate}
          />
          <div className="mt-3 small text-muted">
            최근 30일/90일 시세 그래프는 추후 연동 시 이 영역에 추가하면 됩니다.
          </div>
        </AccordionSection>

        {/* 진행 현황 */}
        <AccordionSection
          id="status"
          title="진행 현황"
          description="현재 모집 진행률, 참여자, 발송 상태를 한눈에 확인합니다."
          activeId={activeAccordion}
          onToggle={handleOpenAccordion}
        >
          <div className="mb-3">
            <BarProgress currentQuantity={currentQty} minMemberCount={minQty} />
          </div>

          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <ParticipantListSection participants={deal.participants || []} />
            </div>
            <div className="col-12 col-lg-6">
              <DeliveryStatusSection
                status={deal.status}
                onChangeStatus={(next) => {
                  // 실제 API 연동은 나중에 연결
                  window.alert(
                    `상태를 "${deal.status}" 에서 "${next}" 로 변경하는 API를 연동해주세요.`
                  );
                  setDeal((prev) => ({ ...prev, status: next }));
                }}
              />
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* 하단 탭 */}
      <div className="mb-3">
        <div className="d-flex border-bottom">
          <button
            type="button"
            className="btn border-0 rounded-0 flex-fill"
            style={{
              backgroundColor: "transparent",
              borderBottom:
                activeTab === "notice"
                  ? "3px solid #111827"
                  : "3px solid transparent",
              fontWeight: activeTab === "notice" ? 700 : 500,
              fontSize: "0.95rem",
            }}
            onClick={() => setActiveTab("notice")}
          >
            공지사항
          </button>
          <button
            type="button"
            className="btn border-0 rounded-0 flex-fill"
            style={{
              backgroundColor: "transparent",
              borderBottom:
                activeTab === "qa"
                  ? "3px solid #111827"
                  : "3px solid transparent",
              fontWeight: activeTab === "qa" ? 700 : 500,
              fontSize: "0.95rem",
            }}
            onClick={() => setActiveTab("qa")}
          >
            Q&amp;A
          </button>
          <button
            type="button"
            className="btn border-0 rounded-0 flex-fill"
            style={{
              backgroundColor: "transparent",
              borderBottom:
                activeTab === "review"
                  ? "3px solid #111827"
                  : "3px solid transparent",
              fontWeight: activeTab === "review" ? 700 : 500,
              fontSize: "0.95rem",
            }}
            onClick={() => setActiveTab("review")}
          >
            리뷰
          </button>
        </div>
      </div>

      {/* 하단 탭 내용 */}
      <div className="mb-5">
        {activeTab === "notice" && (
          <NoticeSection
            notices={deal.notices || []}
            onAddNotice={() => handleOpenModal("notice")}
          />
        )}
        {activeTab === "qa" && (
          <QASection
            items={deal.questions || []}
            onAnswer={(qaId, defaultText) =>
              handleOpenModal("qa", qaId, defaultText || "")
            }
          />
        )}
        {activeTab === "review" && (
          <ReviewSection
            reviews={deal.reviews || []}
            onReply={(reviewId, defaultText) =>
              handleOpenModal("review", reviewId, defaultText || "")
            }
          />
        )}
      </div>

      {/* 공통 모달 */}
      <CommonModal
        open={modalOpen}
        title={
          modalType === "notice"
            ? "공지 등록"
            : modalType === "qa"
            ? "답변 작성"
            : modalType === "review"
            ? "판매자 답글"
            : ""
        }
        placeholder={
          modalType === "notice"
            ? "공지 내용을 입력해주세요."
            : modalType === "qa"
            ? "고객 질문에 대한 답변을 입력해주세요."
            : "리뷰에 대한 답글을 입력해주세요."
        }
        value={modalText}
        onChange={setModalText}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
      />
    </div>
  );
};

export default GroupDealManagePage;
