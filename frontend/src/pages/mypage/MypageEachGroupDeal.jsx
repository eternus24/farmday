import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function MypageEachGroupDeal({od,formatKoreanDateTime,moneyKRW,handleToggleOrderDetails,openOrderId,ordersItem,handleOpenCancelModal,confirmOrder,refundRequest,handleOpenGroupDealDeliveryModal,API_BASE}) {

  const imgList = od.orders_img_list || [];
  // 예시: 대표 이미지 + 나머지 이미지 썸네일
  const mainImg = imgList[0];           // 첫 번째 이미지를 대표로
  const subImgs = imgList.slice(1);     // 나머지

  const [groupDealItem, setGroupDealItem] = useState([]);

  async function getGroupDealItem() {
    try {
      const res = await fetch(
        `${API_BASE}/orders/findGroupDealItemByOrderId?order_id=${od.order_id}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGroupDealItem(data);
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("load ordersItem failed:", e);
      setGroupDealItem([]);
    }
  }



  useEffect(() => {
    getGroupDealItem();
  }, []);

  return (
    <div key={od.order_id} className="group-deal-order-box">

      

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

        
        <NavLink to={`/group-deals/${groupDealItem.group_deal_id}`}>
          <div className="order-images-spread-container">
            {imgList.map((img) => (
              <div>
                <img src={img.main_image} className="order-images-spread-img"/>
              </div>
            ))}
          </div>
        </NavLink>
        

        <div className="orders-thumbnail-detail">
          <div className="fw-semibold">
            {groupDealItem.product_name}
            
            <br/><br/>
            결제 금액 : {moneyKRW(od.product_total_amount)}
            <br/>
            할인 금액 : {moneyKRW(od.discount_amount+od.used_points)}
            <br/>
            총 결제금액 : {moneyKRW(od.order_total_amount)}
          </div>
        </div>


        <div className="orders-item-btns-container">

          <div className="group-deal-orders-item-detail-delivery">
            <div onClick={() => handleOpenGroupDealDeliveryModal(groupDealItem.order_item_id)} className="orders-item-delivery-status">
              {groupDealItem.delivery_status === '배송중' && (
                <span>🚚&nbsp;</span>
              )}
              {(groupDealItem.delivery_status === null) ? (
                '배송정보없음'
              ):(
                groupDealItem.delivery_status
              )}
            </div>
            
          </div>


          
          
          <div className="order-item-btns">
            {
              (groupDealItem.order_status === 'R1' && groupDealItem.delivery_status === '배송취소') && (
                <div
                  className="order-cancel-finished"
                  tabIndex={0}
                >
                  취소 완료
                </div>
              )
            }
            {
              (groupDealItem.order_status === 'R1' && groupDealItem.delivery_status === '환불완료') && (
                <div
                  className="order-cancel-finished"
                  tabIndex={0}
                >
                  환불 완료
                </div>
              )
            }
            {(groupDealItem.order_status === 'A1' && groupDealItem.delivery_status === '배송준비')  && (
              <div
                className="order-cancel-btn"
                onClick={() => handleOpenCancelModal(od.order_item_id)}
                role="button"
                tabIndex={0}
              >
                주문 취소
              </div>
            )}
            {(groupDealItem.order_status === 'A1' && groupDealItem.delivery_status === '배송중')  && (
              <div className="order-cancel-btn" tabIndex={0} onClick={() => handleOpenDeliveryModal(od.order_item_id)}>
                배송 조회
              </div>
            )}
            {groupDealItem.order_status === 'A2' && (
              <>
                <div className="order-cancel-btn" style={{display:"flex",float:"left",marginRight:10}} tabIndex={0} onClick={() => confirmOrder(od.order_item_id,od.order_id)}>
                  구매 확정
                </div>
                <div className="order-cancel-btn" style={{display:"flex",float:"right"}} tabIndex={0} onClick={() => refundRequest(od.order_item_id,od.order_id)}>
                  환불 신청
                </div>
              </>
            )}
            {(groupDealItem.order_status === 'B1') && (
              <div className="order-cancel-finished">
                환불 요청됨
              </div>
            )}
            {(groupDealItem.order_status === 'E1' || groupDealItem.order_status === 'E2') && (
              
              <>
                <div className="order-cancel-btn" style={{display:"flex",float:"left",marginRight:10}} tabIndex={0} onClick={()=>navigate(`/review/write/${od.order_item_id}`)}>
                  리뷰 작성
                </div>
                <div className="order-cancel-btn" style={{display:"flex",float:"right"}}>
                  구매 상세
                </div>
              </>
            )}
            {(groupDealItem.order_status === 'E3') && (
              
              <>
                <div className="order-cancel-finished" style={{display:"flex",float:"left",marginRight:10}}>
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

      
    </div>
  )

}