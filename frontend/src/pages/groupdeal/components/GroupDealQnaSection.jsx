// 경로: frontend/src/pages/groupdeal/components/GroupDealQnaSection.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  fetchGroupDealQnaList,
  createGroupDealQna,
  deleteGroupDealQna,
  updateGroupDealQna,
} from "../../../api/groupDealQnaApi";

// ✅ 이 파일에서만 쓸 QnA 스타일 모음
const qnaStyles = {
  // 리스트
  row: {
    borderBottom: "1px solid #f1f3f5",
    transition: "background-color 0.15s ease",
  },
  rowHover: {
    backgroundColor: "#fafafa",
  },
  summaryRow: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  detailBox: {
    backgroundColor: "#fcfcff",
  },
  privateMsg: {
    fontSize: "0.85rem",
    color: "#6b7280",
  },

  // 모달
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
  },
  modal: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 15px 40px rgba(15,23,42,0.25)",
    overflow: "hidden",
    fontFamily:
      '"Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },
  modalHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    background: "linear-gradient(90deg, #f8fff0 0%, #ffffff 60%)",
  },
  modalHeaderTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  modalBody: {
    padding: "18px 20px 12px",
  },
  modalFooter: {
    padding: "12px 20px 16px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },

  // 폼
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6,
  },
  formInput: {
    width: "100%",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "9px 11px",
    fontSize: 13,
    outline: "none",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "9px 11px",
    fontSize: 13,
    outline: "none",
    resize: "vertical",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },
  charCount: {
    marginTop: 4,
    fontSize: 11,
    textAlign: "right",
    color: "#9ca3af",
  },
  privateCheck: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
    cursor: "pointer",
  },

  // 버튼
  btnCancel: {
    minWidth: 88,
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 13,
    border: "1px solid #d1d5db",
    cursor: "pointer",
    backgroundColor: "#f9fafb",
    color: "#4b5563",
  },
  btnSubmit: {
    minWidth: 88,
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 13,
    border: "1px solid #89c700",
    cursor: "pointer",
    backgroundColor: "#a6e000",
    color: "#ffffff",
    fontWeight: 600,
  },
};

const GroupDealQnaSection = ({ deal }) => {
  const { auth } = useContext(AuthContext);

  const [qnaList, setQnaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const loginUserId = loginUser?.userId;
  const userRole = auth?.role;

  // 🔹 QnA 로딩 함수
  const loadQna = async () => {
    if (!deal?.groupDealId) return;
    try {
      setLoading(true);
      const data = await fetchGroupDealQnaList(deal.groupDealId);

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.qnaList)) {
        list = data.qnaList;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      } else {
        console.warn("❗ 예기치 않은 QnA 응답 형식:", data);
      }

      setQnaList(list);
    } catch (e) {
      console.error("❌ 공동구매 QnA 조회 실패:", e);
      setQnaList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQna();
  }, [deal?.groupDealId]);

  const toggleOpen = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleDelete = async (qnaId) => {
    if (!window.confirm("해당 문의를 삭제하시겠어요?")) return;
    try {
      await deleteGroupDealQna(qnaId);
      alert("문의가 삭제되었습니다.");
      loadQna();
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const maskUser = (id) => {
    if (!id) return "-";
    const s = String(id);
    return s.replace(/(?<=.{2})./g, "*");
  };

  return (
    <div className="py-3 small">
      {/* 안내 문구 */}
      <p className="mb-2 fw-semibold">공동구매 Q&A 안내</p>
      <p className="mb-2">
        상품 정보, 배송, 교환/환불 등 공동구매 이용과 관련된 내용을 문의해 주세요.
        정확한 안내를 위해 주문 정보 확인이 필요할 수 있습니다.
      </p>
      <ul className="mb-3 ps-3">
        <li className="mb-1">
          연락처, 계좌번호, 주소 등 개인정보는 문의글에 남기지 않도록 유의해주세요.
        </li>
        <li className="mb-1">
          상품 상태 문의 시 수령일과 보관 환경을 함께 적어주시면 더 빠른 안내가 가능합니다.
        </li>
      </ul>

      {/* 상단 액션 */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="fw-semibold">
          상품 Q&A{" "}
          <span className="text-muted">
            ({Array.isArray(qnaList) ? qnaList.length : 0})
          </span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          onClick={() => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
              alert("로그인 후 이용 가능한 서비스입니다.");
              window.location.href = "/login";
              return;
            }
            setShowWriteModal(true);
          }}
        >
          문의 작성하기
        </button>
      </div>

      {/* PC 헤더 */}
      <div
        className="d-none d-md-flex border-top border-bottom py-2 text-muted"
        style={{ fontSize: "0.78rem" }}
      >
        <div style={{ width: 60 }}>상태</div>
        <div className="flex-grow-1">제목</div>
        <div style={{ width: 90 }} className="text-center">
          작성자
        </div>
        <div style={{ width: 100 }} className="text-center">
          작성일
        </div>
      </div>

      {/* 로딩 / 빈 리스트 */}
      {loading && (
        <div className="py-4 text-center text-muted small">
          문의 목록을 불러오는 중입니다.
        </div>
      )}

      {!loading &&
        (!Array.isArray(qnaList) || qnaList.length === 0) && (
          <div className="py-4 text-center text-muted small">
            아직 등록된 문의가 없습니다. 궁금한 점을 남겨보세요.
          </div>
        )}

      {/* 리스트 */}
      <div className="border-top">
        {Array.isArray(qnaList) &&
          qnaList.map((q) => {
            const isOpen = openId === q.qnaId;

            const canView =
              q.isPrivate !== "Y" ||
              String(q.userId) === String(loginUserId) ||
              userRole === "ADMIN" ||
              userRole === "PRODUCER";

            return (
              <div
                key={q.qnaId}
                className="qna-row"
                style={qnaStyles.row}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fafafa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {/* 요약 줄 */}
                <div
                  className="d-flex flex-column flex-md-row align-items-start align-items-md-center py-2 qna-summary-row"
                  onClick={() => toggleOpen(q.qnaId)}
                  style={{ ...qnaStyles.summaryRow, cursor: "pointer" }}
                >
                  <div
                    className="mb-1 mb-md-0"
                    style={{ width: 60, fontSize: "0.78rem" }}
                  >
                    {q.status === "ANSWERED" ? (
                      <span className="badge bg-success-subtle text-success fw-semibold">
                        답변 완료
                      </span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-muted fw-semibold">
                        답변 대기
                      </span>
                    )}
                  </div>

                  <div className="flex-grow-1">
                    {!canView ? (
                      <>
                        <span className="me-1">🔒</span>
                        <span className="fw-semibold small">
                          비공개로 등록된 문의입니다.
                        </span>
                      </>
                    ) : (
                      <span className="fw-semibold small">{q.title}</span>
                    )}
                    <div className="d-md-none text-muted small mt-1">
                      {maskUser(q.userId)} ·{" "}
                      {q.createdDate ? q.createdDate.slice(0, 10) : ""}
                    </div>
                  </div>

                  {/* 작성자 / 날짜 (PC) */}
                  <div className="d-none d-md-flex text-muted small ms-3">
                    <div style={{ width: 90 }} className="text-center">
                      {maskUser(q.userId)}
                    </div>
                    <div style={{ width: 100 }} className="text-center">
                      {q.createdDate ? q.createdDate.slice(0, 10) : ""}
                    </div>
                  </div>
                </div>

                {/* 펼침 영역 */}
                {isOpen && (
                  <div
                    className="qna-detail-box border-top py-3 px-2 px-md-3"
                    style={qnaStyles.detailBox}
                  >
                    {!canView ? (
                      <div className="qna-private-msg" style={qnaStyles.privateMsg}>
                        🔒 작성자 본인과 운영자만 확인할 수 있는 문의입니다.
                      </div>
                    ) : (
                      <>
                        {/* Q */}
                        <div className="d-flex mb-2">
                          <div
                            className="me-2 d-flex align-items-start justify-content-center"
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "999px",
                              backgroundColor: "#e5f7ec",
                              color: "#15803d",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            Q
                          </div>
                          <div
                            className="small"
                            style={{ whiteSpace: "pre-line" }}
                          >
                            {q.content}
                          </div>
                        </div>

                        {/* A */}
                        {q.answerContent && (
                          <div className="d-flex mt-2">
                            <div
                              className="me-2 d-flex align-items-start justify-content-center"
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "999px",
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                              }}
                            >
                              A
                            </div>
                            <div
                              className="small"
                              style={{
                                whiteSpace: "pre-line",
                                color: "#111827",
                              }}
                            >
                              {q.answerContent}
                            </div>
                          </div>
                        )}

                        {/* 내 글이면 수정/삭제 */}
                        {String(q.userId) === String(loginUserId) && (
                          <div className="mt-3 d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTarget(q);
                              }}
                            >
                              문의 수정
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(q.qnaId);
                              }}
                            >
                              문의 삭제
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* 작성 모달 */}
      {showWriteModal && (
        <GroupDealQnaWriteModal
          deal={deal}
          onClose={() => setShowWriteModal(false)}
          onSubmitted={loadQna}
        />
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <GroupDealQnaEditModal
          qna={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmitted={() => {
            setEditTarget(null);
            loadQna();
          }}
        />
      )}
    </div>
  );
};

export default GroupDealQnaSection;

/* ───────────── 작성 모달 ───────────── */

const GroupDealQnaWriteModal = ({ deal, onClose, onSubmitted }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("문의 제목을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      alert("문의 내용을 입력해 주세요.");
      return;
    }

    try {
      await createGroupDealQna(deal.groupDealId, {
        title,
        content,
        isPrivate: isPrivate ? "Y" : "N",
      });
      alert("문의가 등록되었습니다.");
      onSubmitted?.();
      onClose();
    } catch (e) {
      console.error("❌ 문의 등록 에러:", e);
      console.error("백엔드 응답 전체:", e.response);

      const backendMessage =
        e?.response?.data ||
        e?.message ||
        "문의 등록 중 문제가 발생했습니다. 잠시 후 다시 이용해 주세요.";

      alert(backendMessage);
    }
  };

  return (
    <div style={qnaStyles.modalBackdrop} onClick={onClose}>
      <div
        style={{ ...qnaStyles.modal, maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={qnaStyles.modalHeader}>
          <h3 style={qnaStyles.modalHeaderTitle}>공동구매 상품 문의 작성</h3>
        </div>
        <div style={qnaStyles.modalBody}>
          <div style={qnaStyles.formGroup}>
            <label style={qnaStyles.formLabel}>제목</label>
            <input
              style={qnaStyles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 배송 일정 문의드립니다."
            />
          </div>

          <div style={qnaStyles.formGroup}>
            <label style={qnaStyles.formLabel}>내용</label>
            <textarea
              style={qnaStyles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="문의하실 내용을 자세히 입력해 주세요."
            />
            <div style={qnaStyles.charCount}>{content.length} / 1000</div>
          </div>

          <label style={qnaStyles.privateCheck}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate((v) => !v)}
            />
            <span className="ms-1">비공개 문의로 등록할게요</span>
          </label>
        </div>

        <div style={qnaStyles.modalFooter}>
          <button style={qnaStyles.btnCancel} onClick={onClose}>
            닫기
          </button>
          <button style={qnaStyles.btnSubmit} onClick={handleSubmit}>
            문의 등록
          </button>
        </div>
      </div>
    </div>
  );
};

/* ───────────── 수정 모달 ───────────── */

const GroupDealQnaEditModal = ({ qna, onClose, onSubmitted }) => {
  const [title, setTitle] = useState(qna.title || "");
  const [content, setContent] = useState(qna.content || "");
  const [isPrivate, setIsPrivate] = useState(qna.isPrivate === "Y");

  const handleSave = async () => {
    if (!title.trim()) {
      alert("문의 제목을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      alert("문의 내용을 입력해 주세요.");
      return;
    }

    try {
      await updateGroupDealQna(qna.qnaId, {
        title,
        content,
        isPrivate: isPrivate ? "Y" : "N",
      });
      alert("문의 내용이 수정되었습니다.");
      onSubmitted?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert("문의 수정 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div style={qnaStyles.modalBackdrop} onClick={onClose}>
      <div
        style={{ ...qnaStyles.modal, maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={qnaStyles.modalHeader}>
          <h3 style={qnaStyles.modalHeaderTitle}>공동구매 문의 수정</h3>
        </div>
        <div style={qnaStyles.modalBody}>
          <div style={qnaStyles.formGroup}>
            <label style={qnaStyles.formLabel}>제목</label>
            <input
              style={qnaStyles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={qnaStyles.formGroup}>
            <label style={qnaStyles.formLabel}>내용</label>
            <textarea
              style={qnaStyles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div style={qnaStyles.charCount}>{content.length} / 1000</div>
          </div>

          <label style={qnaStyles.privateCheck}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate((v) => !v)}
            />
            <span className="ms-1">비공개 문의로 유지합니다</span>
          </label>
        </div>

        <div style={qnaStyles.modalFooter}>
          <button style={qnaStyles.btnCancel} onClick={onClose}>
            닫기
          </button>
          <button style={qnaStyles.btnSubmit} onClick={handleSave}>
            수정 완료
          </button>
        </div>
      </div>
    </div>
  );
};