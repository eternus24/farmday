// 경로: frontend/src/pages/groupdeal/GroupDealManagePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// 🔹 생산자 대시보드 API
import { getProducerGroupDealDashboard } from "../../api/groupDealApi";

// 🔹 공동구매 QnA API (리스트 + 답변 관련)
import {
  fetchGroupDealQnaList,
  answerGroupDealQna, // 최초 답변 등록
  updateGroupDealQnaAnswer, // 답변 수정
  deleteGroupDealQnaAnswer, // 답변 삭제
} from "../../api/groupDealQnaApi";

// 🔹 문의 UI
import QASection from "./components/QASection";

// ===== 공통 레이아웃 =====
const PageWrapper = ({ children }) => (
  <div
    style={{
      backgroundColor: "#ffffff", // 전체 배경 흰색
      minHeight: "100vh",
    }}
  >
    {/* 애니메이션 CSS */}
    <style>
      {`
        @keyframes textPop {
          0% { transform: scale(1); opacity: 0.7; }
          40% { transform: scale(1.12); opacity: 1; }
          70% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }

        .pulse-text {
          animation: textPop 1.5s ease-in-out infinite;
          display: inline-block;
          transform-origin: center;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }
      `}
    </style>

    <div
      className="container"
      style={{
        paddingTop: 80,
        paddingBottom: 80,
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  </div>
);

const GroupDealManagePage = () => {
  const { groupDealId } = useParams();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 데이터 로드 (공동구매 상세 + QnA 리스트 둘 다)
  const fetchDetail = async () => {
    setLoading(true);
    setError("");
    try {
      // 🔹 대시보드용 상세 + QnA 리스트를 함께 호출
      const [dealData, qnaRes] = await Promise.all([
        getProducerGroupDealDashboard(groupDealId),
        fetchGroupDealQnaList(groupDealId).catch((e) => {
          console.error("QnA 리스트 조회 실패:", e);
          return null;
        }),
      ]);

      if (!dealData) {
        setError("공동구매 정보를 찾을 수 없습니다.");
        setDeal(null);
        return;
      }

      // 🔹 QnA 응답을 정규화해서 QASection에서 쓰기 좋은 형태로 변환
      let normalizedQuestions = [];

      if (qnaRes) {
        let list = [];

        if (Array.isArray(qnaRes)) {
          list = qnaRes;
        } else if (Array.isArray(qnaRes?.qnaList)) {
          list = qnaRes.qnaList;
        } else if (Array.isArray(qnaRes?.content)) {
          list = qnaRes.content;
        } else {
          console.warn("❗ 예기치 않은 QnA 응답 형식:", qnaRes);
        }

        normalizedQuestions = (list || []).map((q) => {
          const title = q.title || "";
          const content = q.content || q.question || "";

          // 제목 + 내용 한 번에 보이도록 question 필드에 합치기
          const mergedQuestion =
            title && content
              ? `${title}\n${content}`
              : title || content || "";

          return {
            // QASection에서 사용하는 기본 필드들
            questionId: q.qnaId || q.id || q.questionId,
            question: mergedQuestion,
            answer: q.answerContent || q.answer || "",

            // 혹시 모를 확장을 위해 원본도 같이 보관
            raw: q,
          };
        });
      } else {
        // QnA API가 실패했으면, 백엔드에서 내려준 기존 questions 그대로 사용 (fallback)
        normalizedQuestions = dealData.questions || [];
      }

      // 🔹 deal 객체에 questions를 덮어씌워서 저장
      setDeal({
        ...dealData,
        questions: normalizedQuestions,
      });
    } catch (e) {
      console.error(e);
      setError("공동구매 정보를 불러오지 못했습니다.");
      setDeal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [groupDealId]);

  // 🔹 답변 등록
  const handleAnswerQuestion = async (questionId) => {
    if (!questionId) {
      alert("질문 ID가 없습니다.");
      return;
    }

    const answer = window.prompt("답변 내용을 입력해 주세요.");
    if (answer == null) return;
    if (!answer.trim()) {
      alert("답변 내용을 입력해 주세요.");
      return;
    }

    try {
      await answerGroupDealQna(questionId, { answerContent: answer });
      alert("답변이 등록되었습니다.");
      fetchDetail();
    } catch (e) {
      console.error("답변 등록 실패:", e);
      alert(
        e?.response?.data ||
          "문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // 🔹 답변 수정
  const handleEditAnswer = async (questionId, currentAnswer) => {
    if (!questionId) {
      alert("질문 ID가 없습니다.");
      return;
    }

    const next = window.prompt(
      "수정할 답변 내용을 입력해 주세요.",
      currentAnswer || ""
    );
    if (next == null) return;
    if (!next.trim()) {
      alert("답변 내용을 입력해 주세요.");
      return;
    }

    try {
      await updateGroupDealQnaAnswer(questionId, { answerContent: next });
      alert("답변이 수정되었습니다.");
      fetchDetail();
    } catch (e) {
      console.error("답변 수정 실패:", e);
      alert(
        e?.response?.data ||
          "문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // 🔹 답변 삭제
  const handleDeleteAnswer = async (questionId) => {
    if (!questionId) {
      alert("질문 ID가 없습니다.");
      return;
    }

    const ok = window.confirm("해당 답변을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await deleteGroupDealQnaAnswer(questionId);
      alert("답변이 삭제되었습니다.");
      fetchDetail();
    } catch (e) {
      console.error("답변 삭제 실패:", e);
      alert(
        e?.response?.data ||
          "문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // ===== UI 상태 처리 =====
  if (loading) {
    return (
      <PageWrapper>
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            fontSize: 15,
            color: "#777",
          }}
        >
          불러오는 중입니다...
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div
          style={{
            padding: "40px 24px",
            borderRadius: 18,
            backgroundColor: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            textAlign: "center",
            fontSize: 15,
            color: "#c53030",
            border: "1px solid #ffe0e0",
          }}
        >
          {error}
        </div>
      </PageWrapper>
    );
  }

  if (!deal) {
    return (
      <PageWrapper>
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            fontSize: 15,
            color: "#777",
          }}
        >
          공동구매 정보를 찾을 수 없습니다.
        </div>
      </PageWrapper>
    );
  }

  const questionCount = deal.questions?.length || 0;

  // ===== UI 렌더링 =====
  return (
    <PageWrapper>
      {/* 상단 타이틀 영역 */}
      <div style={{ marginBottom: 24 }}>
        <h2
          className="pulse-text fade-in-up"
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
            color: "#0b6b3a",
            letterSpacing: "-0.3px",
          }}
        >
          💬 문의·답변 관리
        </h2>
        <p
          className="fade-in-up"
          style={{
            animationDelay: "0.2s",
            fontSize: 14,
            color: "#777",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          소비자 질문에 답변을 남기면 구매 결정까지 더 빠르게 이어져요 😊
        </p>
      </div>

      {/* 문의 관리 카드 */}
      <div
        className="card border-0"
        style={{
          borderRadius: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <div
          className="card-header bg-white"
          style={{
            padding: "18px 24px 14px",
            borderBottom: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>🗨️</span>
              <span>고객 질문 &amp; 답변</span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#999",
                marginTop: 4,
              }}
            >
              들어온 질문에 답변을 남겨주세요.
            </div>
          </div>

          <div
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              backgroundColor: "rgba(11, 107, 58, 0.06)",
              fontSize: 12,
              fontWeight: 600,
              color: "#0b6b3a",
              whiteSpace: "nowrap",
            }}
          >
            문의 {questionCount}건
          </div>
        </div>

        {/* 내용 영역 */}
        <div
          className="card-body"
          style={{
            padding: "4px 24px 24px",
          }}
        >
          <QASection
            qaList={deal.questions || []}
            onAnswer={handleAnswerQuestion}
            onEditAnswer={handleEditAnswer}
            onDeleteAnswer={handleDeleteAnswer}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default GroupDealManagePage;