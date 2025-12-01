// 경로: frontend/src/pages/groupdeal/write/ImageUploadBox.jsx

import React, { useRef, useState } from "react";
import { uploadGroupDealImage } from "../../../api/groupDealApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ImageUploadBox = ({ onAddImage }) => {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 로컬 미리보기 먼저 표시
    setPreview(URL.createObjectURL(file));

    try {
      // 백엔드로 이미지 업로드 (multipart/form-data)
      // 응답: { imageUrl: "/uploads/groupdeal/파일명" }
      const { imageUrl } = await uploadGroupDealImage(file);

      // 부모 컴포넌트로는 DB 에 저장할 imageUrl(상대 경로) 전달
      // 예: "/uploads/groupdeal/groupdeal-uuid.jpg"
      onAddImage(imageUrl);

      // 서버에 올라간 실제 이미지 기준으로 미리보기 교체하고 싶으면 아래 사용
      // setPreview(`${API_BASE_URL}${imageUrl}`);
    } catch (err) {
      console.error(err);
      alert("이미지 업로드 중 오류가 발생했습니다.");
      // 실패 시 미리보기 초기화
      setPreview(null);
    }
  };

  return (
    <div style={styles.box} onClick={() => fileRef.current.click()}>
      {preview ? (
        <img src={preview} alt="" style={styles.preview} />
      ) : (
        <div style={styles.message}>+ 이미지 추가</div>
      )}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileRef}
        onChange={handleFile}
      />
    </div>
  );
};

const styles = {
  box: {
    width: "100%",
    height: "200px",
    border: "2px dashed #4CAF50",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: "20px",
    color: "#4CAF50",
    fontWeight: "700",
  },
  preview: {
    height: "100%",
    borderRadius: "10px",
  },
};

export default ImageUploadBox;
