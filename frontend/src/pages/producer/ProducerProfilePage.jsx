// src/pages/producer/ProducerProfilePage.jsx
import { useEffect, useState } from 'react'

export default function ProducerProfilePage() {
  const [profile, setProfile] = useState(null)
  const [certificates, setCertificates] = useState([])

  useEffect(() => {
    // TODO: 프로필/농장정보/인증서 API 조회
    setProfile({
      name: '홍길동',
      email: 'test@test.com',
      phone: '010-0000-0000',
      farmName: '길동 농원',
      farmAddress: '강원도 어딘가 123',
      farmIntro: '사과와 배를 재배하는 농원입니다.',
    })

    setCertificates([
      {
        id: 1,
        type: 'GAP 인증',
        status: 'APPROVED', // APPROVED | PENDING | REJECTED
      },
      {
        id: 2,
        type: '유기농 인증',
        status: 'PENDING',
      },
    ])
  }, [])

  const handleSaveProfile = (e) => {
    e.preventDefault()
    // TODO: 프로필 저장 API
    alert('프로필 정보 저장')
  }

  const handleRequestCertificateUpdate = (cert) => {
    // TODO: 수정 요청 API (메모 내용까지 받으려면 모달 추가)
    alert(`${cert.type} 인증서 수정 요청을 보냈습니다.`)
  }

  if (!profile) return <div>로딩중...</div>

  return (
    <div className="producer-profile-page">
      <h2>프로필 관리</h2>

      {/* 개인정보/농장정보 수정 */}
      <section>
        <h3>개인정보 & 농장정보</h3>
        <form onSubmit={handleSaveProfile} className="profile-form">
          <div>
            <label>이름</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div>
            <label>이메일</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label>연락처</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div>
            <label>농장명</label>
            <input
              type="text"
              value={profile.farmName}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, farmName: e.target.value }))
              }
            />
          </div>

          <div>
            <label>농장 주소</label>
            <input
              type="text"
              value={profile.farmAddress}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  farmAddress: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label>농장 소개</label>
            <textarea
              value={profile.farmIntro}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, farmIntro: e.target.value }))
              }
            />
          </div>

          <button type="submit">저장</button>
        </form>
      </section>

      {/* 인증서 목록/수정요청 */}
      <section>
        <h3>인증서</h3>
        <table className="cert-table">
          <thead>
            <tr>
              <th>인증서 종류</th>
              <th>상태</th>
              <th>수정 요청</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((c) => (
              <tr key={c.id}>
                <td>{c.type}</td>
                <td>{renderCertStatus(c.status)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRequestCertificateUpdate(c)}
                  >
                    수정 요청
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function renderCertStatus(status) {
  if (status === 'APPROVED') return '승인'
  if (status === 'PENDING') return '검토 중'
  if (status === 'REJECTED') return '반려'
  return status
}