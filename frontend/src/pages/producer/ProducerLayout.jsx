// src/pages/producer/ProducerLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../../assets/css/producer.css'
import ProducerProfileCard from '../../components/producer/ProducerProfileCard.jsx'
// ⭐ 새 CSS 파일(또는 App.css)에 넣을 거라면 여기서 import 해도 됨
// import '../../styles/producer.css'

export default function ProducerLayout() {
  const navigate = useNavigate()
  const [producer, setProducer] = useState(null)
  const [storeExists, setStoreExists] = useState(false)

  useEffect(() => {
    setProducer({
      name: '홍길동',
      farmName: '길동 농원',
      email: 'test@test.com',
      phone: '010-0000-0000',
      photoUrl: '',
    })
    setStoreExists(false)
  }, [])

  const handleStoreButtonClick = () => {
    if (!storeExists) {
      navigate('/producer/store/create')
    } else {
      navigate('/store/my')
    }
  }

  if (!producer) return <div>로딩중...</div>

  return (
    <div className="producer-page-root">
      <div className="producer-layout">
        {/* 좌측 프로필 + 메뉴 */}
        <aside className="producer-sidebar">
          <ProducerProfileCard producer={producer} />

          <nav className="producer-nav">
            <ul>
              <li>
                <NavLink to="/producer" end>
                  대시보드
                </NavLink>
              </li>
              <li>
                <NavLink to="/producer/orders">판매 관리</NavLink>
              </li>
              <li>
                <NavLink to="/producer/products">상품 관리</NavLink>
              </li>
              <li>
                <NavLink to="/producer/profile">프로필 관리</NavLink>
              </li>
            </ul>
          </nav>
        </aside>

        {/* 우측 메인 컨텐츠 */}
        <main className="producer-content">
          <header className="producer-header">
            <h1>생산자 마이페이지</h1>
            <button
              type="button"
              className="producer-store-btn"
              onClick={handleStoreButtonClick}
            >
              {storeExists ? '내 스토어 바로가기' : '스토어 개설하기'}
            </button>
          </header>

          <section className="producer-main">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}
