import logoImg from "../assets/img/FarmDay.png";
import ChatbotMain from "./aichat/ChatbotMain";

export default function Footer() {

  return (
    <>
      <footer className="container-fluid pt-4 border-top mt-5" style={{ backgroundColor: "#ffffffff" }} >


        {/* ✅ 상단 정책 링크 */}
        <div className="container mb-3">
        <div className="d-flex gap-4 small align-items-center"
                style={{ 
                  color: "#553b20ff",
                  whiteSpace: "nowrap",     
                  overflowX: "auto" 
                }}
              >
            <a href="/help" className="text-decoration-none" style={{ color: "#553b20ff" }}>회사 소개</a>
            <a href="/shop" className="text-decoration-none" style={{ color: "#553b20ff" }}>대표 상품</a>
            <a href="/price" className="text-decoration-none" style={{ color: "#553b20ff" }}>오늘의 시세정보</a>
            <button type="button" className="text-decoration-none"
              style={{ color: "#3660d3ff", background: "none", border: "none" , padding:0}}
              onClick={() => {
                window.dispatchEvent(new Event("open-chatbot"));
              }}> AI 서비스
            </button>

            <button type="button"
                style={{ color: "#3660d3ff", background: "none", border: "none", padding: 0 }}
                onClick={() => {
                  if (!window.ChannelIO) {
                    alert("관리자 상담을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
                    return;
                  }
                  window.ChannelIO("show");
                  window.ChannelIO("open");
                }}>실시간 문의
              </button>
            </div>
          </div>

        {/* 본문 영역 */}
        <div className="container pt-4 pb-4 border-top">
          <div className="row align-items-start">

            {/* 좌측 로고 + 회사정보 */}
            <div className="col-md-7 small" style={{ color: "#6b4e2e" }}>
              <div className="d-flex align-items-center mb-3">
                <img
                  src={logoImg}
                  alt="FarmDay"
                  style={{ height: "46px", marginRight: "14px" }}
                />
                <strong style={{ color: "#4a3822" }}>(주)FarmDay</strong>
              </div>

              <div>대표자 : 차현탁</div>
              <div>사업자등록번호 : 123-45-67890</div>
              <div>주소 : 서울특별시 강남구 테헤란로 123</div>
              <div>이메일 : support@farmday.com</div>
              <div className="mt-2">
                FarmDay는 생산자와 소비자를 직접 연결하는 신선 직거래 플랫폼입니다.
              </div>
            </div>

            {/* 우측 고객센터 */}
            <div className="col-md-5 text-md-end mt-4 mt-md-0" style={{ color: "#6b4e2e" }}>
              <div
                className="fw-bold fs-6 mb-1"
                style={{ color: "#4a3822" }}
              >
                고객센터
              </div>

              <div
                className="fw-bold fs-3 mb-2"
                style={{ color: "#4a3822" }}
              >
                1600-1234
              </div>

              <div className="small">
                평일 09:00 ~ 18:00<br />
                점심시간 12:00 ~ 13:00<br />
                주말·공휴일 휴무
              </div>
            </div>

          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div
          className="container-fluid border-top py-3 text-center small"
          style={{ color: "#6b4e2e" }}
        >
          © 2025 FarmDay. All Rights Reserved.
        </div>

      </footer>
    </>
  );
}