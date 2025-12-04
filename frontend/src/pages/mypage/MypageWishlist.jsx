import MypageEachWishlist from "./MypageEachWishlist";

export default function MypageWishlist({formatKoreanDateTime,moneyKRW,wishlist,getWishlist}) {

  return (
    <section className="col-lg-8">
      <div className="border rounded-3 bg-white p-4">
        <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center">
          
          <h5 className="mb-0">
            ❤️ 찜목록
          </h5>
          <div className="d-flex gap-2">

          </div>
        </div>


        {wishlist.length > 0 && (
          <div className="vstack gap-3">
            {wishlist.map((wl) => (
              <MypageEachWishlist
                wl={wl} formatKoreanDateTime={formatKoreanDateTime} moneyKRW={moneyKRW} getWishlist={getWishlist}
              />
            ))}
          </div>
        )}

        {wishlist.length === 0 && (
          <div>
            찜목록이 없습니다.
          </div>
        )}
      </div>
      
      
    </section>
  );


}