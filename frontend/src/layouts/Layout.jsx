// src/layouts/Layout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Layout() {
  return (
    <>
      <Header />
      {/* 헤더 높이만큼 여백 (프로젝트 스타일에 맞춰 조절) */}
      <main style={{ paddingTop: 120 }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}