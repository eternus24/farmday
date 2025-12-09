import { Link, NavLink } from "react-router-dom";
import MypageEachOrdersItem from "./MypageEachOrdersItem";

export default function MypageEachOrders({od,formatKoreanDateTime,moneyKRW,handleToggleOrderDetails,openOrderId,ordersItem,handleOpenCancelModal,confirmOrder,refundRequest,handleOpenDeliveryModal,handleOpenOrderDetail}) {

  const imgList = od.orders_img_list || [];
  // 예시: 대표 이미지 + 나머지 이미지 썸네일
  const mainImg = imgList[0];           // 첫 번째 이미지를 대표로
  const subImgs = imgList.slice(1);     // 나머지

  return (
    <div key={od.order_id} className="order-box">

      

      <div className="d-flex justify-content-between align-items-center">
        
        <span className="order-date-span">
          {formatKoreanDateTime(od.order_date)}
        </span>
        <span className="me-2">
          주문번호 {od.toss_orderid.replaceAll('order-','')}
        </span>
          
      </div>

      <div className="d-flex align-items-center mt-3">

        {/* <NavLink to={`/shop/detail/${od.thumbnail_id}`}>
          <img src={od.thumbnail_img} className={`orders-thumbnail-img`}/>
        </NavLink> */}

        <div class="order-images-spread-container">
          {imgList.map((img) => (
            <div>
              <img src={img.main_image} className="order-images-spread-img"/>
            </div>
          ))}
        </div>
        
        
        <div className="orders-thumbnail-detail">
          {/* ✨🛠️ 수정: 텍스트 나열 → 제목 + 금액 요약 카드 구조 */}
          <div className="d-flex flex-column gap-2" style={{width:'460px'}}>

            {/* ✨🛠️ 수정: 상품명 라인 강조 + 건수 배지 */}
            <div className="d-flex align-items-center justify-content-between">
              <div className="fw-semibold" style={{ fontSize: "1.02rem", fontWeight:"600" }}>
                {od.thumbnail_name}
              </div>
              <span className="badge bg-light text-dark">
                {od.order_amount === 1 ? "단일 상품" : `외 ${od.order_amount - 1}건`}
              </span>
            </div>

            {/* ✨🛠️ 수정: 금액 요약을 카드처럼 */}
            <div
              className="border rounded-3 p-3"
              style={{ background: "#fafbfe" }}
            >
              {/* ✨🛠️ 수정: 라벨 좌 / 값 우 정렬 */}
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">결제 금액</span>
                <span className="fw-semibold">
                  {moneyKRW(od.product_total_amount)}
                </span>
              </div>

              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">할인 금액</span>
                <span className="fw-semibold text-primary">
                  -{moneyKRW(od.discount_amount + od.used_points)}
                </span>
              </div>

              <div style={{ borderTop: "1px dashed #e2e6ee", margin: "8px 0" }} />

              {/* ✨🛠️ 수정: 총 결제금액은 더 강조 */}
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  총 결제금액 
                  {od.shipping_fee>0 && (
                    <> (배송비 포함)</>
                  )}
                  
                </span>
                <span className="fw-bold" style={{ fontSize: "1.05rem", color: "#222" }}>
                  {moneyKRW(od.order_total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        
        
        
      </div>

      <Link
        to="#"
        
        onClick={(e) => {
          e.preventDefault();
          handleToggleOrderDetails(od.order_id);
        }}
      >
        <div className="toggle-btn">
          {openOrderId === od.order_id
          ? "▲"
          : "▼"}
        </div>
        
      </Link>
      

      {/* 🔽 주문 상세 영역: 토글된 주문의 ordersItem을 출력 */}
      {openOrderId === od.order_id && (
        <div className="mt-3 border-top mb-5 order-detail-animate">
          {ordersItem.length === 0 ? (
            <div className="small text-muted">
              주문 상품 정보를 불러오는 중입니다…
            </div>
          ) : (
            <div className="vstack gap-2">
              {/* 아이템 리스트 */}
              {ordersItem.map((item) => (
                <MypageEachOrdersItem
                  item={item} moneyKRW={moneyKRW} handleOpenCancelModal={handleOpenCancelModal} confirmOrder={confirmOrder} refundRequest={refundRequest} handleOpenDeliveryModal={handleOpenDeliveryModal} handleOpenOrderDetail={handleOpenOrderDetail}
                />
              ))}
                
            </div>
          )}
        </div>
      )}
    </div>
  )

}