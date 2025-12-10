// src/pages/producer/ProducerLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useContext } from 'react'
import '../../assets/css/producer.css'
import ProducerProfileCard from '../../components/producer/ProducerProfileCard.jsx'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ProducerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
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
        console.log('producer /me 응답:', data)

        // 🔥 전체 DTO 그대로 저장
        setProducer(data)
        // 백엔드 응답이 hasStore 라고 가정
        setStoreExists(!!data.hasStore)
      } catch (err) {
        console.error('생산자 정보 조회 에러:', err)
        const status = err.response?.status
        if (status === 401) {
          setError('로그인이 필요합니다. 다시 로그인해주세요.')
        } else if (status === 403) {
          setError('생산자로 등록되지 않은 사용자입니다. 생산자 등록을 먼저 진행해주세요.')
        } else if (status === 404) {
          // 개발용: 생산자 정보 없을 때 더미 데이터 사용
          setProducer({
            producerId: 1,
            userId: auth?.userId || 'aaa123',
            name: auth?.name || '테스트 생산자',
            email: auth?.email || '',
            phone: auth?.phone || '',
            photoUrl: auth?.photo || null,
            addr: auth?.addr || '',
            farmName: '테스트 농장',
            bizNo: '',
            farmAddr: '',
            farmPhone: '',
            bankName: '',
            bankAccountNo: '',
            accountHolder: '',
            isVerified: 'Y',
            hasStore: false
          })
          setStoreExists(false)
        } else {
          setError('생산자 정보를 불러오는 중 오류가 발생했습니다.')
        }
      } finally {
        setLoading(false)
      }
    }

    // 🔥 auth 또는 현재 경로가 바뀔 때마다 생산자 정보 재조회
    fetchProducer()
  }, [auth, location.pathname])

  const handleStoreButtonClick = () => {
    if (!storeExists) {
      navigate('/producer/create');
    } else {
      // 🔥 producer.producerId 를 기반으로 이동
      navigate(`/store/${producer.producerId}`);
    }
  };

  if (loading) return <div>생산자 정보를 불러오는 중입니다...</div>
  if (error) return <div>{error}</div>
  if (!producer) return <div>생산자 정보가 없습니다.</div>

  return (
    <div className="producer-page-root">
      <div className="producer-layout">
        {/* 좌측 프로필 + 메뉴 */}
        <aside className="producer-sidebar">
          {/* 🔹 ProducerProfileCard는 계속 producer.name, producer.farmName 등 써도 됨 */}
          <ProducerProfileCard producer={producer} />

          <nav className="producer-nav">
            <ul>
              <li>
                <NavLink to="/producer" end>
                  대시보드
                </NavLink>
              </li>
              <li>
                <NavLink to="/producer/seller-dashboard">공동구매 대시보드</NavLink>
              </li>
              <li>
                <NavLink to="/producer/groupdeals">공동구매 마이페이지</NavLink>
              </li>
              <li>
                <NavLink to="/producer/orders">판매 관리</NavLink>
              </li>
              <li>
                <NavLink to="/producer/products">상품 관리</NavLink>
              </li>
            </ul>
          </nav>
        </aside>

        {/* 우측 메인 컨텐츠 */}
        <main className="producer-content">
          <header className="producer-header">
            <h1>생산자 센터</h1>
            <button
              type="button"
              className="producer-store-btn"
              onClick={handleStoreButtonClick}
            >
              {storeExists ? '내 스토어 바로가기' : '스토어 개설하기'}
            </button>
          </header>

          <section className="producer-main">
            {/* 🔥 Outlet 쪽에서 producer 전체 DTO 사용 가능 */}
            <Outlet context={{ producer, storeExists }} />
          </section>
        </main>
      </div>
    </div>
  )
}
