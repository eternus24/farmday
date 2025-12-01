// 경로: frontend/src/pages/groupdeal/ProducerGroupDealCreatePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createGroupDeal,
  uploadGroupDealImage,
} from "../../api/groupDealApi";

import "./ProducerGroupDealCreatePage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 숫자 포맷
function formatNumber(value) {
  if (value == null || value === "") return "";
  return new Intl.NumberFormat("ko-KR").format(value);
}

// 할인율 계산
function calcDiscountRate(originPrice, dealPrice) {
  const o = Number(originPrice);
  const d = Number(dealPrice);
  if (!o || !d || o <= 0) return null;
  const rate = ((o - d) / o) * 100;
  return Math.round(rate);
}

// yyyy-MM-dd → yyyy-MM-dd'T'HH:mm:ss 형태로 맞춰서 백엔드로 보냄
function toDateTimeString(dateStr) {
  if (!dateStr) return null;
  return `${dateStr}T00:00:00`;
}

function ProducerGroupDealCreatePage() {
  const navigate = useNavigate();

  // 🔹 1. 판매자가 직접 적는 제품명
  const [productName, setProductName] = useState("");

  const [form, setForm] = useState({
    title: "",
    subTitle: "",
    detail: "",
    originPrice: "",
    dealPrice: "",
    minMemberCount: "",
    maxMemberCount: "",
    perUserLimitQty: "",
    startAt: "",
    endAt: "",
    shippingStartDate: "",
    shippingEndDate: "",
    imageUrls: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 최근 시세(데모용)
  const [recentMarketPrice, setRecentMarketPrice] = useState(null);

  const discountRate = calcDiscountRate(form.originPrice, form.dealPrice);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field, value) => {
    const num = value.replace(/[^0-9]/g, "");
    setForm((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  const handleQuickMinCount = (value) => {
    setForm((prev) => ({
      ...prev,
      minMemberCount: String(value),
    }));
  };

  // 발송 예정일 빠른 설정 (모집 마감일 기준 N일)
  const handleQuickShipping = (days) => {
    if (!form.endAt) {
      window.alert("먼저 모집 마감일을 선택해주세요.");
      return;
    }
    const endDate = new Date(form.endAt);
    if (Number.isNaN(endDate.getTime())) {
      return;
    }

    const startDate = new Date(
      endDate.getTime() + 1 * 24 * 60 * 60 * 1000
    );
    const shipEnd = new Date(
      startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000
    );

    const format = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    handleChange("shippingStartDate", format(startDate));
    handleChange("shippingEndDate", format(shipEnd));
  };

  /**
   * 이미지 업로드 (백엔드로 파일 전송 → imageUrl 응답 받아서 form.imageUrls에 추가)
   *
   * 백엔드 응답 예:
   *   { imageUrl: "/uploads/groupdeal/파일명.jpg" }
   */
  const handleUploadImages = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 백엔드로 바로 파일 업로드 (multipart/form-data)
        // 응답: { imageUrl: "/uploads/groupdeal/..." }
        const { imageUrl } = await uploadGroupDealImage(file);

        newUrls.push(imageUrl);
      }

      setForm((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newUrls],
      }));
    } catch (e) {
      console.error(e);
      window.alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      // input 초기화
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSetRecentMarketPrice = () => {
    if (!form.dealPrice) {
      window.alert("먼저 공동구매 가격을 입력해주세요.");
      return;
    }
    // 데모용: dealPrice보다 15% 높은 값을 "시세"라고 가정
    const deal = Number(form.dealPrice);
    if (!deal) return;
    const market = Math.round(deal * 1.15);
    setRecentMarketPrice(market);
    setForm((prev) => ({
      ...prev,
      originPrice: String(market),
    }));
  };

  const validateForm = () => {
    if (!productName.trim()) {
      window.alert("판매하실 농산물 이름(제품명)을 입력해주세요.");
      return false;
    }
    if (!form.title.trim()) {
      window.alert("공동구매 제목을 입력해주세요.");
      return false;
    }
    if (!form.dealPrice || Number(form.dealPrice) <= 0) {
      window.alert("공동구매 가격을 입력해주세요.");
      return false;
    }
    if (!form.minMemberCount || Number(form.minMemberCount) <= 0) {
      window.alert("최소 모집 수량을 입력해주세요.");
      return false;
    }
    if (!form.startAt || !form.endAt) {
      window.alert("모집 시작일과 마감일을 선택해주세요.");
      return false;
    }
    if (form.imageUrls.length === 0) {
      window.alert("최소 1장 이상의 이미지를 등록해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validateForm()) return;

    // 🔹 DTO 변환 (백엔드 GroupDealCreateRequestDto 기준)
    const dto = {
      productId: null, // 상품 테이블과 아직 안 묶을 경우 null 허용
      title: form.title.trim(),
      subTitle: form.subTitle.trim(),
      // 제품명을 상세 설명 맨 위에 한 번 더 노출
      detail: `${productName.trim()}\n\n${form.detail.trim()}`,
      originPrice: form.originPrice ? Number(form.originPrice) : null,
      dealPrice: Number(form.dealPrice),
      discountRate: discountRate != null ? discountRate : null,
      minMemberCount: Number(form.minMemberCount),
      maxMemberCount: form.maxMemberCount ? Number(form.maxMemberCount) : null,
      perUserLimitQty: form.perUserLimitQty
        ? Number(form.perUserLimitQty)
        : null,
      startAt: toDateTimeString(form.startAt),
      endAt: toDateTimeString(form.endAt),
      shippingStartDate: form.shippingStartDate
        ? toDateTimeString(form.shippingStartDate)
        : null,
      shippingEndDate: form.shippingEndDate
        ? toDateTimeString(form.shippingEndDate)
        : null,
      imageUrls: form.imageUrls, // "/uploads/groupdeal/..." 형태의 상대경로 리스트
      // groupDealId, createdBy 는 백엔드에서 세팅
    };

    try {
      setSubmitting(true);
      await createGroupDeal(dto);
      window.alert("공동구매가 등록되었습니다.");
      navigate("/group-deals");
    } catch (e) {
      console.error(e);
      window.alert(e.message || "공동구매 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="producer-groupdeal-page container">
      {/* 상단 안내 영역 */}
      <div className="pg-header">
        <div>
          <h2 className="pg-title">공동구매 등록하기</h2>
          <p className="pg-subtitle">
            사진 올리고, 가격과 기간만 선택하시면 됩니다.{" "}
            <span className="pg-required-mark">★ 표시</span>된 항목만 꼭
            입력해주세요.
          </p>
        </div>
        <div className="pg-steps">
          <div className="pg-step">1. 사진</div>
          <div className="pg-step">2. 농산물 정보</div>
          <div className="pg-step">3. 가격</div>
          <div className="pg-step">4. 수량</div>
          <div className="pg-step">5. 기간</div>
        </div>
      </div>

      {/* 1. 사진 올리기 (맨 위로) */}
      <section className="pg-section-card">
        <div className="pg-section-title">
          <span className="pg-section-badge">1</span>
          <span>사진 올리기</span>
        </div>
        <p className="text-muted mb-2">
          최소 1장 이상 등록해주세요. 농장 사진이나 상품 사진이면 좋습니다.
        </p>
        <div className="mb-3">
          <label className="pg-file-label" htmlFor="groupdeal-images">
            📷 사진 선택하기
          </label>
          <input
            id="groupdeal-images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleUploadImages}
            disabled={uploading}
            className="pg-file-input"
          />
        </div>
        {uploading && (
          <p className="text-muted pg-uploading-text">
            사진을 올리는 중입니다. 잠시만 기다려주세요...
          </p>
        )}

        {form.imageUrls.length > 0 && (
          <div className="row g-3">
            {form.imageUrls.map((url, idx) => (
              <div className="col-6 col-md-3" key={url + idx}>
                <div
                  className="position-relative pg-image-card"
                  style={{
                    border:
                      idx === 0 ? "2px solid #15803d" : "1px solid #e5e7eb",
                  }}
                >
                  <img
                    src={url}
                    alt={`이미지${idx + 1}`}
                    className="pg-image-thumb"
                  />
                  {idx === 0 && (
                    <span className="badge pg-image-main-badge">대표</span>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-light pg-image-remove-btn"
                    onClick={() => handleRemoveImage(idx)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. 농산물 정보 (제품명 / 제목 / 소개) */}
      <section className="pg-section-card">
        <div className="pg-section-title">
          <span className="pg-section-badge">2</span>
          <span>농산물 정보</span>
        </div>

        {/* 제품명 */}
        <div className="mb-4">
          <label className="form-label fw-semibold">
            제품명(농산물 이름){" "}
            <span className="text-danger fw-bold">★</span>
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="예) 김천 샤인머스캣 2kg, 햇고구마 5kg 등"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <small className="text-muted">
            판매하실 농산물 이름을 편하게 적어주세요. 이 이름은 상세 설명 맨
            위에도 함께 들어갑니다.
          </small>
        </div>

        {/* 공동구매 제목 */}
        <div className="mb-4">
          <label className="form-label fw-semibold">
            공동구매 제목 <span className="text-danger fw-bold">★</span>
          </label>
          <div className="mb-2 d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn pg-pill-button"
              onClick={() =>
                handleChange(
                  "title",
                  productName.trim()
                    ? `${productName.trim()} 공동구매`
                    : "올해 첫 수확 샤인머스캣 공동구매"
                )
              }
            >
              제품명 기반 예시 제목
            </button>
            <button
              type="button"
              className="btn pg-pill-button"
              onClick={() =>
                handleChange(
                  "title",
                  "가성비 좋은 가정용 과일 공동구매"
                )
              }
            >
              예시 제목 2
            </button>
          </div>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="예) 김천 샤인머스캣 2kg 공동구매"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        {/* 한 줄 소개 */}
        <div className="mb-3">
          <label className="form-label fw-semibold">한 줄 소개</label>
          <input
            type="text"
            className="form-control"
            placeholder="예) 당도 높은 샤인머스캣을 산지에서 바로 보내드립니다."
            value={form.subTitle}
            onChange={(e) => handleChange("subTitle", e.target.value)}
          />
        </div>

        {/* 상품 설명 */}
        <div className="mb-0">
          <label className="form-label fw-semibold">상품 설명</label>
          <textarea
            className="form-control pg-textarea"
            rows={4}
            placeholder="재배 방식, 수확 시기, 맛/식감, 보관 방법 등을 자유롭게 적어주세요."
            value={form.detail}
            onChange={(e) => handleChange("detail", e.target.value)}
          />
        </div>
      </section>

      {/* 3. 가격 설정 */}
      <section className="pg-section-card">
        <div className="pg-section-title">
          <span className="pg-section-badge">3</span>
          <span>가격 설정</span>
        </div>

        <div className="row g-3 mb-3">
          {/* 공동구매 가격 */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              공동구매 가격(한 박스){" "}
              <span className="text-danger fw-bold">★</span>
            </label>
            <div className="pg-quick-button-row mb-2">
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() => handleNumberChange("dealPrice", "20000")}
              >
                20,000원
              </button>
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() => handleNumberChange("dealPrice", "25000")}
              >
                25,000원
              </button>
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() => handleNumberChange("dealPrice", "30000")}
              >
                30,000원
              </button>
            </div>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="예) 25000"
                value={form.dealPrice}
                onChange={(e) =>
                  handleNumberChange("dealPrice", e.target.value)
                }
              />
              <span className="input-group-text">원</span>
            </div>
          </div>

          {/* 시세 */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              원래 판매 가격(시세)
            </label>
            <div className="pg-quick-button-row mb-2">
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={handleSetRecentMarketPrice}
              >
                최근 시세 불러오기(예시)
              </button>
            </div>
            <div className="input-group mb-1">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="예) 30000"
                value={form.originPrice}
                onChange={(e) =>
                  handleNumberChange("originPrice", e.target.value)
                }
              />
              <span className="input-group-text">원</span>
            </div>
            {recentMarketPrice && (
              <small className="text-muted">
                예시 시세: 최근 소매 평균 약{" "}
                {formatNumber(recentMarketPrice)}원
              </small>
            )}
          </div>
        </div>

        {/* 가격 비교 가이드 */}
        <div className="pg-guide-box">
          <div className="small text-muted mb-1">가격 가이드</div>
          <div className="small">
            {form.originPrice && form.dealPrice && discountRate != null ? (
              <>
                원래 가격{" "}
                <strong>{formatNumber(form.originPrice)}원</strong> 대비{" "}
                <strong>
                  약 {Math.abs(discountRate)}%{" "}
                  {discountRate > 0 ? "할인" : "할증"}
                </strong>
                으로 판매하게 됩니다.
              </>
            ) : (
              <>
                시세와 공동구매 가격을 입력하면, 할인율을 여기에서 한눈에
                보실 수 있습니다.
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4. 수량 설정 (최소 / 최대 / 1인당 제한) */}
      <section className="pg-section-card">
        <div className="pg-section-title">
          <span className="pg-section-badge">4</span>
          <span>수량 설정</span>
        </div>

        <div className="row g-3">
          {/* 최소 모집 수량 */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">
              최소 모집 수량{" "}
              <span className="text-danger fw-bold">★</span>
            </label>
            <div className="pg-quick-button-row mb-2">
              {[10, 30, 50, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="btn pg-quick-button"
                  onClick={() => handleQuickMinCount(v)}
                >
                  {v}박스
                </button>
              ))}
            </div>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="예) 50"
                value={form.minMemberCount}
                onChange={(e) =>
                  handleNumberChange("minMemberCount", e.target.value)
                }
              />
              <span className="input-group-text">박스 이상</span>
            </div>
            <small className="text-muted">
              이 수량 이상 모이면 출하를 진행합니다.
            </small>
          </div>

          {/* 최대 수량 */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">
              최대 수량 <span className="text-muted">(선택)</span>
            </label>
            <div className="pg-quick-button-row mb-2">
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() => handleNumberChange("maxMemberCount", "")}
              >
                제한 없음
              </button>
              {["50", "100", "200"].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="btn pg-quick-button"
                  onClick={() =>
                    handleNumberChange("maxMemberCount", v)
                  }
                >
                  {v}박스
                </button>
              ))}
            </div>
            <div className="input-group mb-1">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="예) 100 (미입력 시 제한 없음)"
                value={form.maxMemberCount}
                onChange={(e) =>
                  handleNumberChange("maxMemberCount", e.target.value)
                }
              />
              <span className="input-group-text">박스까지</span>
            </div>
            <small className="text-muted">
              너무 많이 모이면 힘드신 경우에만 입력해주세요.
            </small>
          </div>

          {/* 1인당 제한 수량 */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">
              1인당 제한 수량{" "}
              <span className="text-muted">(선택)</span>
            </label>
            <div className="pg-quick-button-row mb-2">
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() =>
                  handleNumberChange("perUserLimitQty", "")
                }
              >
                제한 없음
              </button>
              {["1", "2", "3"].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="btn pg-quick-button"
                  onClick={() =>
                    handleNumberChange("perUserLimitQty", v)
                  }
                >
                  {v}박스
                </button>
              ))}
            </div>
            <div className="input-group mb-1">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="예) 2 (미입력 시 제한 없음)"
                value={form.perUserLimitQty}
                onChange={(e) =>
                  handleNumberChange("perUserLimitQty", e.target.value)
                }
              />
              <span className="input-group-text">박스</span>
            </div>
            <small className="text-muted">
              한 사람이 너무 많이 가져가는 걸 막고 싶을 때 사용합니다.
            </small>
          </div>
        </div>
      </section>

      {/* 5. 모집 기간 / 발송 예정일 */}
      <section className="pg-section-card">
        <div className="pg-section-title">
          <span className="pg-section-badge">5</span>
          <span>모집 기간과 발송 예정일</span>
        </div>

        <div className="row g-3 mb-3">
          {/* 모집 기간 */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              모집 기간{" "}
              <span className="text-danger fw-bold">★</span>
            </label>
            <div className="pg-quick-button-row mb-2">
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() => {
                  const today = new Date();
                  const yyyy = today.getFullYear();
                  const mm = String(today.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const dd = String(today.getDate()).padStart(2, "0");
                  const start = `${yyyy}-${mm}-${dd}`;
                  const endDate = new Date(
                    today.getTime() + 3 * 24 * 60 * 60 * 1000
                  );
                  const eyyyy = endDate.getFullYear();
                  const emm = String(
                    endDate.getMonth() + 1
                  ).padStart(2, "0");
                  const edd = String(endDate.getDate()).padStart(
                    2,
                    "0"
                  );
                  const end = `${eyyyy}-${emm}-${edd}`;
                  handleChange("startAt", start);
                  handleChange("endAt", end);
                }}
              >
                오늘부터 3일간
              </button>
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() => {
                  const today = new Date();
                  const yyyy = today.getFullYear();
                  const mm = String(today.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const dd = String(today.getDate()).padStart(2, "0");
                  const start = `${yyyy}-${mm}-${dd}`;
                  const endDate = new Date(
                    today.getTime() + 7 * 24 * 60 * 60 * 1000
                  );
                  const eyyyy = endDate.getFullYear();
                  const emm = String(
                    endDate.getMonth() + 1
                  ).padStart(2, "0");
                  const edd = String(endDate.getDate()).padStart(
                    2,
                    "0"
                  );
                  const end = `${eyyyy}-${emm}-${edd}`;
                  handleChange("startAt", start);
                  handleChange("endAt", end);
                }}
              >
                오늘부터 7일간
              </button>
            </div>
            <div className="input-group mb-1">
              <span className="input-group-text">시작</span>
              <input
                type="date"
                className="form-control"
                value={form.startAt}
                onChange={(e) =>
                  handleChange("startAt", e.target.value)
                }
              />
            </div>
            <div className="input-group mb-1">
              <span className="input-group-text">마감</span>
              <input
                type="date"
                className="form-control"
                value={form.endAt}
                onChange={(e) => handleChange("endAt", e.target.value)}
              />
            </div>
            <small className="text-muted">
              마감일 이후에는 더 이상 공동구매 참여가 불가능합니다.
            </small>
          </div>

          {/* 발송 예정일 */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              발송 예정일 <span className="text-muted">(선택)</span>
            </label>
            <div className="pg-quick-button-row mb-2">
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() => handleQuickShipping(3)}
              >
                마감 다음날부터 3일간 발송
              </button>
              <button
                type="button"
                className="btn pg-quick-button"
                onClick={() => handleQuickShipping(7)}
              >
                마감 다음날부터 7일간 발송
              </button>
            </div>
            <div className="input-group mb-1">
              <span className="input-group-text">시작</span>
              <input
                type="date"
                className="form-control"
                value={form.shippingStartDate}
                onChange={(e) =>
                  handleChange("shippingStartDate", e.target.value)
                }
              />
            </div>
            <div className="input-group mb-1">
              <span className="input-group-text">종료</span>
              <input
                type="date"
                className="form-control"
                value={form.shippingEndDate}
                onChange={(e) =>
                  handleChange("shippingEndDate", e.target.value)
                }
              />
            </div>
            <small className="text-muted">
              수확 및 날씨, 물류 사정에 따라 1~2일 정도 변동될 수 있습니다.
            </small>
          </div>
        </div>
      </section>

      {/* 제출 버튼 */}
      <section className="pg-footer">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div className="text-muted small">
            위 내용만 간단히 확인하신 후, 아래 버튼을 눌러 등록을
            완료해주세요.
          </div>
          <button
            type="button"
            className="btn pg-submit-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "등록 중..." : "공동구매 등록하기"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProducerGroupDealCreatePage;
