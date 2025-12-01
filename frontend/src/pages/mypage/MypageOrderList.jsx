import { Link, NavLink } from "react-router-dom";
import MypageEachOrders from "./MypageEachOrders";

export default function MypageOrderList({months,setMonths,searchInput,setSearchInput,setQuery,status,userOrders,getUserOrders,emptyText,formatKoreanDateTime,handleToggleOrderDetails,openOrderId,moneyKRW,handleOpenCancelModal,ordersItem,confirmOrder,refundRequest,handleOpenDeliveryModal}) {

  return (
    <section className="col-lg-8">
      <div className="border rounded-3 bg-white p-4">
        {/* 타이틀 + 필터 */}
        <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center">
          <h5 className="mb-0">주문 내역</h5>
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
              {userOrders.map((od) => (
                <MypageEachOrders
                  od={od} formatKoreanDateTime={formatKoreanDateTime} moneyKRW={moneyKRW} handleToggleOrderDetails={handleToggleOrderDetails} openOrderId={openOrderId} ordersItem={ordersItem} handleOpenCancelModal={handleOpenCancelModal} confirmOrder={confirmOrder} refundRequest={refundRequest} handleOpenDeliveryModal={handleOpenDeliveryModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )

}