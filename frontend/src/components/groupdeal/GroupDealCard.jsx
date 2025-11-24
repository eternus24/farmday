// src/components/groupdeal/GroupDealCard.jsx
import { Link } from 'react-router-dom';

export default function GroupDealCard({ deal }) {
  const {
    groupDealId,
    productName,
    region,
    originPrice,
    dealPrice,
    discountRate,
    rating,
    reviewCount,
    imageUrl, // 🔹 백엔드에서 오는 이미지 URL
  } = deal;

  const discountPercent = discountRate ? `${discountRate}%` : '';
  const formattedOrigin = originPrice?.toLocaleString();
  const formattedDeal = dealPrice?.toLocaleString();

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <Link
        to={`/groupdeal/${groupDealId}`}
        className="text-decoration-none text-dark"
      >
        <div className="border rounded h-100 overflow-hidden bg-white shadow-sm">
          {/* 🔹 이미지 영역 (정사각형) */}
          <div className="position-relative">
            <div className="ratio ratio-1x1 bg-light d-flex align-items-center justify-content-center">
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="small text-primary"
                style={{ wordBreak: "break-all" }}
              >
                {imageUrl}
              </a>
            </div>

            {discountPercent && (
              <div
                className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-danger text-white small rounded"
                style={{ fontWeight: '600' }}
              >
                🔥 {discountPercent} SALE
              </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="p-3">
            <div className="fw-semibold">{productName}</div>
            <div className="text-muted small mb-2">{region}</div>

            <div className="mb-1">
              <span className="fw-bold fs-5">{formattedDeal}원</span>
            </div>
            <div className="text-muted small">
              <span className="text-decoration-line-through me-2">
                {formattedOrigin}원
              </span>
              {originPrice && dealPrice && (
                <span>{(originPrice - dealPrice).toLocaleString()}원 ↓</span>
              )}
            </div>

            <div className="mt-2 text-muted small">
              ⭐ {rating ?? '-'} ({reviewCount ?? 0})
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
