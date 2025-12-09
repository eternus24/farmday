import { useState, useEffect } from "react";
import MypageEachWishlist from "./MypageEachWishlist";

const PAGE_SIZE = 5;
const PAGE_WINDOW = 5;

export default function MypageWishlist({formatKoreanDateTime,moneyKRW,wishlist,getWishlist}) {

  // 🆕 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 🆕 찜 목록 개수가 바뀔 때는 항상 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [wishlist.length]);

  // 🆕 전체 페이지 수
  const totalPages = Math.max(1, Math.ceil(wishlist.length / PAGE_SIZE));

  // 🆕 현재 페이지가 전체 페이지를 넘어가지 않도록 보정
  const safePage = Math.min(currentPage, totalPages);

  // 🆕 현재 페이지에 보여줄 찜 목록만 잘라내기
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pagedWishlist = wishlist.slice(startIndex, endIndex);

  // 🆕 페이지 번호 묶음(1~5, 6~10, ...) 계산
  const startPage = Math.floor((safePage - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1;
  const endPage = Math.min(totalPages, startPage + PAGE_WINDOW - 1);
  const pageNumbers = [];
  for (let p = startPage; p <= endPage; p += 1) {
    pageNumbers.push(p);
  }

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
          <>
            <div className="vstack gap-3">
              {/* 🆕 페이징된 위시리스트만 렌더링 */}
              {pagedWishlist.map((wl) => (
                <MypageEachWishlist
                  wl={wl}
                  formatKoreanDateTime={formatKoreanDateTime}
                  moneyKRW={moneyKRW}
                  getWishlist={getWishlist}
                />
              ))}
            </div>

            {/* 🆕 페이지네이션 (찜 개수가 6개 이상일 때부터 표시) */}
            {totalPages > 0 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center mb-0 mypage-pagination">
                  {/* 이전 페이지 버튼 */}
                  <li className={`page-item ${safePage <= 1 ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => {
                        if (safePage > 1) {
                          setCurrentPage(safePage - 1);
                        }
                      }}
                    >
                      &lt;
                    </button>
                  </li>

                  {/* 1~5, 6~10 처럼 최대 5개까지 숫자 표시 */}
                  {pageNumbers.map((p) => (
                    <li
                      key={p}
                      className={`page-item ${safePage === p ? "active" : ""}`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    </li>
                  ))}

                  {/* 다음 페이지 버튼 */}
                  <li className={`page-item ${safePage >= totalPages ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => {
                        if (safePage < totalPages) {
                          setCurrentPage(safePage + 1);
                        }
                      }}
                    >
                      &gt;
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
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