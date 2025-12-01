import MypageEachMyReview from "./MypageEachMyReview";

export default function MypageMyReview({myReview,setMyReview,getMyReview,formatKoreanDateTime}) {

  return (
    <section className="col-lg-8">
      <div className="border rounded-3 bg-white p-4">
        <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center">
          <h5 className="mb-0">주문 내역</h5>
          <div className="d-flex gap-2">
            
          </div>
        </div>


        {myReview.length > 0 && (
          <div className="vstack gap-3">
            {myReview.map((rv) => (
              <MypageEachMyReview rv={rv} formatKoreanDateTime={formatKoreanDateTime}
                
              />
            ))}
          </div>
        )}

        {myReview.length === 0 && (
          <div>
            작성한 리뷰가 없습니다.
          </div>
        )}
      </div>
      
      
    </section>
  )

}