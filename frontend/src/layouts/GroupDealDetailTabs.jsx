// src/layouts/GroupDealDetailTabs.jsx - 공동구매 상세 하단 탭 레이아웃

import React, { useState } from "react";
import "./GroupDealDetailTabs.css";
import GroupDealQnaSection from "../pages/groupdeal/components/GroupDealQnaSection";

const PRIMARY_DEEP_GREEN = "#166534"; // 메인 딥그린 색상
const TABS_STICKY_OFFSET = 80;        // 상단 헤더 높이에 맞춰 필요하면 숫자 조정

function GroupDealDetailTabs({ deal }) {
  const [active, setActive] = useState("detail");

  // ✅ 상세 이미지용 배열: imagePaths 우선, 없으면 images에서 생성
  const detailImages = (() => {
    if (!deal) return [];

    if (Array.isArray(deal.imagePaths) && deal.imagePaths.length > 0) {
      return deal.imagePaths;
    }

    if (Array.isArray(deal.images) && deal.images.length > 0) {
      return deal.images
        .map(
          (img) =>
            img.imageUrl || img.url || img.path || img.image_path || img.src
        )
        .filter(Boolean);
    }

    return [];
  })();

  // ✅ 상품상세 텍스트: deal.detail 포함해서 여러 필드 중 하나를 사용
  const detailText =
    (deal &&
      (
        deal.detail ||                // ← 원래 페이지에서 쓰던 필드
        deal.description ||
        deal.groupDealDetail ||
        deal.group_deal_detail ||
        deal.productDescription
      )) ||
    "";

  // 상품 정보 요약 박스용 데이터 (공동구매 메타 정보)
  const specRows = deal
    ? [
        {
          label: "공동구매 ID",
          value: deal.groupDealId,
        },
        {
          label: "진행 상태",
          value: deal.status,
        },
        {
          label: "성공 최소 인원",
          value:
            deal.minMemberCount != null ? `${deal.minMemberCount}명` : null,
        },
        {
          label: "최대 인원",
          value:
            deal.maxMemberCount != null ? `${deal.maxMemberCount}명` : null,
        },
        {
          label: "1인당 구매 제한",
          value:
            (deal.perUserLimitQty || deal.per_user_limit_qty) != null
              ? `${deal.perUserLimitQty || deal.per_user_limit_qty}개`
              : null,
        },
        {
          label: "정상가",
          value:
            deal.originPrice != null
              ? `${Number(deal.originPrice).toLocaleString()}원`
              : null,
        },
        {
          label: "공동구매가",
          value:
            deal.dealPrice != null
              ? `${Number(deal.dealPrice).toLocaleString()}원`
              : null,
        },
        {
          label: "할인율",
          value: deal.discountRate != null ? `${deal.discountRate}%` : null,
        },
        {
          label: "시작일",
          value: deal.startAt || deal.start_at || null,
        },
        {
          label: "종료일",
          value: deal.endAt || deal.end_at || null,
        },
      ].filter(
        (row) =>
          row.value !== null &&
          row.value !== undefined &&
          row.value !== ""
      )
    : [];

  // 상품평 탭 제거 (detail / qna / shipping 만 사용)
  const tabs = [
    { key: "detail", label: "상품상세" },
    { key: "qna", label: "상품문의" },
    { key: "shipping", label: "배송/교환/반품 안내" },
  ];

  const renderContent = () => {
    switch (active) {
      case "detail":
        return (
          <div className="py-3 deal-detail-container">
            {/* 상단 헤더 */}
            <div className="text-center mb-4">
              {(deal.subTitle || deal.region) && (
                <div
                  className="mb-2"
                  style={{
                    fontSize: "0.9rem",
                    color: "#9ca3af",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {deal.subTitle || deal.region}
                </div>
              )}

              <div
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  lineHeight: 1.4,
                  letterSpacing: "-0.03em",
                  whiteSpace: "pre-line",
                }}
              >
                {deal.productName}
              </div>

              <div
                className="mt-3"
                style={{
                  height: 1,
                  maxWidth: 420,
                  margin: "0.75rem auto 0",
                  backgroundColor: "#e5e7eb",
                }}
              />
            </div>

            {/* 농산물 Check Point - 리디자인 */}
            <section className="deal-section deal-section-checkpoint">
              <div className="deal-section-header text-center mb-4">
                <div className="deal-section-kicker">Check Point</div>
                <h5 className="deal-section-title">이 상품, 이런 점이 좋아요</h5>
                <p className="deal-section-desc">
                  산지 선택부터 유통 과정, 식탁 위의 활용까지
                  <br />
                  한 번에 보기 쉽게 정리했어요.
                </p>
              </div>

              <div className="check-grid">
                {/* 산지 환경 */}
                <div className="check-card">
                  <div className="check-card-icon" aria-hidden="true">
                    🌿
                  </div>
                  <div className="check-card-label">
                    <span className="check-card-kicker">Origin</span>
                    <div className="check-card-title">산지 환경</div>
                  </div>
                  <p className="check-card-body">
                    제철 산지에서 수확한 국내 농·수산물만 선별해 담았어요.
                  </p>
                </div>

                {/* 재료와 성분 */}
                <div className="check-card">
                  <div className="check-card-icon" aria-hidden="true">
                    🥕
                  </div>
                  <div className="check-card-label">
                    <span className="check-card-kicker">Ingredients</span>
                    <div className="check-card-title">재료와 성분</div>
                  </div>
                  <p className="check-card-body">
                    불필요한 첨가물은 줄이고, 원재료 본연의 맛과 향을 살렸어요.
                  </p>
                </div>

                {/* 생산·유통 과정 */}
                <div className="check-card">
                  <div className="check-card-icon" aria-hidden="true">
                    🚚
                  </div>
                  <div className="check-card-label">
                    <span className="check-card-kicker">Process</span>
                    <div className="check-card-title">생산·유통</div>
                  </div>
                  <p className="check-card-body">
                    수확 직후 신속하게 포장·출고해 신선함이 오래가도록 관리해요.
                  </p>
                </div>

                {/* 활용법 */}
                <div className="check-card">
                  <div className="check-card-icon" aria-hidden="true">
                    🍽
                  </div>
                  <div className="check-card-label">
                    <span className="check-card-kicker">Recommendation</span>
                    <div className="check-card-title">건강</div>
                  </div>
                  <p className="check-card-body">
                    믿을 수 있는 건강한 재료로 영양 가득한 식사를 즐겨보세요.
                  </p>
                </div>
              </div>
            </section>

            {/* ✅ 상세 이미지 영역 */}
            {detailImages.length > 0 && (
              <section className="deal-section deal-section-images">
                <div className="deal-section-header mb-3">
                  <div className="deal-section-kicker">Detail View</div>
                  <h6 className="deal-section-subtitle">
                    실제 상품과 가까운 이미지로 확인해 보세요
                  </h6>
                </div>

                <div className="deal-images-wrap">
                  {detailImages.map((img, idx) => (
                    <div key={idx} className="deal-image-item">
                      <img
                        src={img}
                        alt={`${deal.productName || "상품 이미지"}-${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* ✅ 이미지 바로 아래에 상품 소개(detailText) */}
{detailText && (
  <section className="deal-section deal-section-detail-text">
    <div className="deal-section-header mb-3">
      <div className="deal-section-kicker">Story</div>
      <h6 className="deal-section-subtitle">상품 소개</h6>
    </div>
    <div
      className="detail-text-box"
      dangerouslySetInnerHTML={{ __html: detailText }}
    />
  </section>
)}
         

            {/* 추가 detailSections */}
            {deal.detailSections &&
              deal.detailSections.map((sec) => (
                <div key={sec.title} className="mb-3">
                  <strong className="small d-block mb-1">{sec.title}</strong>
                  <p className="small mb-0">{sec.content}</p>
                </div>
              ))}
          </div>
        );
      case "qna":
        // 🔹 실제 QnA 컴포넌트 렌더링
        return <GroupDealQnaSection deal={deal} />;
      case "shipping":
        return (
          <div className="py-3 small">
            <p className="mb-2 fw-semibold">배송 안내</p>
            <ul className="mb-3 ps-3">
              <li className="mb-1">
                본 사이트의 모든 상품은 산지 또는 지정 물류센터에서
                <strong> 신선 농산물 전용 택배</strong>로 발송됩니다.
              </li>
              <li className="mb-1">
                주문 확인 후 보통 <strong>1~2영업일 이내 출고</strong>되며,
                수확 일정·기상 상황·택배사 사정에 따라 출고일이 변경될 수
                있습니다.
              </li>
              <li className="mb-1">
                일부 산지 직송 상품의 경우 생산자 일정에 따라
                <strong> 개별 발송</strong>되며, 동일 주문 내 상품이 여러
                박스로 나누어 도착할 수 있습니다.
              </li>
              <li className="mb-1">
                특정 날짜 수령을 원하시는 경우, 주문 전 고객센터로 가능 여부를
                문의해 주세요.
              </li>
            </ul>

            <p className="mb-2 fw-semibold">교환/반품 안내</p>
            <p className="mb-1 fw-semibold">01. 상품에 문제가 있는 경우</p>
            <ul className="mb-3 ps-3">
              <li className="mb-1">
                수령하신 농산물에{" "}
                <strong>심한 상처, 부패, 오배송, 누락</strong> 등이 있는
                경우, 상품 수령 후 <strong>24시간 이내</strong> 고객센터로
                문의해 주세요.
              </li>
              <li className="mb-1">
                신속한 처리를 위해 상품 전체 사진, 박스 외관, 운송장 사진 등
                상태 확인이 가능한 이미지를 요청드릴 수 있습니다.
              </li>
              <li className="mb-1">
                판매자 책임으로 확인되는 경우 <strong>전액 환불</strong> 또는
                <strong> 재발송</strong>으로 안내해 드립니다.
              </li>
            </ul>

            <p className="mb-1 fw-semibold">02. 단순 변심 / 주문 착오의 경우</p>
            <ul className="mb-3 ps-3">
              <li className="mb-1">
                신선/냉장/냉동 농산물은 상품 특성상
                <strong> 단순 변심·주문 착오에 의한 교환/반품이 어렵습니다.</strong>
              </li>
              <li className="mb-1">
                비신선 상품 등 반품이 가능한 상품의 경우, 상품 수령 후
                <strong> 7일 이내</strong> 요청해 주셔야 합니다.
              </li>
              <li className="mb-1">
                단순 변심에 의한 반품 시 왕복 배송비(기본 6,000원, 지역에 따라
                상이)가 공제된 후 환불됩니다.
              </li>
            </ul>

            <p className="mb-1 fw-semibold">03. 교환/반품이 불가한 경우</p>
            <ul className="mb-3 ps-3">
              <li className="mb-1">
                고객 부주의로 인한 상품 훼손·변질, 보관 방법 미준수로 인한
                품질 저하가 발생한 경우
              </li>
              <li className="mb-1">
                포장을 개봉하여 상품 가치가 현저히 감소한 경우
              </li>
              <li className="mb-1">
                수령 후 시간이 지나 다시 판매하기 어려울 정도로 상품 가치가
                감소한 경우
              </li>
              <li className="mb-1">
                냉장/냉동/신선 상품의 단순 변심, 고객 연락 두절 등 정상적인
                회수가 어려운 경우
              </li>
            </ul>

            <p className="mb-2 fw-semibold">주문 취소 및 결제 안내</p>
            <ul className="mb-0 ps-3">
              <li className="mb-1">
                주문 취소는 <strong>배송 준비 전까지</strong> 마이페이지 &gt;
                주문내역에서 직접 가능합니다.
              </li>
              <li className="mb-1">
                산지에서 이미 수확·포장이 진행된 이후에는 주문 취소가 제한될
                수 있습니다.
              </li>
              <li className="mb-1">
                결제 취소 후 환불 시기는 카드사·결제사 정책에 따르며, 사용한
                쿠폰과 적립금은 조건에 따라 복원 또는 소멸될 수 있습니다.
              </li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-4">
      {/* 탭 헤더 - 스크롤 시 상단 고정 */}
      <div
        className="d-flex"
        style={{
          position: "sticky",
          top: TABS_STICKY_OFFSET,
          zIndex: 20,
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className="flex-fill btn btn-link text-decoration-none py-3"
              style={{
                borderRadius: 0,
                marginBottom: "-1px",
                borderBottom: isActive
                  ? `2px solid ${PRIMARY_DEEP_GREEN}`
                  : "2px solid transparent",
                color: isActive ? "#111827" : "#6b7280",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 내용 */}
      {renderContent()}
    </div>
  );
}

export default GroupDealDetailTabs;
