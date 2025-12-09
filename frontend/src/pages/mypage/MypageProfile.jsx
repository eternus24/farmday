export default function MypageProfile({user_name,overview,moneyKRW,userInfo,couponAmount,openContent}) {

  return (
    <div className="border rounded-3 bg-white p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center greeting-box-1">
        <div className="fw-semibold">
          반가워요!!{" "} 
          <span className="text-primary">{user_name}</span>님
        </div>
        <span className="greeting-badge">
          {userInfo.user_grade || "LV.1"} 💎
        </span>
      </div>

      <div className="greeting-box-2">
        <div className="greeting-box-2-1 d-flex justify-content-between align-items-center">
          <div>보유 적립금</div>
          <span className="greeting-badge-2">
              {moneyKRW(userInfo.points)} <a style={{ color: "gray" }}>&gt;</a>
          </span>
        </div>

        <hr style={{ color: "#aaaaaa" }} />

        <div className="greeting-box-2-2 d-flex justify-content-between align-items-center">
          <div>보유 쿠폰</div>
          <span className="greeting-badge-2" onClick={() => openContent('membership')} style={{cursor:'pointer'}}>
              {couponAmount} 개 <a style={{ color: "gray" }}>&gt;</a>
          </span>
        </div>
      </div>
    </div>
  )
}