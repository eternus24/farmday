import { NavLink } from "react-router-dom";

export default function MypageEachMyReview({rv,formatKoreanDateTime}) {

  return (
    <div key={rv.review_id} className="order-box">
      <div className="d-flex justify-content-between align-items-center">
        
        <span className="order-date-span">
          {formatKoreanDateTime(rv.created_date)}
        </span>
        <span className="me-2">
          주문번호 {rv.toss_orderid.replaceAll('order-','')}
        </span>
          
      </div>

      <div className="d-flex align-items-center mt-3">
        <NavLink to={`/shop/detail/${rv.product_id}`}>
          <img src={rv.main_image} className={`orders-thumbnail-img`}/>
        </NavLink>
        
        <div className="orders-thumbnail-detail">
          <div className="fw-semibold">
            상품명 : {rv.name}
            
            <br/>
            별점 : {rv.rating}
            <br/>
            <br/>
            리뷰 제목 : {rv.title}
            <br/>
            리뷰 내용 : {rv.content}
          </div>
        </div>
        
        
        
      </div>

      
    </div>
  )

}