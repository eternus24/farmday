// src/pages/producer/ProducerGroupDealManagePage.jsx
// 생산자 마이페이지 - 공동구매 관리 전용
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import {
  getMyGroupDeals,
  stopGroupDeal,
  deleteGroupDeal,
} from "../../api/groupDealApi";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProducerGroupDealManagePage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const [myGroupDeals, setMyGroupDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth?.loggedIn) {
      setLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    fetchMyGroupDeals();
  }, [auth?.loggedIn]);

  const fetchMyGroupDeals = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getMyGroupDeals();
      setMyGroupDeals(list || []);
    } catch (err) {
      console.error("내 모집글 조회 오류:", err);
      setError("모집글을 불러오는 중 오류가 발생했습니다.");
      setMyGroupDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // 모집글 중단 처리
  const handleStopGroupDeal = async (groupDealId, title) => {
    const result = await Swal.fire({
      title: "모집글 중단",
      text: `"${title}" 모집글을 중단하시겠습니까?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "중단",
      cancelButtonText: "취소",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      try {
        await stopGroupDeal(groupDealId, "STOPPED");
        Swal.fire("중단 완료", "모집글이 중단되었습니다.", "success");
        fetchMyGroupDeals();
      } catch (err) {
        console.error("모집글 중단 오류:", err);
        Swal.fire("오류", "모집글 중단에 실패했습니다.", "error");
      }
    }
  };

  // 모집글 삭제 처리
  const handleDeleteGroupDeal = async (groupDealId, title) => {
    const result = await Swal.fire({
      title: "모집글 삭제",
      text: `"${title}" 모집글을 삭제하시겠습니까? 삭제된 모집글은 복구할 수 없습니다.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      try {
        await deleteGroupDeal(groupDealId);
        Swal.fire("삭제 완료", "모집글이 삭제되었습니다.", "success");
        fetchMyGroupDeals();
      } catch (err) {
        console.error("모집글 삭제 오류:", err);
        Swal.fire("오류", "모집글 삭제에 실패했습니다.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>모집글을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* 상단 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            내가 올린 공동구매 목록
          </h2>
          <p style={{ margin: "8px 0 0 0", color: "#666" }}>
            공동구매를 관리하고 소비자 질문에 답변하세요
          </p>
        </div>
        <button
          onClick={() => navigate("/groupdeal/new")}
          style={{
            padding: "10px 20px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          + 공동구매 신규 등록
        </button>
      </div>

      {/* 모집글 목록 */}
      {myGroupDeals.length > 0 ? (
        <div style={{ display: "grid", gap: "20px" }}>
          {myGroupDeals.map((gd) => {
            const progress =
              gd.minMemberCount > 0
                ? Math.round((gd.currentQuantity / gd.minMemberCount) * 100)
                : 0;
            const isSuccess = progress >= 100;
            const isClosed = gd.status !== "OPEN";

            return (
              <div
                key={gd.groupDealId}
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* 왼쪽: 모집글 정보 */}
                  <div style={{ flex: 1, minWidth: "300px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "15px",
                        marginBottom: "15px",
                      }}
                    >
                      {gd.thumbnailImageUrl && (
                        <img
                          src={`${API_BASE}${gd.thumbnailImageUrl}`}
                          alt={gd.title}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #e0e0e0",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          {gd.title}
                        </h3>
                        {gd.subTitle && (
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            {gd.subTitle}
                          </p>
                        )}
                        <div style={{ fontSize: "14px", color: "#666" }}>
                          <div>
                            공동구매가:{" "}
                            <strong style={{ color: "#28a745", fontSize: "16px" }}>
                              {gd.dealPrice?.toLocaleString()}원
                            </strong>
                            {gd.originPrice && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  marginLeft: "8px",
                                  color: "#999",
                                }}
                              >
                                {gd.originPrice.toLocaleString()}원
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 진행률 */}
                    <div style={{ marginTop: "15px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: "600" }}>
                          모집 진행률
                        </span>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: isSuccess ? "#28a745" : "#007bff",
                          }}
                        >
                          {progress}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "24px",
                          background: "#e9ecef",
                          borderRadius: "12px",
                          overflow: "hidden",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            height: "100%",
                            background: isSuccess ? "#28a745" : "#007bff",
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "13px",
                          color: "#666",
                        }}
                      >
                        <span>
                          현재: {gd.currentQuantity || 0}명 / 목표:{" "}
                          {gd.minMemberCount || 0}명
                        </span>
                        {isSuccess && (
                          <span style={{ color: "#28a745", fontWeight: "600" }}>
                            모집 성공! 🎉
                          </span>
                        )}
                        {isClosed && !isSuccess && (
                          <span style={{ color: "#856404", fontWeight: "600" }}>
                            모집 마감
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 상태 및 날짜 */}
                    <div
                      style={{
                        marginTop: "12px",
                        display: "flex",
                        gap: "15px",
                        flexWrap: "wrap",
                        fontSize: "13px",
                        color: "#666",
                      }}
                    >
                      <div>
                        상태:{" "}
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            backgroundColor:
                              gd.status === "OPEN"
                                ? "#d4edda"
                                : gd.status === "STOPPED"
                                ? "#fff3cd"
                                : "#f8d7da",
                            color:
                              gd.status === "OPEN"
                                ? "#155724"
                                : gd.status === "STOPPED"
                                ? "#856404"
                                : "#721c24",
                            fontWeight: "600",
                          }}
                        >
                          {gd.status === "OPEN"
                            ? "진행 중"
                            : gd.status === "STOPPED"
                            ? "중단됨"
                            : gd.status || "알 수 없음"}
                        </span>
                      </div>
                      {gd.endAt && (
                        <div>
                          마감일: {new Date(gd.endAt).toLocaleDateString("ko-KR")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽: 액션 버튼 */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      minWidth: "150px",
                    }}
                  >
                    <button
                      onClick={() => navigate(`/groupdeal/${gd.groupDealId}/manage`)}
                      style={{
                        padding: "10px 16px",
                        border: "1px solid #007bff",
                        background: "#007bff",
                        color: "#fff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      발송 처리 관리
                    </button>
                    <button
                      onClick={() => navigate(`/groupdeal/${gd.groupDealId}`)}
                      style={{
                        padding: "10px 16px",
                        border: "1px solid #6c757d",
                        background: "#fff",
                        color: "#6c757d",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      모집글 보기
                    </button>
                    <button
                      onClick={() => navigate(`/groupdeal/${gd.groupDealId}/edit`)}
                      style={{
                        padding: "10px 16px",
                        border: "1px solid #28a745",
                        background: "#fff",
                        color: "#28a745",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      모집글 수정
                    </button>
                    {gd.status === "OPEN" && (
                      <button
                        onClick={() => handleStopGroupDeal(gd.groupDealId, gd.title)}
                        style={{
                          padding: "10px 16px",
                          border: "1px solid #ffc107",
                          background: "#fff",
                          color: "#856404",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        모집글 중단
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGroupDeal(gd.groupDealId, gd.title)}
                      style={{
                        padding: "10px 16px",
                        border: "1px solid #dc3545",
                        background: "#fff",
                        color: "#dc3545",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      모집글 삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "#f8f9fa",
            borderRadius: "8px",
            border: "2px dashed #dee2e6",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📝</div>
          <h3 style={{ marginBottom: "10px", color: "#495057" }}>
            아직 작성한 모집글이 없습니다
          </h3>
          <p style={{ marginBottom: "20px", color: "#6c757d" }}>
            첫 번째 공동구매 모집글을 작성해보세요!
          </p>
          <button
            onClick={() => navigate("/groupdeal/new")}
            style={{
              padding: "12px 24px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            + 공동구매 신규 등록하기
          </button>
        </div>
      )}
    </div>
  );
}