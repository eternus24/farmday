import { NavLink, useNavigate } from "react-router-dom";

export default function MypageEachOrdersItem({item,moneyKRW,handleOpenCancelModal,confirmOrder,refundRequest,handleOpenDeliveryModal}) {

  const navigate = useNavigate()

  return (
    <div key={item.order_item_id} className="orders-item-container">
      <NavLink to={`/shop/detail/${item.product_id}`}>
        <img 
          src={item.main_image} 
          alt={item.product_name} 
          className={`
            orders-item-img 
            ${item.order_status === 'R1' ? 'is-canceled' : ''}
          `}/>
      </NavLink>
      <div className="orders-item-detail">

        <div className="orders-item-detail-origin">
          {item.store_name}
        </div>
        <div className="orders-item-detail-name">
          {item.product_name}
        </div>

        <div className="orders-item-detail-main">
          <span style={{color:"gray"}}>
              {item.grade !== null && (`(${item.grade}) `)} 
              {item.unit_name}, {moneyKRW(item.price_at_order)}
            </span>
          <span style={{color:"#bbbbbb"}}>
            &nbsp;&nbsp;|&nbsp;&nbsp;
          </span>
          <span style={{color:"gray"}}>
            {item.quantity}개
          </span> 
            
        </div>
        <div className="orders-item-detail-price">
          {moneyKRW(item.price_at_order*item.quantity)}
        </div>

        

        

      </div>



      <div className="orders-item-btns-container">

        <div className="orders-item-detail-delivery">
          <div onClick={() => handleOpenDeliveryModal(item.order_item_id)} className="orders-item-delivery-status">
            {item.delivery_status === '배송중' && (
              <span>🚚&nbsp;</span>
            )}
            {(item.delivery_status === null) ? (
              '배송정보없음'
            ):(
              item.delivery_status
            )}
          </div>
          
        </div>

        
        <div className="order-item-btns">
          {
            (item.order_status === 'R1' && item.delivery_status === '배송취소') && (
              <div
                className="order-cancel-finished"
                tabIndex={0}
              >
                취소 완료
              </div>
            )
          }
          {
            (item.order_status === 'R1' && item.delivery_status === '환불완료') && (
              <div
                className="order-cancel-finished"
                tabIndex={0}
              >
                환불 완료
              </div>
            )
          }
          {(item.order_status === 'A1' && item.delivery_status === '배송준비')  && (
            <div
              className="order-cancel-btn"
              onClick={() => handleOpenCancelModal(item.order_item_id)}
              role="button"
              tabIndex={0}
            >
              주문 취소
            </div>
          )}
          {(item.order_status === 'A1' && item.delivery_status === '배송중')  && (
            <div className="order-cancel-btn" tabIndex={0} onClick={() => handleOpenDeliveryModal(item.order_item_id)}>
              배송 조회
            </div>
          )}
          {item.order_status === 'A2' && (
            <>
              <div className="order-cancel-btn" style={{display:"flex",float:"left",marginRight:10}} tabIndex={0} onClick={() => confirmOrder(item.order_item_id,item.order_id)}>
                구매 확정
              </div>
              <div className="order-cancel-btn" style={{display:"flex",float:"right"}} tabIndex={0} onClick={() => refundRequest(item.order_item_id,item.order_id)}>
                환불 신청
              </div>
            </>
          )}
          {(item.order_status === 'B1') && (
            <div className="order-cancel-finished">
              환불 요청됨
            </div>
          )}
          {(item.order_status === 'E1' || item.order_status === 'E2') && (
            
            <>
              <div className="order-cancel-btn" style={{display:"flex",float:"left",marginRight:10}} tabIndex={0} onClick={()=>navigate(`/review/write/${item.order_item_id}`,{state:item})}>
                리뷰 작성
              </div>
              <div className="order-cancel-btn" style={{display:"flex",float:"right"}}>
                구매 상세
              </div>
            </>
          )}
          {(item.order_status === 'E3') && (
            
            <>
              <div className="order-cancel-btn" style={{display:"flex",float:"left",marginRight:10}}>
                리뷰 작성 완료
              </div>
              <div className="order-cancel-btn" style={{display:"flex",float:"right"}}>
                구매 상세
              </div>
            </>
          )}
        </div>

      </div>
      
    </div>
  )

}