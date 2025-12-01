import { NavLink } from "react-router-dom";

export default function MypageEachCanceledOrder({co,formatKoreanDateTime,moneyKRW}) {

  return (
    // <div key={co.orders_canceled_id} className="order-box">
    //   <div className="d-flex justify-content-between align-items-center">
        
    //     <span className="order-date-span">
    //       {formatKoreanDateTime(co.order_created_date)}
    //     </span>
    //     <span className="me-2">
    //       주문번호 {co.toss_orderid.replaceAll('order-','')}
    //     </span>
          
    //   </div>

    //   <div className="d-flex align-items-center mt-3">
    //     <NavLink to={`/shop/detail/${co.product_id}`}>
    //       <img src={co.main_image} className={`orders-canceled-img`}/>
    //     </NavLink>
        
    //     <div className="orders-thumbnail-detail">
    //       <div className="fw-semibold">
            
    //         스토어명 : {co.store_name}
    //         <br/>
            
    //         상품명 : {co.name}
    //         <br/>
    //         <br/>
    //         수량 : {co.quantity}
    //         <br/>
    //         가격 : {co.price_at_order}
    //       </div>
    //     </div>
        
        
        
    //   </div>

      
    // </div>
    <div key={co.orders_canceled_id} className="order-canceled-box">
      <div className="d-flex justify-content-between align-items-center">
        
         <span className="order-date-span">
           {formatKoreanDateTime(co.order_created_date)}
         </span>
         <span className="me-2">
          주문번호 {co.toss_orderid.replaceAll('order-','')}
         </span>
          
      </div>
      <div className="d-flex align-items-center mt-3">
        <NavLink to={`/shop/detail/${co.product_id}`}>
          <img src={co.main_image} alt={co.name} className={`orders-canceled-img`}/>
        </NavLink>
        <div className="orders-item-detail">

          <div className="orders-item-detail-origin">
            {co.store_name}
          </div>
          <div className="orders-item-detail-name">
            {co.name}
          </div>

          <div className="orders-item-detail-main">
            <span style={{color:"gray"}}>
              {co.grade !== null && (`(${co.grade}) `)} 
              {co.unit_name}, {moneyKRW(co.price_at_order)}
            </span>
            <span style={{color:"#bbbbbb"}}>
              &nbsp;&nbsp;|&nbsp;&nbsp;
            </span>
            <span style={{color:"gray"}}>
              {co.quantity}개
            </span> 
              
          </div>

          <div className="orders-item-detail-price">
            {moneyKRW(co.price_at_order)}
          </div>

          

        </div>


        <div className="order-item-btns">
          <div
            className="order-cancel-finished"
            tabIndex={0}
          >
            취소/환불 상세
          </div>
        </div>


      </div>
      
    </div>
  )

}