import { NavLink } from "react-router-dom";

export default function MypageEachMyReview({ rv, formatKoreanDateTime }) {

  // 수정: 소수점/문자/undefined 모두 안전 처리
  const rawRating = Number(rv?.rating);
  const ratingValue = Number.isFinite(rawRating)
    ? Math.max(0, Math.min(5, rawRating))
    : 0;

  // 수정: 별 모양은 정수 기준으로만 표시
  const ratingInt = Math.floor(ratingValue);
  const stars = "⭐".repeat(ratingInt) + "☆".repeat(5 - ratingInt);

  const ratingText = Number.isInteger(ratingValue) 
    ? `${ratingValue}/5` 
    : `${ratingValue.toFixed(1)}/5`;

  // 수정: toss_orderid 안전 처리
  const safeOrderNo = (rv?.toss_orderid ?? "").replaceAll("order-", "");

  return (
    <div key={rv.review_id} className="order-box">
      {/* 수정: 상단 영역 정리 */}
      <div className="d-flex justify-content-between align-items-center">
        <span className="order-date-span">
          {formatKoreanDateTime(rv.created_date)}
        </span>

        {/* 수정: 주문번호 스타일/안전 처리 */}
        <span className="small text-muted">
          주문번호 {safeOrderNo || "-"}
        </span>
      </div>

      {/* 수정: 본문 레이아웃 정리 */}
      <div className="d-flex align-items-start mt-3 gap-3">
        <NavLink to={`/shop/detail/${rv.product_id}`}>
          {/* 수정: alt 추가 */}
          <img
            src={rv.main_image}
            alt={rv.name ?? "product"}
            className="orders-thumbnail-img"
            style={{height:'80px',width:'80px'}}
          />
        </NavLink>

        <div className="orders-thumbnail-detail flex-grow-1" style={{marginLeft:'5px'}}>
          {/* 수정: 상품명/별점/제목/내용을 구분해서 배치 */}
          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="fw-semibold" style={{ fontSize: "1.02rem",color:"#8d8d8dff" }}>
                {rv.name}
              </div>

              {/* 추가: 별점 시각화 + 숫자 배지 */}
              <div className="d-flex align-items-center gap-2">
                <span className="small" aria-label={`별점 ${ratingText}점`}>
                  {stars}
                </span>
                <span className="badge bg-light text-dark">
                  {ratingText}
                </span>
              </div>
            </div>

            <div className="review-title">
              {rv.title || "-"}
            </div>

            <div className="review-content">
              {rv.content || "-"}
            </div>

            {/* 추가: 판매자 답글이 있을 때만 표시 */}
            {rv?.reply && (
              <div
                className="border rounded-3 p-2 mt-1"
                style={{ background: "#fafbfe" }}
              >
                <div className="small text-muted mb-1">
                  판매자 답글
                </div>
                <div className="small">
                  {rv.reply}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
