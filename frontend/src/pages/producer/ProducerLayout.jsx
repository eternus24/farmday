// src/pages/producer/ProducerLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState, useContext } from 'react'
import '../../assets/css/producer.css'
import ProducerProfileCard from '../../components/producer/ProducerProfileCard.jsx'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ProducerLayout() {
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)

  const [producer, setProducer] = useState(null)
  const [storeExists, setStoreExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    const fetchProducer = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await axios.get(`${API_BASE}/api/producer/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
        })

        const data = res.data
        setProducer({
          name: data.name,
          farmName: data.farmName,
          email: data.email,
          phone: data.phone,
          photoUrl: data.photoUrl || '',
        })
        setStoreExists(!!data.hasStore)
      } catch (err) {
        console.error('생산자 정보 조회 에러:', err)
        setError('생산자 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducer()
  }, [auth])

  const handleStoreButtonClick = () => {
    if (!storeExists) {
      navigate('/producer/store/create')
    } else {
      navigate('/store/my')
    }
  }

  if (loading) return <div>생산자 정보를 불러오는 중입니다...</div>
  if (error) return <div>{error}</div>
  if (!producer) return <div>생산자 정보가 없습니다.</div>

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
            <Outlet context={{ producer, storeExists }} />
          </section>
        </main>
      </div>
    </div>
  )
}