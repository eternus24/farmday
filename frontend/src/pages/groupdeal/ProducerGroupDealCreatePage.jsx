// 경로: frontend/src/pages/groupdeal/ProducerGroupDealCreatePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createGroupDeal,
  updateGroupDeal,
  uploadGroupDealImage,
  getGroupDealDetail,
} from "../../api/groupDealApi";

import { fetchRecentPriceByName } from "../../api/priceApi";

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

/* ----------------------
 * 상품 타입/템플릿 도우미
 * ---------------------- */

const PRODUCT_KEYWORDS = {
  fruit: [
    "사과",
    "배",
    "포도",
    "샤인머스캣",
    "딸기",
    "복숭아",
    "귤",
    "감",
    "참외",
    "수박",
    "멜론",
    "블루베리",
  ],
  root: ["고구마", "감자", "당근", "무", "우엉", "연근"],
  leaf: ["상추", "깻잎", "시금치", "배추", "케일", "열무"],
};

function detectProductType(name) {
  if (!name) return "generic";
  var lower = name.toLowerCase();

  var foundFruit = PRODUCT_KEYWORDS.fruit.some(function (k) {
    return lower.indexOf(k.toLowerCase()) !== -1;
  });
  if (foundFruit) return "fruit";

  var foundRoot = PRODUCT_KEYWORDS.root.some(function (k) {
    return lower.indexOf(k.toLowerCase()) !== -1;
  });
  if (foundRoot) return "root";

  var foundLeaf = PRODUCT_KEYWORDS.leaf.some(function (k) {
    return lower.indexOf(k.toLowerCase()) !== -1;
  });
  if (foundLeaf) return "leaf";

  return "generic";
}

var RECENT_TEMPLATE_KEY = "groupdeal_recent_detail_templates";

function safeGetLocalStorageItem(key) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSetLocalStorageItem(key, value) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch (e) {
    // ignore
  }
}

// 최근 문장 저장
function addRecentSentences(productType, detail) {
  if (!detail) return;

  var lines = detail
    .split("\n")
    .map(function (l) {
      return l.trim();
    })
    .filter(function (l) {
      return l.length >= 8 && l.length <= 80;
    });

  if (lines.length === 0) return;

  var raw = safeGetLocalStorageItem(RECENT_TEMPLATE_KEY);
  var data = raw ? JSON.parse(raw) : {};

  var existing = data[productType] || [];
  var mergedArr = lines.concat(existing);
  var dedupMap = {};
  var merged = [];

  for (var i = 0; i < mergedArr.length; i++) {
    var s = mergedArr[i];
    if (!dedupMap[s]) {
      dedupMap[s] = true;
      merged.push(s);
    }
    if (merged.length >= 8) break;
  }

  data[productType] = merged;
  safeSetLocalStorageItem(RECENT_TEMPLATE_KEY, JSON.stringify(data));
}

// 최근 문장 불러오기
function getRecentSentences(productType) {
  var raw = safeGetLocalStorageItem(RECENT_TEMPLATE_KEY);
  if (!raw) return [];
  try {
    var data = JSON.parse(raw);
    return data[productType] || [];
  } catch (e) {
    return [];
  }
}

// 템플릿 구성
function buildDescriptionTemplates(productName, productType, recentSentences) {
  var item = productName ? productName.trim() : "이 상품";

  var base = [
    {
      id: "taste-soft",
      label: "부드러운 식감",
      sentence: item + "은/는 부드럽고 먹기 좋은 식감입니다.",
    },
    {
      id: "fresh",
      label: "신선도 강조",
      sentence: "수확 후 빠르게 포장하여 신선한 상태로 보내드립니다.",
    },
  ];

  var byType = {
    fruit: [
      {
        id: "fruit-sweet",
        label: "당도 설명",
        sentence:
          "당도가 높아 달콤하게 드실 수 있는 " + item + "입니다.",
      },
      {
        id: "fruit-eat",
        label: "먹는 방법",
        sentence:
          "차갑게 보관 후 바로 드시면 가장 맛있는 " + item + "입니다.",
      },
    ],
    root: [
      {
        id: "root-texture",
        label: "조리용",
        sentence:
          item + "은/는 구워 먹거나 찌면 더욱 달달한 맛이 올라옵니다.",
      },
      {
        id: "root-storage",
        label: "보관 팁",
        sentence:
          "직사광선을 피하고 서늘한 곳에 두시면 오래 보관하실 수 있습니다.",
      },
    ],
    leaf: [
      {
        id: "leaf-fresh",
        label: "아삭아삭",
        sentence: item + "은/는 아삭아삭한 식감이 특징입니다.",
      },
      {
        id: "leaf-wash",
        label: "세척 안내",
        sentence:
          "드시기 전에 흐르는 물에 가볍게 한 번 씻어 드시는 것을 권장드립니다.",
      },
    ],
    generic: [],
  };

  var typeList = byType[productType] || [];

  var recent =
    (recentSentences || []).map(function (s, idx) {
      return {
        id: "recent-" + idx,
        label: "최근 사용 문장",
        sentence: s,
      };
    }) || [];

  return base.concat(typeList).concat(recent);
}

function ProducerGroupDealCreatePage() {
  const navigate = useNavigate();
  const { groupDealId } = useParams();
  const isEditMode = !!groupDealId;

  // 판매자가 직접 적는 제품명
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(isEditMode);

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

  // 최근 시세
  const [recentMarketPrice, setRecentMarketPrice] = useState(null);

  const discountRate = calcDiscountRate(form.originPrice, form.dealPrice);

  // 상품 타입 / 템플릿
  const productType = detectProductType(productName);

  const [recentTemplates, setRecentTemplates] = useState(function () {
    return getRecentSentences(productType);
  });

  // 음성 인식 상태
  const [isListening, setIsListening] = useState(false);

  useEffect(
    function () {
      setRecentTemplates(getRecentSentences(productType));
    },
    [productType]
  );

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(
    function () {
      if (!isEditMode || !groupDealId) return;

      async function loadGroupDeal() {
        try {
          setLoading(true);
          const data = await getGroupDealDetail(groupDealId);

          if (data) {
            setForm({
              title: data.title || "",
              subTitle: data.subTitle || "",
              detail: data.detail || "",
              originPrice: data.originPrice ? String(data.originPrice) : "",
              dealPrice: data.dealPrice ? String(data.dealPrice) : "",
              minMemberCount: data.minMemberCount
                ? String(data.minMemberCount)
                : "",
              maxMemberCount: data.maxMemberCount
                ? String(data.maxMemberCount)
                : "",
              perUserLimitQty: data.perUserLimitQty
                ? String(data.perUserLimitQty)
                : "",
              startAt: data.startAt ? data.startAt.slice(0, 10) : "",
              endAt: data.endAt ? data.endAt.slice(0, 10) : "",
              shippingStartDate: data.shippingStartDate
                ? data.shippingStartDate.slice(0, 10)
                : "",
              shippingEndDate: data.shippingEndDate
                ? data.shippingEndDate.slice(0, 10)
                : "",
              imageUrls: data.images ? data.images.map((img) => img.imageUrl) : [],
            });

            if (data.productId) {
              // 상품 정보는 별도로 불러와야 할 수도 있음
              // 일단 productId만 저장
            }
          }
        } catch (e) {
          console.error("공동구매 데이터 로드 오류:", e);
          window.alert("공동구매 정보를 불러오지 못했습니다.");
          navigate("/producer/seller-dashboard");
        } finally {
          setLoading(false);
        }
      }

      loadGroupDeal();
    },
    [isEditMode, groupDealId, navigate]
  );

  const descriptionTemplates = useMemo(
    function () {
      return buildDescriptionTemplates(
        productName,
        productType,
        recentTemplates
      );
    },
    [productName, productType, recentTemplates]
  );

  const handleChange = function (field, value) {
    setForm(function (prev) {
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleNumberChange = function (field, value) {
    const num = value.replace(/[^0-9]/g, "");
    setForm(function (prev) {
      return {
        ...prev,
        [field]: num,
      };
    });
  };

  const handleQuickMinCount = function (value) {
    setForm(function (prev) {
      return {
        ...prev,
        minMemberCount: String(value),
      };
    });
  };

  // 설명에 문장 추가
  const appendDetailSentence = function (sentence) {
    setForm(function (prev) {
      const current = prev.detail || "";
      if (current.indexOf(sentence) !== -1) return prev;

      const trimmed = current.replace(/\s+$/g, "");
      const prefix = trimmed.length > 0 ? trimmed + "\n" : "";
      return {
        ...prev,
        detail: prefix + sentence,
      };
    });
  };

  // 발송 예정일 빠른 설정 (모집 마감일 기준 N일)
  const handleQuickShipping = function (days) {
    if (!form.endAt) {
      window.alert("먼저 모집 마감일을 선택해주세요.");
      return;
    }
    const endDate = new Date(form.endAt);
    if (Number.isNaN(endDate.getTime())) {
      return;
    }

    const startDate = new Date(endDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    const shipEnd = new Date(
      startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000
    );

    const format = function (d) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return yyyy + "-" + mm + "-" + dd;
    };

    handleChange("shippingStartDate", format(startDate));
    handleChange("shippingEndDate", format(shipEnd));
  };

  /**
   * 이미지 업로드 (백엔드로 파일 전송 → imageUrl 응답 받아서 form.imageUrls에 추가)
   */
  const handleUploadImages = async function (event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadGroupDealImage(file);
        const imageUrl = result.imageUrl;
        newUrls.push(imageUrl);
      }

      setForm(function (prev) {
        return {
          ...prev,
          imageUrls: prev.imageUrls.concat(newUrls),
        };
      });
    } catch (e) {
      console.error(e);
      window.alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = function (index) {
    setForm(function (prev) {
      return {
        ...prev,
        imageUrls: prev.imageUrls.filter(function (_, i) {
          return i !== index;
        }),
      };
    });
  };

  // 🔍 최근 시세 불러오기 → 실제 가격 API 사용
  const handleSetRecentMarketPrice = async function () {
    if (!productName || productName.trim() === "") {
      window.alert("먼저 제품명(농산물 이름)을 입력해주세요.");
      return;
    }

    try {
      const card = await fetchRecentPriceByName(productName);

      if (!card) {
        window.alert(
          "입력하신 이름으로 오늘 시세를 찾지 못했습니다.\n" +
            "그래도 공동구매 가격만 입력하셔도 등록은 가능합니다."
        );
        return;
      }

      const market = Number(card.todayPrice) || 0;
      if (!market) {
        window.alert(
          "시세 데이터를 찾았지만 금액 정보가 없습니다.\n" +
            "잠시 후 다시 시도해 주세요."
        );
        return;
      }

      setRecentMarketPrice(market);
      setForm(function (prev) {
        return {
          ...prev,
          originPrice: String(market),
        };
      });
    } catch (e) {
      console.error(e);
      window.alert("시세를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const validateForm = function () {
    if (!productName || productName.trim() === "") {
      window.alert("판매하실 농산물 이름(제품명)을 입력해주세요.");
      return false;
    }
    if (!form.title || form.title.trim() === "") {
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
    if (!form.imageUrls || form.imageUrls.length === 0) {
      window.alert("최소 1장 이상의 이미지를 등록해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async function () {
    if (submitting) return;
    if (!validateForm()) return;

    const dto = {
      productId: null,
      title: form.title ? form.title.trim() : "",
      subTitle: form.subTitle ? form.subTitle.trim() : "",
      detail:
        (productName ? productName.trim() : "") +
        "\n\n" +
        (form.detail ? form.detail.trim() : ""),
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
      imageUrls: form.imageUrls,
    };

    try {
      setSubmitting(true);

      if (isEditMode) {
        await updateGroupDeal(groupDealId, dto);
        window.alert("공동구매가 수정되었습니다.");
        navigate(`/groupdeal/${groupDealId}/manage`);
      } else {
        await createGroupDeal(dto);
        // 사용자가 쓴 설명을 템플릿으로 저장
        addRecentSentences(productType, form.detail);
        window.alert("공동구매가 등록되었습니다.");
        navigate("/groupdeal");
      }
    } catch (e) {
      console.error(e);
      window.alert(
        e.message ||
          (isEditMode
            ? "공동구매 수정 중 오류가 발생했습니다."
            : "공동구매 등록 중 오류가 발생했습니다.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 🎤 음성 입력 시작
  const handleStartVoiceInput = function () {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        window.alert(
          "이 브라우저에서는 음성 입력을 지원하지 않습니다. 크롬 또는 최신 브라우저에서 이용해 주세요."
        );
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = function () {
        setIsListening(true);
      };

      recognition.onresult = function (event) {
        const text = event.results[0][0].transcript || "";
        if (!text) return;

        setForm(function (prev) {
          const current = prev.detail || "";
          const trimmed = current.replace(/\s+$/g, "");
          const prefix = trimmed.length > 0 ? trimmed + "\n" : "";
          return {
            ...prev,
            detail: prefix + text,
          };
        });
      };

      recognition.onerror = function (event) {
        console.error(event);
        window.alert("음성 인식 중 오류가 발생했습니다. 다시 시도해 주세요.");
      };

      recognition.onend = function () {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      window.alert("음성 인식 기능을 시작할 수 없습니다.");
      setIsListening(false);
    }
  };

  if (loading) {
    return (
      <div className="producer-groupdeal-page">
        <div className="pg-main-card">
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p>공동구매 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-groupdeal-page">
      <div className="pg-main-card">
        {/* 상단 안내 영역 */}
        <div className="pg-header">
          <div>
            <h2 className="pg-title">
              {isEditMode ? "공동구매 수정하기" : "공동구매 등록하기"}
            </h2>
            <p className="pg-subtitle">
              사진만 올려 주시고, 가격과 기간만 선택하셔도 등록이 됩니다.{" "}
              <span className="pg-required-mark">★ 표시</span>된 곳만 꼭
              채워 주세요.
            </p>
          </div>
        </div>

        {/* 1. 사진 올리기 */}
        <section className="pg-section-card">
          <div className="pg-section-title">
            <span className="pg-section-badge">1</span>
            <span>사진 올리기</span>
          </div>
          <p className="pg-section-sub">
            농장 사진이나 상품 사진을 최소 1장 이상 올려 주세요.
          </p>
          <div className="pg-section-body">
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
              <p className="pg-uploading-text">
                사진을 올리는 중입니다. 잠시만 기다려 주세요...
              </p>
            )}

            {form.imageUrls && form.imageUrls.length > 0 && (
              <div className="pg-image-grid">
                {form.imageUrls.map(function (url, idx) {
                  return (
                    <div className="pg-image-col" key={url + idx}>
                      <div
                        className="pg-image-card position-relative"
                        style={{
                          border:
                            idx === 0
                              ? "2px solid #00c853"
                              : "1px solid #e5e7eb",
                        }}
                      >
                        <img
                          src={url}
                          alt={"이미지" + (idx + 1)}
                          className="pg-image-thumb"
                        />
                        {idx === 0 && (
                          <span className="badge pg-image-main-badge">
                            대표
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-light pg-image-remove-btn"
                          onClick={function () {
                            handleRemoveImage(idx);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 2. 농산물 정보 */}
        <section className="pg-section-card">
          <div className="pg-section-title">
            <span className="pg-section-badge">2</span>
            <span>농산물 정보</span>
          </div>

          <div className="pg-section-body">
            {/* 제품명 */}
            <div className="mb-4">
              <label className="pg-label">
                제품명(농산물 이름){" "}
                <span className="text-danger fw-bold">★</span>
              </label>
              <input
                type="text"
                className="pg-input-lg"
                placeholder="예) 꿀고구마, 샤인머스캣, 햇사과 5kg"
                value={productName}
                onChange={function (e) {
                  var value = e.target.value;
                  setProductName(value);

                  if (!form.title || form.title.trim() === "") {
                    handleChange("title", value.trim() + " 공동구매");
                  }
                }}
              />
              <div className="pg-hint">
                농산물 이름만 적어 주셔도 제목과 설명에 자동으로 활용됩니다.
              </div>
            </div>

            {/* 공동구매 제목 */}
            <div className="mb-4">
              <label className="pg-label">
                공동구매 제목 <span className="text-danger fw-bold">★</span>
              </label>

              {productName && productName.trim() !== "" && (
                <div className="pg-suggest-box">
                  <div className="pg-hint-small">
                    아래 추천 제목 중 하나를 눌러 자동으로 채우실 수 있어요.
                  </div>
                  <div className="pg-suggest-list">
                    {[
                      productName + " 공동구매",
                      "산지직송 " + productName,
                      "올해 햇 " + productName + " 특가",
                    ].map(function (txt) {
                      return (
                        <button
                          key={txt}
                          type="button"
                          className="pg-suggest-btn"
                          onClick={function () {
                            handleChange("title", txt);
                          }}
                        >
                          {txt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <input
                type="text"
                className="pg-input-lg"
                value={form.title}
                onChange={function (e) {
                  handleChange("title", e.target.value);
                }}
              />
            </div>

            {/* 한 줄 소개 */}
            <div className="mb-3">
              <label className="pg-label">한 줄 소개</label>
              <input
                type="text"
                className="pg-input"
                placeholder="예) 달콤한 맛의 농산물을 산지에서 바로 보내드립니다."
                value={form.subTitle}
                onChange={function (e) {
                  handleChange("subTitle", e.target.value);
                }}
              />
            </div>

            {/* 상품 설명 도우미 + 자동 문장 */}
            <div className="pg-helper-box">
              <div className="pg-helper-title">
                ✍️ 문장 만들기 도우미{" "}
                {productName && productName.trim() !== "" && (
                  <span className="pg-helper-badge">
                    {productName} 관련 문장
                  </span>
                )}
              </div>

              <div className="pg-tag-row">
                {descriptionTemplates.map(function (tpl) {
                  return (
                    <button
                      key={tpl.id + tpl.sentence}
                      type="button"
                      className="pg-tag-btn"
                      onClick={function () {
                        appendDetailSentence(tpl.sentence);
                      }}
                    >
                      {tpl.label}
                    </button>
                  );
                })}
              </div>

              {recentTemplates && recentTemplates.length > 0 && (
                <div className="pg-helper-sub">
                  최근에 자주 사용하신 설명 문장도 함께 보여드리고 있어요.
                </div>
              )}
            </div>

            {/* 설명 입력 + 음성 입력 + 미리보기 */}
            <div className="mb-2">
              <div className="pg-detail-header">
                <label className="pg-label mb-0">상품 설명</label>
                <button
                  type="button"
                  className="pg-voice-btn"
                  onClick={handleStartVoiceInput}
                >
                  <span className="pg-voice-btn-icon">🎤</span>
                  <span>{isListening ? "듣는 중..." : "말해서 설명 쓰기"}</span>
                </button>
              </div>
              {isListening && (
                <div className="pg-voice-status">
                  지금 말씀해 주세요. 잠시 후 자동으로 글로 입력됩니다.
                </div>
              )}
            </div>

            <textarea
              className="pg-textarea"
              rows={4}
              placeholder="버튼을 눌러 문장을 넣고, 필요한 부분만 고쳐서 사용하셔도 됩니다. 음성 입력 버튼을 눌러 말로 작성하실 수도 있어요."
              value={form.detail}
              onChange={function (e) {
                handleChange("detail", e.target.value);
              }}
            />

            <div className="pg-detail-preview-box">
              <div className="pg-detail-preview-title">
                ✨ 이렇게 고객에게 보여집니다
              </div>
              <div className="pg-detail-preview-text">
                {form.detail && form.detail.trim().length > 0
                  ? form.detail
                  : "작성하신 설명이 여기에 미리보기로 표시됩니다."}
              </div>
            </div>
          </div>
        </section>

        {/* 3. 가격 설정 */}
        <section className="pg-section-card">
          <div className="pg-section-title">
            <span className="pg-section-badge">3</span>
            <span>가격 설정</span>
          </div>

          <div className="pg-section-body">
            <div className="row g-3 mb-3">
              {/* 공동구매 가격 */}
              <div className="col-12 col-md-6">
                <label className="pg-label">
                  공동구매 가격
                  <span className="text-danger fw-bold"> ★</span>
                </label>
                <div className="pg-price-choice-row mb-2">
                  {[20000, 25000, 30000].map(function (v) {
                    return (
                      <button
                        key={v}
                        type="button"
                        className="pg-price-option"
                        onClick={function () {
                          handleNumberChange("dealPrice", String(v));
                        }}
                      >
                        {formatNumber(v)}원
                      </button>
                    );
                  })}
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg pg-input-lg"
                    placeholder="예) 25000"
                    value={form.dealPrice}
                    onChange={function (e) {
                      handleNumberChange("dealPrice", e.target.value);
                    }}
                  />
                  <span className="input-group-text pg-unit-box">원</span>
                </div>
              </div>

              {/* 시세 */}
              <div className="col-12 col-md-6">
                <label className="pg-label">원래 판매 가격</label>
                <div className="pg-price-helper-row mb-2">
                  <button
                    type="button"
                    className="pg-price-helper"
                    onClick={handleSetRecentMarketPrice}
                  >
                    최근 시세 불러오기
                  </button>
                </div>
                <div className="input-group mb-1">
                  <input
                    type="text"
                    className="form-control form-control-lg pg-input-lg"
                    placeholder="예) 30000"
                    value={form.originPrice}
                    onChange={function (e) {
                      handleNumberChange("originPrice", e.target.value);
                    }}
                  />
                  <span className="input-group-text pg-unit-box">원</span>
                </div>
                {recentMarketPrice && (
                  <div className="pg-hint-small">
                   시세 : 최근 소매 평균 약{" "}
                    {formatNumber(recentMarketPrice)}원
                  </div>
                )}
              </div>
            </div>

            {/* 가격 비교 가이드 */}
            <div className="pg-guide-box">
              <div className="pg-guide-title">가격 가이드</div>
              <div className="pg-guide-text">
                {form.originPrice &&
                form.dealPrice &&
                discountRate != null ? (
                  <span>
                    원래 가격{" "}
                    <strong>{formatNumber(form.originPrice)}원</strong> 대비{" "}
                    <strong>
                      약 {Math.abs(discountRate)}%{" "}
                      {discountRate > 0 ? "할인" : "할증"}
                    </strong>
                    으로 판매하시게 됩니다.
                  </span>
                ) : (
                  <span>
                    시세와 공동구매 가격을 입력하시면 할인율을 한눈에 보실 수
                    있습니다.
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. 수량 설정 */}
        <section className="pg-section-card">
          <div className="pg-section-title">
            <span className="pg-section-badge">4</span>
            <span>수량 설정</span>
          </div>

          <div className="pg-section-body">
            <div className="pg-quantity-grid">
              {/* 최소 모집 수량 */}
              <div className="pg-quantity-box">
                <div className="pg-quantity-title">
                  최소 모집 수량{" "}
                  <span className="text-danger fw-bold">★</span>
                </div>
                <div className="pg-quick-button-row mb-2">
                  {[10, 30, 50, 100].map(function (v) {
                    return (
                      <button
                        key={v}
                        type="button"
                        className="pg-quick-button"
                        onClick={function () {
                          handleQuickMinCount(v);
                        }}
                      >
                        {v}박스
                      </button>
                    );
                  })}
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg pg-input-lg"
                    placeholder="예) 50"
                    value={form.minMemberCount}
                    onChange={function (e) {
                      handleNumberChange("minMemberCount", e.target.value);
                    }}
                  />
                  <span className="input-group-text pg-unit-box">
                    박스 이상
                  </span>
                </div>
                <div className="pg-quantity-help">
                  이 수량 이상 모이면 출하를 진행합니다.
                </div>
              </div>

              {/* 최대 수량 */}
              <div className="pg-quantity-box">
                <div className="pg-quantity-title">
                  최대 수량 <span className="text-muted">(선택)</span>
                </div>
                <div className="pg-quick-button-row mb-2">
                  <button
                    type="button"
                    className="pg-quick-button"
                    onClick={function () {
                      handleNumberChange("maxMemberCount", "");
                    }}
                  >
                    제한 없음
                  </button>
                  {["50", "100", "200"].map(function (v) {
                    return (
                      <button
                        key={v}
                        type="button"
                        className="pg-quick-button"
                        onClick={function () {
                          handleNumberChange("maxMemberCount", v);
                        }}
                      >
                        {v}박스
                      </button>
                    );
                  })}
                </div>
                <div className="input-group mb-1">
                  <input
                    type="text"
                    className="form-control form-control-lg pg-input-lg"
                    placeholder="예) 100 (미입력 시 제한 없음)"
                    value={form.maxMemberCount}
                    onChange={function (e) {
                      handleNumberChange("maxMemberCount", e.target.value);
                    }}
                  />
                  <span className="input-group-text pg-unit-box">
                    박스까지
                  </span>
                </div>
                <div className="pg-quantity-help">
                  너무 많이 모이면 힘드신 경우에만 입력해 주세요.
                </div>
              </div>

              {/* 1인당 제한 수량 */}
              <div className="pg-quantity-box">
                <div className="pg-quantity-title">
                  1인당 제한 수량{" "}
                  <span className="text-muted">(선택)</span>
                </div>
                <div className="pg-quick-button-row mb-2">
                  <button
                    type="button"
                    className="pg-quick-button"
                    onClick={function () {
                      handleNumberChange("perUserLimitQty", "");
                    }}
                  >
                    제한 없음
                  </button>
                  {["1", "2", "3"].map(function (v) {
                    return (
                      <button
                        key={v}
                        type="button"
                        className="pg-quick-button"
                        onClick={function () {
                          handleNumberChange("perUserLimitQty", v);
                        }}
                      >
                        {v}박스
                      </button>
                    );
                  })}
                </div>
                <div className="input-group mb-1">
                  <input
                    type="text"
                    className="form-control form-control-lg pg-input-lg"
                    placeholder="예) 2 (미입력 시 제한 없음)"
                    value={form.perUserLimitQty}
                    onChange={function (e) {
                      handleNumberChange("perUserLimitQty", e.target.value);
                    }}
                  />
                  <span className="input-group-text pg-unit-box">박스</span>
                </div>
                <div className="pg-quantity-help">
                  한 분이 너무 많이 가져가는 것을 막고 싶을 때 사용합니다.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 모집 기간과 발송 예정일 */}
        <section className="pg-section-card">
          <div className="pg-section-title">
            <span className="pg-section-badge">5</span>
            <span>모집 기간과 발송 예정일</span>
          </div>

          <div className="pg-section-body">
            <div className="row g-3 mb-3">
              {/* 모집 기간 */}
              <div className="col-12 col-md-6">
                <label className="pg-label">
                  모집 기간 <span className="text-danger fw-bold">★</span>
                </label>
                <div className="pg-quick-button-row mb-2">
                  <button
                    type="button"
                    className="pg-quick-button"
                    onClick={function () {
                      const today = new Date();
                      const yyyy = today.getFullYear();
                      const mm = String(today.getMonth() + 1).padStart(2, "0");
                      const dd = String(today.getDate()).padStart(2, "0");
                      const start = yyyy + "-" + mm + "-" + dd;
                      const endDate = new Date(
                        today.getTime() + 3 * 24 * 60 * 60 * 1000
                      );
                      const eyyyy = endDate.getFullYear();
                      const emm = String(endDate.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const edd = String(endDate.getDate()).padStart(2, "0");
                      const end = eyyyy + "-" + emm + "-" + edd;
                      handleChange("startAt", start);
                      handleChange("endAt", end);
                    }}
                  >
                    오늘부터 3일간
                  </button>
                  <button
                    type="button"
                    className="pg-quick-button"
                    onClick={function () {
                      const today = new Date();
                      const yyyy = today.getFullYear();
                      const mm = String(today.getMonth() + 1).padStart(2, "0");
                      const dd = String(today.getDate()).padStart(2, "0");
                      const start = yyyy + "-" + mm + "-" + dd;
                      const endDate = new Date(
                        today.getTime() + 7 * 24 * 60 * 60 * 1000
                      );
                      const eyyyy = endDate.getFullYear();
                      const emm = String(endDate.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const edd = String(endDate.getDate()).padStart(2, "0");
                      const end = eyyyy + "-" + emm + "-" + edd;
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
                    onChange={function (e) {
                      handleChange("startAt", e.target.value);
                    }}
                  />
                </div>
                <div className="input-group mb-1">
                  <span className="input-group-text">마감</span>
                  <input
                    type="date"
                    className="form-control"
                    value={form.endAt}
                    onChange={function (e) {
                      handleChange("endAt", e.target.value);
                    }}
                  />
                </div>
                <div className="pg-hint-small">
                  마감일 이후에는 더 이상 공동구매 참여가 불가능합니다.
                </div>
              </div>

              {/* 발송 예정일 */}
              <div className="col-12 col-md-6">
                <label className="pg-label">
                  발송 예정일 <span className="text-muted">(선택)</span>
                </label>
                <div className="pg-quick-button-row mb-2">
                  <button
                    type="button"
                    className="pg-quick-button"
                    onClick={function () {
                      handleQuickShipping(3);
                    }}
                  >
                    마감 다음날부터 3일간 발송
                  </button>
                  <button
                    type="button"
                    className="pg-quick-button"
                    onClick={function () {
                      handleQuickShipping(7);
                    }}
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
                    onChange={function (e) {
                      handleChange("shippingStartDate", e.target.value);
                    }}
                  />
                </div>
                <div className="input-group mb-1">
                  <span className="input-group-text">종료</span>
                  <input
                    type="date"
                    className="form-control"
                    value={form.shippingEndDate}
                    onChange={function (e) {
                      handleChange("shippingEndDate", e.target.value);
                    }}
                  />
                </div>
                <div className="pg-hint-small">
                  수확, 날씨, 물류 사정에 따라 1~2일 정도 변동될 수 있습니다.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ☎️ 전화 안내 배너 */}
        <section className="pg-call-banner">
          <div className="pg-call-text">
            <span className="pg-call-tag">도움이 필요하신가요?</span>
            <h3 className="pg-call-title">전화 한 통이면 등록이 더 편해집니다.</h3>
            <p className="pg-call-desc">
              어려우시면 그냥 전화 주세요. 팜데이 담당자가 순서대로 안내해
              드립니다.
            </p>
          </div>

          {/* 👉 href 안의 번호만 실제 상담 번호로 바꾸면 바로 전화 연결됨 */}
          <a href="tel:010-1234-5678" className="pg-call-button">
            <span className="pg-call-icon" aria-hidden="true">
              ☎️
            </span>
            <span className="pg-call-label">
              010-1234-5678
              <br />
              <small>지금 바로 전화하기</small>
            </span>
          </a>
        </section>

        {/* 제출 버튼 */}
        <section className="pg-footer">
          <div className="pg-footer-inner">
            <div className="pg-footer-text">
              위 내용만 한 번 확인하시고, 아래 버튼을 누르시면{" "}
              {isEditMode ? "수정이" : "등록이"} 완료됩니다.
            </div>
            <button
              type="button"
              className="pg-submit-button"
              onClick={handleSubmit}
              disabled={submitting || loading}
            >
              {submitting
                ? isEditMode
                  ? "수정 중..."
                  : "등록 중..."
                : isEditMode
                ? "공동구매 수정하기"
                : "공동구매 등록하기"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProducerGroupDealCreatePage;