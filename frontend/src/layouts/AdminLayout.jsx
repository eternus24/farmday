// src/layouts/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";

const ADMIN_MENUS = [
  { label: "대시보드", path: "/admin" },                // default
  { label: "유저관리", path: "/admin/users" },
  { label: "배너관리", path: "/admin/banners" },
  { label: "공동구매 상품등록", path: "/admin/group-deals" },
  { label: "공지사항관리", path: "/admin/notices" },
  { label: "생산자 승인", path: "/admin/producers" },
  { label: "가격 정보관리", path: "/admin/prices" },
  { label: "상품관리", path: "/admin/products" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/admin"); // 로고 누르면 대시보드로
  };

  return (
    <PageWrap>
      {/* 상단 헤더 + 메뉴 전체를 sticky 로 고정 */}
      <StickyHeader>
        <TopBar>
          <LogoArea onClick={handleLogoClick}>
            <span className="logo-badge">FD</span>
            <span className="logo-text">FarmDay Admin</span>
          </LogoArea>

          <RightArea>
            {/* 나중에 관리자 이름 / 로그아웃 버튼 붙이면 좋음 */}
            <span className="role">관리자</span>
          </RightArea>
        </TopBar>

        <NavBar>
          {ADMIN_MENUS.map((menu) => (
            <NavItem key={menu.path}>
              <NavLinkStyled
                to={menu.path}
                end={menu.path === "/admin"} // 대시보드만 end 옵션
              >
                {menu.label}
              </NavLinkStyled>
            </NavItem>
          ))}
        </NavBar>
      </StickyHeader>

      {/* 실제 페이지 내용 영역 */}
      <ContentArea>
        <Outlet />
      </ContentArea>
    </PageWrap>
  );
}

/* ===== styled-components ===== */

const PageWrap = styled.div`
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
`;

// 상단 영역 전체를 sticky 로 고정
const StickyHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: #f5f7fb;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
`;

const TopBar = styled.div`
  height: 60px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  .logo-badge {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    background: linear-gradient(135deg, #4e7eff, #3cb371);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: #1f2933;
  }
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .role {
    font-size: 13px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4f46e5;
    font-weight: 600;
  }
`;

const NavBar = styled.nav`
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f7fb;
  border-top: 1px solid #e5e7f3;
  border-bottom: 1px solid #e5e7f3;
  overflow-x: auto;
`;

const NavItem = styled.div``;

// NavLink 에 스타일 입힌 버전
const NavLinkStyled = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, transform 0.05s ease;

  &:hover {
    background: #e5edff;
    color: #1f2933;
  }

  &.active {
    background: #4e7eff;
    color: #ffffff;
    font-weight: 600;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;