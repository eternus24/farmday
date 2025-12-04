import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";

export default function MypageEachWishlist({wl,formatKoreanDateTime,moneyKRW,getWishlist}) {

  //장바구니 등록 기능 (2025-11-24 14:53 추가) ======================
  const { protocol, hostname } = window.location;
  const API_BASE = `${protocol}//${hostname}:8080`;
  const user_id = JSON.parse(window.localStorage.getItem('loginUser')).userId;
  const { findCartAmount } = useContext(CartContext);

  async function insertCart(product_id,product_name) {
      const cartUploadData = [{
          product_id: product_id,
          quantity: 1
      }]
      const res = await fetch(`${API_BASE}/cart/insertCart/${user_id}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cartUploadData),
      });
      if (!res.ok) {
          const msg = await res.text();
          if (res.status === 400 && msg === "ALREADY_IN_CART") {
              alert("이미 장바구니에 있는 상품입니다.");
              return;
          }
          throw new Error(`HTTP ${res.status}`);
      }
      alert(`${product_name}을(를) 장바구니에 담았습니다.`)

      await findCartAmount();
  }

  async function deleteWishlist(product_id,user_id) {
    const response = await fetch(`${API_BASE}/mypage/deleteWishlist?user_id=${user_id}&product_id=${product_id}`, {
        method: "get",
        credentials: "include",
    });
    if (response.ok) {
        alert("찜목록에서 삭제되었습니다.");
        getWishlist();
    } else {
        console.error("찜목록 삭제 실패:", response.statusText);
    }
  }



  // ===========================================================



  return (
    <div key={wl.wishlist_id} className="order-canceled-box">
      <div className="d-flex justify-content-between align-items-center">
        
         <span className="order-date-span">
           {formatKoreanDateTime(wl.created_date)}
         </span>
         <span className="me-2">
          123
         </span>
          
      </div>
      <div className="d-flex align-items-center mt-3">
        <NavLink to={`/shop/detail/${wl.product_id}`}>
          <img src={wl.main_image} alt={wl.name} className={`orders-item-img`}/>
        </NavLink>
        <div className="orders-item-detail">

          <div className="orders-item-detail-origin">
            {wl.store_name}
          </div>
          <div className="orders-item-detail-name">
            {wl.name}
          </div>

          <div className="orders-item-detail-main">
            <span style={{color:"gray"}}>
              {wl.grade !== null && (`(${wl.grade}) `)} 
              {wl.unit_name}, {moneyKRW(wl.price)}
            </span>
            <span style={{color:"#bbbbbb"}}>
              &nbsp;&nbsp;|&nbsp;&nbsp;
            </span>
            <span style={{color:"gray"}}>
              {wl.origin_region}
            </span> 
              
          </div>

          <div className="orders-item-detail-price">
            {moneyKRW(wl.price)}
          </div>

          

        </div>


        <div className="order-item-btns">
          <div className="order-cancel-btn" style={{display:"flex",float:"left",marginRight:10}} tabIndex={0} onClick={() => insertCart(wl.product_id,wl.name)}>
            장바구니 담기
          </div>
          <div className="order-cancel-btn" style={{display:"flex",float:"right"}} tabIndex={0} onClick={() => deleteWishlist(wl.product_id,wl.user_id)}>
            삭제
          </div>
        </div>


      </div>
      
    </div>
  );

}