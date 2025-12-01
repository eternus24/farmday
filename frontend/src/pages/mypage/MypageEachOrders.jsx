import { Link, NavLink } from "react-router-dom";
import MypageEachOrdersItem from "./MypageEachOrdersItem";

export default function MypageEachOrders({od,formatKoreanDateTime,moneyKRW,handleToggleOrderDetails,openOrderId,ordersItem,handleOpenCancelModal,confirmOrder,refundRequest,handleOpenDeliveryModal}) {

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
        <NavLink to={`/shop/detail/${od.thumbnail_id}`}>
          <img src={od.thumbnail_img} className={`orders-thumbnail-img`}/>
        </NavLink>
        
        <div className="orders-thumbnail-detail">
          <div className="fw-semibold">
            {
              od.order_amount === 1 ?
              `상품명 : ${od.thumbnail_name}`
              : 
              `상품명 : ${od.thumbnail_name} 외 ${od.order_amount-1}건`
            }
            
            <br/><br/>
            결제 금액 : {moneyKRW(od.product_total_amount)}
            <br/>
            할인 금액 : {moneyKRW(od.discount_amount+od.used_points)}
            <br/>
            총 결제금액 : {moneyKRW(od.order_total_amount)}
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
        <div className="mt-3 border-top pt-3">
          {ordersItem.length === 0 ? (
            <div className="small text-muted">
              주문 상품 정보를 불러오는 중입니다…
            </div>
          ) : (
            <div className="vstack gap-2">
              {/* 아이템 리스트 */}
              {ordersItem.map((item) => (
                <MypageEachOrdersItem
                  item={item} moneyKRW={moneyKRW} handleOpenCancelModal={handleOpenCancelModal} confirmOrder={confirmOrder} refundRequest={refundRequest} handleOpenDeliveryModal={handleOpenDeliveryModal}
                />
              ))}
                
            </div>
          )}
        </div>
      )}
    </div>
  )

}