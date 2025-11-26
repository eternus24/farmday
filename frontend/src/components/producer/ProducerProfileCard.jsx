// src/components/producer/ProducerProfileCard.jsx
export default function ProducerProfileCard({ producer }) {
  const handlePhotoChange = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    // 파일 → URL 변환 (백엔드에 업로드 안 한다면 프론트에서 URL 저장하는 방식)
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/producer/me/photo`,
        {
          method: "PATCH",
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        alert("프로필 변경 실패 ㅠㅠ");
        return;
      }

      alert("프로필 사진이 변경되었어요!");

      // 새 이미지 불러오기 위해 페이지 새로고침
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  input.click();
};

  const handleProfileEdit = () => {
    alert('프로필 수정은 프로필 관리 탭에서 처리합니다.')
  }

  return (
    <div className="producer-profile-card">
      {/* ✅ 프로필 사진 전체를 클릭 가능 영역으로 */}
      <div
        className="profile-photo-wrap"
        onClick={handlePhotoChange}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handlePhotoChange()
          }
        }}
      >
        <img
          src={producer.photoUrl || '/default-profile.png'}
          alt="프로필"
          className="profile-photo"
        />
        {/* ⛔ 기존 버튼은 삭제 */}
        {/* <button
          type="button"
          className="photo-edit-btn"
          onClick={handlePhotoChange}
        >
          사진 변경
        </button> */}
      </div>

      <div className="profile-info">
        <h2>{producer.farmName || producer.name}</h2>
        <p>{producer.email}</p>
        <p>{producer.phone}</p>
      </div>
    </div>
  )
}