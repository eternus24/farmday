// src/components/producer/ProducerProfileCard.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProducerProfileCard({ producer }) {
  if (!producer) return null; // 혹은 로딩 UI

  const handlePhotoChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const rawToken =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token");

        if (!rawToken) {
          alert("로그인이 필요합니다.");
          return;
        }

        const token = rawToken.startsWith("Bearer ")
          ? rawToken
          : `Bearer ${rawToken}`;

        const response = await fetch(
          `${API_BASE}/api/producer/me/photo`,
          {
            method: "PATCH",
            headers: {
              Authorization: token,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          alert("프로필 변경에 실패했습니다.");
          return;
        }

        alert("프로필 사진이 변경되었어요!");
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    };

    input.click();
  };

  // ✅ 이름: 농장이름 → 사업장이름(bizName) → 유저이름(userName/name) 순으로 fallback
  const displayName =
    producer.farmName ||
    producer.bizName ||
    producer.userName ||
    producer.name ||
    "이름 정보 없음";

  // ✅ 이메일: email 또는 userEmail
  const displayEmail = producer.email || producer.userEmail || "-";

  // ✅ 전화: USERS.phone 또는 PRODUCER.bizPhone 둘 다 케이스 커버
  const displayPhone = producer.phone || producer.bizPhone || "-";

  // ✅ 사진 경로: photoUrl 또는 photo 둘 다 받아보기
  const photoPath = producer.photoUrl || producer.photo;
  const photoSrc = photoPath
    // eslint-disable-next-line react-hooks/purity
    ? `${API_BASE}${photoPath}?t=${Date.now()}`
    : "/default-profile.png";

  return (
    <div className="producer-profile-card">
      <div
        className="profile-photo-wrap"
        onClick={handlePhotoChange}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handlePhotoChange();
          }
        }}
      >
        <img
          src={photoSrc}
          alt="프로필"
          className="profile-photo"
        />
      </div>

      <div className="profile-info">
        <h2>{displayName}</h2>
        <p>{displayEmail}</p>
        <p>{displayPhone}</p>
      </div>
    </div>
  );
}