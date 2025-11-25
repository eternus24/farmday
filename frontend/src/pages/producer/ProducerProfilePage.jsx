// src/pages/producer/ProducerProfilePage.jsx
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

export default function ProducerProfilePage() {
  const { producer } = useOutletContext()
  const [profile, setProfile] = useState(null)
  const [certificates, setCertificates] = useState([]) // 🔹 초기값: 빈 배열

  useEffect(() => {
    if (producer) {
      // /api/producer/me 에서 받은 기본 정보로 폼 초기화
      setProfile({
        name: producer.name || '',
        email: producer.email || '',
        phone: producer.phone || '',
        farmName: producer.farmName || '',
        farmAddress: '', // TODO: backend에서 farmAddr 내려주면 채우기
        farmIntro: '',   // TODO: 나중에 별도 필드 생기면 채우기
        photoUrl: producer.photoUrl || '',
      })
    }

    // ✅ 더미 인증서 절대 넣지 않음
    // 나중에 실제 API 만들면 여기서 axios로 setCertificates(...) 할 예정
    // setCertificates(res.data) 이런 식으로
  }, [producer])

  const handleSaveProfile = (e) => {
    e.preventDefault()
    // TODO: 프로필 저장 API 호출 (예: PATCH /api/producer/profile)
    alert('프로필 정보 저장 (API 연동 예정)')
  }

  const handleRequestCertificateUpdate = (cert) => {
    // TODO: 수정 요청 API 연동
    alert(`${cert.type} 인증서 수정 요청을 보냈습니다. (API 연동 예정)`)
  }

  if (!producer) return <div>생산자 정보를 불러오는 중입니다...</div>
  if (!profile) return <div>프로필 정보를 불러오는 중입니다...</div>

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

      {/* 인증서 섹션 – 더미 없음, 데이터 없으면 안내만 */}
      <section>
        <h3>인증서</h3>

        {certificates.length === 0 ? (
          <p>등록된 인증서가 없습니다. (추후 인증서 API 연동 예정)</p>
        ) : (
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
        )}
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