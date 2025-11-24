// 파일 위치 예시: src/components/GroupDealDetailTabs.jsx

import React, { useState } from "react";

const PRIMARY_DEEP_GREEN = "#166534"; // 메인 딥그린 색상
const TABS_STICKY_OFFSET = 80;        // 상단 헤더 높이에 맞춰 필요하면 숫자 조정

function GroupDealDetailTabs({ deal }) {
  const [active, setActive] = useState("detail");

  // 상품문의에 보여줄 더미 데이터 (마켓컬리/쿠팡 Q&A 느낌)
  const dummyQnaList = [
    {
      id: 1,
      title: "비밀글입니다. 🔒",
      author: "김*지",
      date: "2024.12.16",
      status: "답변완료",
    },
    {
      id: 2,
      title: "비밀글입니다. 🔒",
      author: "손*지",
      date: "2024.12.14",
      status: "답변완료",
    },
    {
      id: 3,
      title: "배송이 너무 늦어요",
      author: "최*윤",
      date: "2024.12.03",
      status: "답변완료",
    },
    {
      id: 4,
      title: "비밀글입니다. 🔒",
      author: "혜*",
      date: "2024.11.29",
      status: "답변완료",
    },
    {
      id: 5,
      title: "받아보니 크기가 다 달라요",
      author: "박*주",
      date: "2024.11.17",
      status: "답변완료",
    },
    {
      id: 6,
      title: "환불 요청합니다",
      author: "지*지",
      date: "2024.11.14",
      status: "답변완료",
    },
    {
      id: 7,
      title: "두 번째 구매인데 만족해요",
      author: "송*하",
      date: "2024.11.11",
      status: "답변완료",
    },
    {
      id: 8,
      title: "비밀글입니다. 🔒",
      author: "봄*",
      date: "2024.11.09",
      status: "답변완료",
    },
    {
      id: 9,
      title: "맛이 지난번보다 덜 달아요",
      author: "윤*수",
      date: "2024.11.08",
      status: "답변완료",
    },
    {
      id: 10,
      title: "배송 하루 지연 문의",
      author: "이*연",
      date: "2024.11.05",
      status: "답변완료",
    },
  ];

  const tabs = [
    { key: "detail", label: "상품상세" },
    { key: "review", label: `상품평 (${deal.reviewCount ?? 0})` },
    { key: "qna", label: "상품문의" },
    { key: "shipping", label: "배송/교환/반품 안내" },
  ];

  const renderContent = () => {
    switch (active) {
      case "detail":
        return (
          <div className="py-3">
            <p className="small mb-3">{deal.description}</p>
            {deal.detailSections &&
              deal.detailSections.map((sec) => (
                <div key={sec.title} className="mb-3">
                  <strong className="small d-block mb-1">{sec.title}</strong>
                  <p className="small mb-0">{sec.content}</p>
                </div>
              ))}
          </div>
        );
      case "review":
        return (
          <div className="py-4 text-center text-muted small">
            아직 상품평 기능은 준비 중입니다.
          </div>
        );
      case "qna":
        return (
          <div className="py-3 small">
            {/* 상단 안내 영역 (기존 그대로 유지) */}
            <p className="mb-2 fw-semibold">상품 문의 안내</p>
            <p className="mb-2">
              배송 일정, 보관 방법, 환불 절차 등 상품 이용과 관련된 내용만
              문의해 주세요. 빠르고 정확한 안내를 위해 주문 정보 확인이
              필요할 수 있습니다.
            </p>
            <ul className="mb-3 ps-3">
              <li className="mb-1">
                제목과 내용에는 <strong>상품명이나 특정 농가명 등은 기재하지
                마시고</strong>, 주문번호 또는 구매일을 중심으로 작성해 주세요.
              </li>
              <li className="mb-1">
                예시 제목) “배송은 언제 도착하나요?”, “시일에 맞춰 배송이
                되는지 궁금합니다”, “환불 관련 문의드립니다”
              </li>
              <li className="mb-1">
                상품 상태 문의 시에는 수령일과 보관 방법을 함께 남겨주시면
                도움이 됩니다.
              </li>
            </ul>
            <p className="text-muted mb-0">
              개인정보(연락처, 계좌번호, 주소 등)는 문의글에 절대 남기지
              말아 주세요. 필요한 경우 고객센터를 통해 개별 안내해 드립니다.
            </p>

            {/* 실제 마켓컬리/쿠팡처럼 보이는 Q&A 리스트 영역 (더미데이터) */}
            <div className="mt-4">
              {/* 헤더: 문의 건수 + 문의하기 버튼 */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="fw-semibold">
                  상품 문의{" "}
                  <span className="text-muted">
                    ({dummyQnaList.length})
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                >
                  상품 문의하기
                </button>
              </div>

              {/* 컬럼 헤더 영역 (번호 / 상태 / 제목 / 작성자 / 작성일 느낌) */}
              <div
                className="d-none d-md-flex border-top border-bottom py-2 text-muted"
                style={{ fontSize: "0.78rem" }}
              >
                <div style={{ width: 50 }}>번호</div>
                <div style={{ width: 80 }}>답변상태</div>
                <div className="flex-grow-1">제목</div>
                <div style={{ width: 80 }} className="text-center">
                  작성자
                </div>
                <div style={{ width: 90 }} className="text-center">
                  작성일
                </div>
              </div>

              {/* 문의 리스트 */}
              <div className="border-top">
                {dummyQnaList.map((item, index) => (
                  <div
                    key={item.id}
                    className="d-flex flex-column flex-md-row align-items-start align-items-md-center border-bottom py-3"
                  >
                    {/* 번호 (PC에서만 중요) */}
                    <div
                      className="text-muted small d-none d-md-block"
                      style={{ width: 50 }}
                    >
                      {dummyQnaList.length - index}
                    </div>

                    {/* 상태 + 제목 */}
                    <div className="flex-grow-1 w-100">
                      <div className="d-flex align-items-center mb-1">
                        <span
                          className="badge rounded-pill me-2"
                          style={{
                            backgroundColor: "#e5f7ec",
                            color: PRIMARY_DEEP_GREEN,
                            fontWeight: 600,
                          }}
                        >
                          {item.status}
                        </span>
                        <span className="fw-semibold">{item.title}</span>
                      </div>

                      {/* 모바일에서 작성자/날짜를 밑에 한 줄로 */}
                      <div className="d-block d-md-none text-muted small mt-1">
                        {item.author} · {item.date}
                      </div>
                    </div>

                    {/* 작성자 / 작성일 (PC 뷰) */}
                    <div className="d-none d-md-flex flex-column align-items-center text-muted small ms-3">
                      <div style={{ width: 80 }} className="text-center">
                        {item.author}
                      </div>
                      <div style={{ width: 90 }} className="text-center">
                        {item.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이징 느낌만 내는 더미 영역 */}
              <div className="d-flex justify-content-center mt-3">
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className="page-item disabled">
                      <span className="page-link">〈</span>
                    </li>
                    <li className="page-item active">
                      <span className="page-link">1</span>
                    </li>
                    <li className="page-item">
                      <span className="page-link">2</span>
                    </li>
                    <li className="page-item">
                      <span className="page-link">3</span>
                    </li>
                    <li className="page-item">
                      <span className="page-link">〉</span>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        );
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
                특정 날짜 수령을 원하시는 경우, 주문 전 고객센터로
                가능 여부를 문의해 주세요.
              </li>
            </ul>

            <p className="mb-2 fw-semibold">교환/반품 안내</p>
            <p className="mb-1 fw-semibold">01. 상품에 문제가 있는 경우</p>
            <ul className="mb-3 ps-3">
              <li className="mb-1">
                수령하신 농산물에 <strong>심한 상처, 부패, 오배송, 누락</strong>
                등이 있는 경우, 상품 수령 후 <strong>24시간 이내</strong>
                고객센터로 문의해 주세요.
              </li>
              <li className="mb-1">
                신속한 처리를 위해 상품 전체 사진, 박스 외관, 운송장
                사진 등 상태 확인이 가능한 이미지를 요청드릴 수 있습니다.
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
