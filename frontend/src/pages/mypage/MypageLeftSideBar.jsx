import { Link, NavLink } from "react-router-dom";
import MypageProfile from "./MypageProfile";


export default function MypageLeftSideBar({user_name,overview,moneyKRW,userInfo,showContent,setShowContent,myReview,setMyReview,getMyReview,openContent}) {

  return (
    <aside className="col-lg-4">

      {/* 프로필/요약 카드 */}
      <MypageProfile
        user_name={user_name} overview={overview} moneyKRW={moneyKRW} userInfo={userInfo}
      />

      {/* 메뉴 */}
      <nav className="border rounded-3 bg-white p-3">
        <div className="mb-3">
          <div className="fw-semibold mb-2 link-main" onClick={() => openContent('orderList')}>
            <img
                src="https://api.iconify.design/emojione:package.svg?color=%23888888"
                className="menu-img"
            />
            주문내역
          </div>

          <NavLink to="/cart">
            <div className="fw-semibold mb-2 link-main">
              <img
              src="https://api.iconify.design/emojione:shopping-cart.svg?color=%23888888"
              className="menu-img"
              />
              장바구니
            </div>
          </NavLink>

          <div className="fw-semibold mb-2 link-main" onClick={() => openContent('wishlist')}>
            <img
                src="https://api.iconify.design/emojione:heart-decoration.svg?color=%23888888"
                className="menu-img"
            />
            찜한 상품
          </div>

          <div className="fw-semibold mb-2 link-main">
            <img
                src="https://api.iconify.design/emojione:unlocked.svg?color=%23888888"
                className="menu-img"
            />
            내 정보 관리
          </div>
        </div>

        <hr />

        <div className="mb-3">
          <div className="fw-semibold mb-2">쇼핑</div>
          <ul className="list-unstyled ms-1 small">
            <li className="mb-2">
                <Link
                className="link-secondary"
                to="/mypage/payments"
                >
                결제수단 · 페이
                </Link>
            </li>
            <li className="mb-2">
                <div className="link-secondary" onClick={() => openContent('canceledOrder')}>
                  취소 · 반품 내역
                </div>
            </li>
            <li className="mb-2">
                <div className="link-secondary" onClick={() => openContent('myReview')}>
                  상품 후기
                </div>
            </li>
            <li className="mb-2">
                <Link
                className="link-secondary"
                to="/mypage/gifts"
                >
                  선물 내역
                </Link>
            </li>
            <li className="mb-2">
                <Link
                className="link-secondary"
                to="/mypage/support"
                >
                  상담 문의
                </Link>
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <div className="fw-semibold mb-2">혜택</div>
          <ul className="list-unstyled ms-1 small">
            <li className="mb-2 link-secondary" onClick={() => openContent('membership')} style={{cursor: 'pointer'}}>
              멤버십 및 등급
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <div className="fw-semibold mb-2">내 정보관리</div>
          <ul className="list-unstyled ms-1 small">
            <li className="mb-2">
                <Link
                className="link-secondary"
                to="/mypage/addresses"
                >
                배송지 관리
                </Link>
            </li>
            <li className="mb-2 link-secondary" onClick={() => openContent("myInfo")} style={{cursor: 'pointer'}}>
                내 정보 수정
            </li>
            <li className="mb-2">
                <Link
                className="link-secondary"
                to="/mypage/vip"
                >
                VIP 예상 등급
                </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="fw-semibold mb-2">서비스 안내</div>
          <ul className="list-unstyled ms-1 small">
            <li className="mb-2">
              <Link
              className="link-secondary"
              to="/help/purplebox"
              >
              퍼플박스
              </Link>
            </li>
            <li className="mb-2">
              <Link
              className="link-secondary"
              to="/help/vip"
              >
              VIP 안내
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>


  )



}