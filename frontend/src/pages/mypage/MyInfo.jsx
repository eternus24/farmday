// ==============================================
// frontend/src/pages/mypage/MyInfo.jsx
// ==============================================
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DaumPostcode from "react-daum-postcode";
import defaultAvatarImg from "../../assets/img/user-default1.png";

// 날짜 포맷함수 (MyPage에 있는 거랑 동일 로직)
function formatKoreanDateTime(str) {
  if (!str) return "";

  // "2025-11-24 16:51:02" or "2025-11-24T16:51:02" 둘 다 대비
  let datePart = "";
  let timePart = "";

  if (str.includes("T")) {
    const [d, t] = str.split("T");
    datePart = d;
    timePart = t.substring(0, 8); // HH:mm:ss
  } else {
    const [d, t] = str.split(" ");
    datePart = d;
    timePart = t;
  }

  if (!datePart || !timePart) return "";

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  const date = new Date(year, month - 1, day, hour, minute, second);

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];

  let h24 = date.getHours();
  const m = date.getMinutes();
  const period = h24 < 12 ? "오전" : "오후";

  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  const mm = date.getMonth() + 1;
  const dd = date.getDate();

  return `${mm}/${dd}(${weekday}) ${period} ${h12}시 ${m}분`;
}

// props: API_BASE, userId (MyPage에서 넘겨줄 예정)
export default function MyInfo({ API_BASE, userId }) {
  const API_AUTH_BASE = `${API_BASE}/api/auth`;
  const IMAGE_UPLOAD_URL = `http://192.168.0.76:8080/api/images/upload`;

  const [profile, setProfile] = useState({
    userId: "",
    name: "",
    phone: "",
    email: "",
    addr: "",
    birth: "",
    gender: "",
    role: "",
    createdDate: "",
    lastLoginAt: "",
    photo: "",
  });

  const [initialProfile, setInitialProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 프로필 사진 관련 상태
  const [photoFile, setPhotoFile] = useState(null); // 새로 업로드할 파일
  const [photoPreview, setPhotoPreview] = useState(""); // 화면에 보여줄 미리보기 URL

  // 주소 검색 모달 & 상세주소
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrDetail, setAddrDetail] = useState("");

  // ===== 프로필 조회 =====
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_AUTH_BASE}/user-info?user_id=${encodeURIComponent(userId)}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const mapped = {
          userId: data.userId || "",
          name: data.name || "",
          // DB에 010-1234-5678 로 들어있어도 숫자만 남기기
          phone: data.phone ? String(data.phone).replace(/\D/g, "") : "",
          email: data.email || "",
          addr: data.addr || "",
          birth:
            data.birth && String(data.birth).length >= 10
              ? String(data.birth).substring(0, 10)
              : "",
          gender: data.gender || "",
          role: data.role || "",
          createdDate: data.createdDate || data.created_date || "",
          lastLoginAt: data.lastLoginAt || data.last_login_at || "",
          photo: data.photo || "",
        };

        setProfile(mapped);
        setInitialProfile(mapped);
        setPhotoPreview(mapped.photo || defaultAvatarImg);
        setPhotoFile(null);

        // 기존 주소는 통째로 받아오니까, 상세주소는 일단 비워두자
        setAddrDetail("");
      } catch (e) {
        console.error("loadProfile error:", e);
        setError("내 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadProfile();
    }
  }, [API_AUTH_BASE, userId]);

  // ===== input 공통 변경 핸들러 =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;

    if (name === "phone") {
      // 숫자만 저장
      next = value.replace(/\D/g, "");
    }

    setProfile((prev) => ({
      ...prev,
      [name]: next,
    }));
  };

  // 프로필 사진 선택 핸들러
  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "",
        text: "이미지 파일만 선택할 수 있습니다.",
      });
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleReset = () => {
    if (initialProfile) {
      setProfile(initialProfile);
      setPhotoFile(null);
      setPhotoPreview(initialProfile.photo || defaultAvatarImg);
      setAddrDetail("");
    }
  };

  // ===== 저장 버튼 =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);

      // 1) 새 프로필 사진이 선택되어 있으면 먼저 업로드
      let photoUrl = profile.photo || "";
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);

        const uploadRes = await fetch(IMAGE_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const msg = await uploadRes.text();
          throw new Error(msg || "프로필 사진 업로드에 실패했습니다.");
        }

        const uploadJson = await uploadRes.json();
        // 업로드 응답 구조에 따라 키 후보 몇 개 시도
        photoUrl =
          uploadJson.url ||
          uploadJson.imageUrl ||
          uploadJson.location ||
          uploadJson.path ||
          photoUrl;
      }

      // 가입 때처럼: 기본주소 + 상세주소 합쳐서 DB에 저장
      const fullAddr = addrDetail
        ? `${profile.addr} ${addrDetail}`
        : profile.addr;

      const body = {
        name: profile.name,
        phone: profile.phone, // "01012345678"
        email: profile.email,
        addr: fullAddr,
        birth: profile.birth, // "YYYY-MM-DD"
        gender: profile.gender, // "M" / "F"
        photo: photoUrl,
      };

      const res = await fetch(
        `${API_AUTH_BASE}/user-info/${encodeURIComponent(userId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      // 🔄 localStorage loginUser 정보도 함께 업데이트
      const loginUserRaw = window.localStorage.getItem("loginUser");
      if (loginUserRaw) {
        try {
          const loginUser = JSON.parse(loginUserRaw);
          const updated = {
            ...loginUser,
            name: body.name,
            email: body.email,
            addr: body.addr,
            phone: body.phone,
            photo: photoUrl,
          };
          window.localStorage.setItem("loginUser", JSON.stringify(updated));
        } catch (e) {
          console.warn("update loginUser localStorage failed:", e);
        }
      }

      await Swal.fire({
        title: "",
        text: "내 정보가 수정되었습니다.",
        icon: "success",
        confirmButtonText: "확인",
      });

      const nextProfile = {
        ...profile,
        addr: fullAddr,
        photo: photoUrl,
      };
      setProfile(nextProfile);
      setInitialProfile(nextProfile);
      setPhotoFile(null);
      setPhotoPreview(photoUrl || defaultAvatarImg);
      setAddrDetail("");
    } catch (e) {
      console.error("update profile error:", e);
      await Swal.fire({
        title: "수정 실패",
        text: e.message || "잠시 후 다시 시도해 주세요.",
        icon: "error",
        confirmButtonText: "확인",
      });
    } finally {
      setSaving(false);
    }
  };

  const lastLoginText = formatKoreanDateTime(profile.lastLoginAt);
  const createdText = formatKoreanDateTime(profile.createdDate);

  // ===== 로딩 / 에러 처리 =====
  if (loading) {
    return (
      <div className="col-lg-8">
        <div className="bg-white rounded-3 shadow-sm p-4">
          내 정보를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-8">
        <div className="bg-white rounded-3 shadow-sm p-4 text-danger">
          {error}
        </div>
      </div>
    );
  }

  // ===== 메인 폼 =====
  return (
    <div className="col-lg-8">
      <div className="bg-white rounded-3 shadow-sm p-4">
        <h5 className="mb-3">내 정보 수정</h5>
        <p className="text-muted small mb-4">
          기본 회원 정보와 연락처, 주소, 프로필 사진을 수정할 수 있습니다. (아이디와
          가입일은 변경할 수 없습니다.)
        </p>

        {/* 프로필 사진 + 아이디 영역 (정중앙 정렬) */}
        <div className="d-flex flex-column align-items-center mb-4">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid #eee",
            }}
          >
            <img
              src={photoPreview || defaultAvatarImg}
              alt="프로필"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div className="mt-3 text-center">
            <div className="mb-1">
              <span className="small text-muted me-1">아이디</span>
              <strong>{profile.userId}</strong>
            </div>

            <div className="d-flex justify-content-center mt-2">
              <label className="btn btn-outline-secondary btn-sm mb-0">
                사진 선택
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </label>
            </div>

            {photoFile && (
              <div className="small text-muted mt-1">
                새 프로필 사진이 선택되었습니다. 저장하기를 눌러 적용됩니다.
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 이름 / 이메일 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">이름</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">이메일</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={profile.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 연락처 / 성별 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">연락처</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                placeholder="숫자만 입력 (예: 01012345678)"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label d-block">성별</label>
              <div className="d-flex align-items-center gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="genderM"
                    value="M"
                    checked={profile.gender === "M"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="genderM">
                    남성
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="genderF"
                    value="F"
                    checked={profile.gender === "F"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="genderF">
                    여성
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 주소 (가입 때처럼: 검색 + 상세주소) */}
          <div className="mb-3">
            <label className="form-label">주소</label>

            {/* 👉 커스텀 스타일용 클래스 추가 */}
            <div className="addr-row mb-2">
              <input
                type="text"
                className="form-control addr-input"
                name="addr"
                value={profile.addr}
                readOnly
                placeholder="주소 검색 버튼을 눌러 선택하세요"
              />
              <button
                type="button"
                className="btn addr-search-btn"
                onClick={() => setAddrModalOpen(true)}
              >
                주소 검색
              </button>
            </div>

            <input
              type="text"
              className="form-control"
              value={addrDetail}
              onChange={(e) => setAddrDetail(e.target.value)}
              placeholder="상세 주소 (동/호수 등)을 입력해주세요"
            />
          </div>

          {/* 생년월일 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">생년월일</label>
              <input
                type="date"
                className="form-control"
                name="birth"
                value={profile.birth}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 메타 정보 */}
          <div className="border-top pt-3 mt-3 mb-3 small text-muted">
            <div>가입일: {createdText || profile.createdDate || "-"}</div>
            <div>마지막 로그인: {lastLoginText || profile.lastLoginAt || "-"}</div>
          </div>

          {/* 버튼 영역 */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleReset}
              disabled={saving}
            >
              변경 내용 초기화
            </button>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 주소 검색 모달 */}
      {addrModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.35)", zIndex: 1050 }}
        >
          <div
            className="bg-white rounded-3 shadow p-3"
            style={{ width: "100%", maxWidth: 520, maxHeight: "80vh" }}
          >
            <h6 className="mb-3">주소 검색</h6>
            <DaumPostcode
              onComplete={(data) => {
                const addr = data.roadAddress || data.jibunAddress;
                setProfile((prev) => ({ ...prev, addr }));
                setAddrModalOpen(false);
              }}
              style={{ width: "100%", height: "400px" }}
            />
            <div className="d-flex justify-content-end mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setAddrModalOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}