import React, { useState } from "react";

export default function AwsTest() {
  const [productId, setProductId] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const { protocol, hostname } = window.location;
  const API_BASE = `${protocol}//${hostname}:8080`;

  // ⚠️ 필요하면 여기만 실제 업로드 엔드포인트로 바꾸면 됨
  const UPLOAD_ENDPOINT = ``;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const handleUploadAndInsert = async () => {
    if (!productId) {
      alert("product_id를 입력하세요.");
      return;
    }
    if (!file) {
      alert("이미지 파일을 선택하세요.");
      return;
    }

    setLoading(true);
    try {
      // 1) S3 업로드
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch('http://192.168.0.76:8080/api/images/upload', {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`이미지 업로드 실패: HTTP ${uploadRes.status}`);
      }

      const uploadData = await uploadRes.json(); // { url: "..." }
      const imageUrl = uploadData.url;
      setUploadedUrl(imageUrl);

      // 2) DB INSERT 호출 (product_id, image_url @RequestParam)
      const params = new URLSearchParams();
      params.append("product_id", productId);
      params.append("image_url", imageUrl);

      const insertRes = await fetch(`${API_BASE}/mypage/awstestInsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: params.toString(),
      });

      if (!insertRes.ok) {
        throw new Error(`DB INSERT 실패: HTTP ${insertRes.status}`);
      }

      alert("S3 업로드 + DB 저장 완료");
    } catch (e) {
      console.error(e);
      alert(e.message || "에러 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromDb = async () => {
    if (!productId) {
      alert("product_id를 입력하세요.");
      return;
    }

    setLoading(true);
    try {
      // @GetMapping("/mypage/awstestSelect/{product_id}")
      // @RequestParam("product_id") 으로 되어있으니 path + query 둘 다 넣어줌
      const res = await fetch(
        `${API_BASE}/mypage/awstestSelect?product_id=${productId}`
      );

      if (!res.ok) {
        throw new Error(`SELECT 실패: HTTP ${res.status}`);
      }

      const urlText = (await res.text()).trim();
      setSavedUrl(urlText);
    } catch (e) {
      console.error(e);
      alert(e.message || "에러 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>AWS S3 + OracleXE 이미지 테스트</h2>

      <div style={{ marginBottom: 16 }}>
        <label>
          product_id:&nbsp;
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            style={{ width: 120 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={handleUploadAndInsert} disabled={loading}>
          S3 업로드 + DB INSERT
        </button>
        &nbsp;
        <button type="button" onClick={handleSelectFromDb} disabled={loading}>
          DB에서 URL SELECT
        </button>
      </div>

      {loading && <p>처리 중...</p>}

      {uploadedUrl && (
        <div style={{ marginTop: 24 }}>
          <h3>1) 방금 업로드된 S3 URL</h3>
          <code style={{ wordBreak: "break-all" }}>{uploadedUrl}</code>
          <div style={{ marginTop: 8 }}>
            <img
              src={uploadedUrl}
              alt="uploaded"
              style={{ maxWidth: 200, border: "1px solid #ccc" }}
            />
          </div>
        </div>
      )}

      {savedUrl && (
        <div style={{ marginTop: 24 }}>
          <h3>2) DB에서 조회한 이미지 URL</h3>
          <code style={{ wordBreak: "break-all" }}>{savedUrl}</code>
          <div style={{ marginTop: 8 }}>
            <img
              src={savedUrl}
              alt="from-db"
              style={{ maxWidth: 200, border: "1px solid #ccc" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}