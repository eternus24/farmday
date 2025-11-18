// src/components/producer/ProducerProfileCard.jsx
export default function ProducerProfileCard({ producer }) {
  const handlePhotoChange = () => {
    // TODO: 파일 선택 → 업로드 → photoUrl 업데이트
    alert('프로필 사진 변경 기능은 추후 구현 예정입니다.')
  }

  const handleProfileEdit = () => {
    // 프로필 수정 페이지로 이동하게 할 수도 있고,
    // 현재 페이지 내에서 모달 띄우게 할 수도 있음
    // 일단은 알림만
    alert('프로필 수정은 프로필 관리 탭에서 처리합니다.')
  }

  return (
    <div className="producer-profile-card">
      <div className="profile-photo-wrap">
        <img
          src={producer.photoUrl || '/default-profile.png'}
          alt="프로필"
          className="profile-photo"
        />
        <button
          type="button"
          className="photo-edit-btn"
          onClick={handlePhotoChange}
        >
          사진 변경
        </button>
      </div>

      <div className="profile-info">
        <h2>{producer.farmName || producer.name}</h2>
        <p>{producer.email}</p>
        <p>{producer.phone}</p>
        <button
          type="button"
          className="profile-edit-btn"
          onClick={handleProfileEdit}
        >
          프로필 수정
        </button>
      </div>
    </div>
  )
}