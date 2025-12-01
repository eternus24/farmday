import MypageEachCanceledOrder from "./MypageEachCanceledOrder";

export default function MypageCanceledOrder({canceledOrder,setCanceledOrder,formatKoreanDateTime,moneyKRW}) {

  return (
    <section className="col-lg-8">
      <div className="border rounded-3 bg-white p-4">
        <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center">
          <h5 className="mb-0">취소 내역</h5>
          <div className="d-flex gap-2">
            
          </div>
        </div>


        {canceledOrder.length > 0 && (
          <div className="vstack gap-3">
            {canceledOrder.map((co) => (
              <MypageEachCanceledOrder 
                co={co} formatKoreanDateTime={formatKoreanDateTime} moneyKRW={moneyKRW}
              />
            ))}
          </div>
        )}

        {canceledOrder.length === 0 && (
          <div>
            취소 내역이 없습니다.
          </div>
        )}
      </div>
      
      
    </section>
  )

}