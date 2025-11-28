// src/pages/producer/ProducerProfilePage.jsx
import { useEffect, useState, useContext } from 'react'
import { useOutletContext } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ProducerProfilePage() {
  // 🔥 setProducer도 받아오기
  const { producer, setProducer } = useOutletContext()
  const { auth } = useContext(AuthContext)

  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (producer) {
      console.log('producer from outlet:', producer)

      setProfile({
        // USERS
        name: producer.name ?? '',
        email: producer.email ?? '',
        phone: producer.phone ?? '',
        addr: producer.addr ?? '',
        photoUrl: producer.photoUrl ?? '',

        // PRODUCER
        bizName: producer.farmName ?? '',
        bizAddr: producer.farmAddr ?? '',
        bizPhone: producer.farmPhone ?? '',
        bankName: producer.bankName ?? '',
        bankAccountNo: producer.bankAccountNo ?? '',
        accountHolder: producer.accountHolder ?? '',
      })
    }
  }, [producer])

  const handleChange = (field) => (e) => {
    const value = e.target.value
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      setSaving(true)

      // 1) 업데이트 호출
      await axios.patch(
        `${API_BASE}/api/producer/me`,
        {
          // USERS
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          addr: profile.addr,
          photoUrl: profile.photoUrl,
          // PRODUCER
          bizName: profile.bizName,
          bizAddr: profile.bizAddr,
          bizPhone: profile.bizPhone,
          bankName: profile.bankName,
          bankAccountNo: profile.bankAccountNo,
          accountHolder: profile.accountHolder,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
        },
      )

      // 2) 최신 정보 다시 조회
      const res = await axios.get(`${API_BASE}/api/producer/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token.startsWith('Bearer ')
            ? token
            : `Bearer ${token}`,
        },
      })

      const data = res.data

      // 3) 부모 Layout의 producer도 갱신
      setProducer(data)

      // 4) 내 profile도 다시 세팅
      setProfile({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        addr: data.addr ?? '',
        photoUrl: data.photoUrl ?? '',
        bizName: data.farmName ?? '',
        bizAddr: data.farmAddr ?? '',
        bizPhone: data.farmPhone ?? '',
        bankName: data.bankName ?? '',
        bankAccountNo: data.bankAccountNo ?? '',
        accountHolder: data.accountHolder ?? '',
      })

      alert('프로필이 저장되었습니다.')
    } catch (err) {
      console.error('프로필 저장 에러:', err)
      alert('프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (!producer) return <div>생산자 정보를 불러오는 중입니다...</div>
  if (!profile) return <div>프로필 정보를 불러오는 중입니다...</div>

  return (
    <div className="producer-profile-page">
      <h2>프로필 관리</h2>

      <section>
        <h3>기본 정보</h3>

        <form onSubmit={handleSaveProfile} className="profile-form">
          {/* 🔹 개인 정보 (USERS) */}
          <div className="profile-section">
            <h4>개인 정보</h4>

            <div>
              <label>이름</label>
              <input
                type="text"
                value={profile.name}
                onChange={handleChange('name')}
              />
            </div>

            <div>
              <label>이메일</label>
              <input
                type="email"
                value={profile.email}
                onChange={handleChange('email')}
              />
            </div>

            <div>
              <label>연락처</label>
              <input
                type="text"
                value={profile.phone}
                onChange={handleChange('phone')}
              />
            </div>

            <div>
              <label>주소</label>
              <input
                type="text"
                value={profile.addr}
                onChange={handleChange('addr')}
              />
            </div>
          </div>

          {/* 🔹 사업자 / 정산 정보 (PRODUCER) */}
          <div className="profile-section">
            <h4>사업자 / 정산 정보</h4>

            <div>
              <label>상호 / 농장명</label>
              <input
                type="text"
                value={profile.bizName}
                onChange={handleChange('bizName')}
              />
            </div>

            <div>
              <label>사업장 주소</label>
              <input
                type="text"
                value={profile.bizAddr}
                onChange={handleChange('bizAddr')}
              />
            </div>

            <div>
              <label>사업장 연락처</label>
              <input
                type="text"
                value={profile.bizPhone}
                onChange={handleChange('bizPhone')}
              />
            </div>

            <div>
              <label>정산 은행명</label>
              <input
                type="text"
                value={profile.bankName}
                onChange={handleChange('bankName')}
              />
            </div>

            <div>
              <label>정산 계좌번호</label>
              <input
                type="text"
                value={profile.bankAccountNo}
                onChange={handleChange('bankAccountNo')}
              />
            </div>

            <div>
              <label>예금주</label>
              <input
                type="text"
                value={profile.accountHolder}
                onChange={handleChange('accountHolder')}
              />
            </div>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </form>
      </section>
    </div>
  )
}