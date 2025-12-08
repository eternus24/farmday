// 경로: frontend/src/pages/groupdeal/GroupDealManagePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// ✅ 생산자 대시보드 API
import {
  getProducerGroupDealDashboard,
} from "../../api/groupDealApi";

// 배송/진행 상태 관련 컴포넌트만 사용
import BarProgress from "./components/BarProgress";
import DeliveryStatusSection from "./components/DeliveryStatusSection";
import ParticipantListSection from "./components/ParticipantListSection";

const GroupDealManagePage = () => {
  const { groupDealId } = useParams();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 공동구매 대시보드 데이터 로딩
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProducerGroupDealDashboard(groupDealId);

        if (!data) {
          setError("공동구매 정보를 찾을 수 없습니다.");
        } else {
          setDeal(data);
        }
      } catch (e) {
        console.error(e);
        setError("공동구매 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [groupDealId]);


  if (loading) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <p className="text-center text-muted py-5">불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <div className="alert alert-danger my-5 text-center">{error}</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <p className="text-center text-muted py-5">
          공동구매 정보를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  const currentQty = deal.currentQuantity ?? 0;
  const minQty = deal.minMemberCount ?? 0;

  return (
    <div
      className="container"
      style={{
        marginTop: 120,
        marginBottom: 80,
        maxWidth: 1180,
      }}
    >
      {/* 배송/진행 상태 관리 */}
      <div className="mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom" style={{ padding: "1rem 1.5rem" }}>
            <h5 className="mb-0" style={{ fontWeight: 700 }}>
              🚚 배송/진행 상태 관리
            </h5>
            <small className="text-muted">현재 모집 진행률, 참여자, 발송 상태를 관리합니다.</small>
          </div>
          <div className="card-body" style={{ padding: "1.5rem" }}>
            <div className="mb-4">
              <BarProgress currentQuantity={currentQty} minMemberCount={minQty} />
            </div>

            <div className="row g-3">
              <div className="col-12 col-lg-6">
                <ParticipantListSection participants={deal.participants || []} />
              </div>
              <div className="col-12 col-lg-6">
                <DeliveryStatusSection
                  status={deal.status}
                  onChangeStatus={(next) => {
                    // 실제 API 연동은 나중에 연결
                    window.alert(
                      `상태를 "${deal.status}" 에서 "${next}" 로 변경하는 API를 연동해주세요.`
                    );
                    setDeal((prev) => ({ ...prev, status: next }));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDealManagePage;