import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import MypageEachGroupDeal from "./MypageEachGroupDeal";

const PAGE_SIZE = 5;
const PAGE_WINDOW = 5;

export default function MypageGroupDeal({months,setMonths,searchInput,setSearchInput,setQuery,status,userOrders,getUserOrders,emptyText,formatKoreanDateTime,handleToggleOrderDetails,openOrderId,moneyKRW,handleOpenCancelModal,ordersItem,confirmOrder,refundRequest,handleOpenGroupDealDeliveryModal,API_BASE}) {

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [userOrders.length]);

  // 🆕 전체 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(userOrders.length / PAGE_SIZE));

  // 🆕 현재 페이지가 전체 페이지 수를 넘어가지 않도록 보정
  const safePage = Math.min(currentPage, totalPages);

  // 🆕 현재 페이지에 보여줄 주문들 잘라내기
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pagedOrders = userOrders.slice(startIndex, endIndex);

  // 🆕 1~5, 6~10 식으로 페이지 번호 묶음 계산
  const startPage = Math.floor((safePage - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1;
  const endPage = Math.min(totalPages, startPage + PAGE_WINDOW - 1);
  const pageNumbers = [];
  for (let p = startPage; p <= endPage; p += 1) {
    pageNumbers.push(p);
  }

  return (
    <section className="col-lg-8">
      <div className="border rounded-3 bg-white p-4">
        {/* 타이틀 + 필터 */}
        <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center">
          <h5 className="mb-0">공동구매 참여 내역</h5>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              aria-label="기간 선택"
              style={{ width: 120 }}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              <option value={3}>3개월</option>
              <option value={6}>6개월</option>
              <option value={12}>1년</option>
            </select>
            <div
              className="input-group input-group-sm"
              style={{ width: 260 }}
            >
              <input
                className="form-control"
                placeholder="상품명으로 검색해보세요"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="주문 검색"
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuery(searchInput.trim())}
                aria-label="검색"
              >
                <i className="fa fa-search" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="mt-4">
          {status === "loading" && (
            <div className="py-5 text-center text-muted">
              주문 내역을 불러오는 중…
            </div>
          )}

          {status === "error" && userOrders.length === 0 && (
            <div className="py-5 text-center">
              <div className="mb-2">
                주문 내역을 불러오지 못했습니다.
              </div>
              <button
                className="btn btn-outline-secondary rounded-pill"
                onClick={() => {
                  const ac = new AbortController();
                  getUserOrders(ac.signal);
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {status !== "loading" && userOrders.length === 0 && (
            <div className="text-center py-5">
              <div
                className="mx-auto mb-3"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: "#f2f3f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
                aria-hidden="true"
              >
                🧾
              </div>
              <div className="mb-2">{emptyText}</div>
              <Link
                to="/best"
                className="btn btn-outline-secondary rounded-pill"
              >
                베스트 상품 보기
              </Link>
            </div>
          )}

          {userOrders.length > 0 && (
            <div className="vstack gap-3">
              {pagedOrders.map((od) => (
                <MypageEachGroupDeal
                  od={od} formatKoreanDateTime={formatKoreanDateTime} moneyKRW={moneyKRW} handleToggleOrderDetails={handleToggleOrderDetails} openOrderId={openOrderId} ordersItem={ordersItem} handleOpenCancelModal={handleOpenCancelModal} confirmOrder={confirmOrder} refundRequest={refundRequest} handleOpenGroupDealDeliveryModal={handleOpenGroupDealDeliveryModal} API_BASE={API_BASE}
                />
              ))}
            </div>
          )}

          {/* 🆕 페이지네이션 (주문이 6개 이상일 때부터 표시) */}
          {userOrders.length > 0 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center mb-0 mypage-pagination">

                {/* 이전 페이지 버튼 */}
                <li className={`page-item ${safePage <= 1 ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => {
                      if (safePage > 1) {
                        setCurrentPage(safePage - 1);
                      }
                    }}
                  >
                    &lt;
                  </button>
                </li>

                {/* 1~5, 6~10 처럼 최대 5개까지 숫자 표시 */}
                {pageNumbers.map((p) => (
                  <li
                    key={p}
                    className={`page-item ${safePage === p ? "active" : ""}`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  </li>
                ))}

                {/* 다음 페이지 버튼 */}
                <li className={`page-item ${safePage >= totalPages ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => {
                      if (safePage < totalPages) {
                        setCurrentPage(safePage + 1);
                      }
                    }}
                  >
                    &gt;
                  </button>
                </li>
              </ul>
            </nav>
          )}


        </div>
      </div>
    </section>
  )

}