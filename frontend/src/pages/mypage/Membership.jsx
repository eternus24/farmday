// src/pages/mypage/Membership.jsx
import { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const GRADE_BENEFITS = [
  {
    name: "새싹단골",
    range: "0 ~ 49,999원",
    pointRate: 1, // 1% 적립
    shipping: "무료배송 쿠폰 없음",
    desc: "첫 구매부터 부담 없이 시작하는 기본 등급이에요.",
  },
  {
    name: "단골",
    range: "50,000 ~ 149,999원",
    pointRate: 3, // 3% 적립
    shipping: "무료배송 쿠폰 없음",
    desc: "자주 찾아주는 고객님을 위한 실속 할인 등급이에요.",
  },
  {
    name: "단골VIP",
    range: "150,000 ~ 299,999원",
    pointRate: 5, // 5% 적립
    shipping: "무료배송 쿠폰 1장/월",
    desc: "신선식품을 꾸준히 구매하는 고객님께 더 큰 혜택을 드려요.",
  },
  {
    name: "단골패밀리",
    range: "300,000원 이상",
    pointRate: 7, // 7% 적립
    shipping: "무료배송 쿠폰 2장/월",
    desc: "가족 식탁을 책임지는 최고 우대 등급이에요.",
  },
];

export default function Membership() {
  const { auth } = useContext(AuthContext);
  const [status, setStatus] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.userNo) {
      console.log("auth 또는 userNo 없음:", auth);
      return;
    }

    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem("accessToken");

    const commonConfig = {
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
            }
          : {}),
      },
      params: { userNo: auth.userNo },
      withCredentials: true,
    };

    const fetchAll = async () => {
      try {
        // 멤버쉽 상태
        const [statusRes, couponRes] = await Promise.all([
          axios.get(`${API_BASE}/api/mypage/membership`, commonConfig),
          axios.get(`${API_BASE}/api/mypage/coupon/my-coupons`, commonConfig),
        ]);

        console.log("멤버쉽 응답:", statusRes.data);
        console.log("쿠폰 응답:", couponRes.data);

        setStatus(statusRes.data);
        setCoupons(couponRes.data || []);
      } catch (err) {
        console.error("멤버쉽/쿠폰 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [auth?.userNo]);

  if (loading) return <Loading>멤버쉽 정보를 불러오는 중...</Loading>;
  if (!status) return <Loading>멤버쉽 정보를 찾을 수 없어요.</Loading>;

  const percent = (() => {
    const year = status.yearSpentAmount || 0;
    const need = status.nextGradeNeedAmount || 0;
    const total = year + need;
    if (total === 0) return 0;
    return Math.round((year / total) * 100);
  })();

  return (
    <Wrapper>
      <Title>멤버쉽 등급</Title>

      {/* 현재 등급 카드 */}
      <GradeCard>
        <GradeLabel>{status.gradeName}</GradeLabel>
        <GradeDesc>현재 나의 등급 혜택을 확인하세요!</GradeDesc>

        <BenefitList>
          <li>💳 포인트 적립: {status.pointRate}%</li>
          <li>🚚 무료배송 쿠폰: {status.freeShippingCnt}개</li>
        </BenefitList>
      </GradeCard>

      {/* 다음 등급 진행도 */}
      <ProgressCard>
        <ProgressTitle>
          다음 등급: <strong>{status.nextGradeName}</strong>
        </ProgressTitle>

        <ProgressBar>
          <ProgressFill style={{ width: `${percent}%` }} />
        </ProgressBar>

        <RemainText>
          다음 등급까지 <b>{Number(status.nextGradeNeedAmount || 0).toLocaleString()}원</b> 더
          필요해요!
        </RemainText>
      </ProgressCard>

      {/* 나의 이용 요약 */}
      <SummaryCard>
        <SummaryTitle>나의 이용 요약</SummaryTitle>
        <SummaryList>
          <li>
            올해 결제 금액:{" "}
            <b>{Number(status.yearSpentAmount || 0).toLocaleString()}원</b>
          </li>
          <li>
            누적 결제 금액:{" "}
            <b>{Number(status.lifetimeSpentAmount || 0).toLocaleString()}원</b>
          </li>
        </SummaryList>
        <SummaryTip>
          {status.nextGradeName} 등급까지 남은 금액을 채우면
          더 높은 할인율과 혜택을 받을 수 있어요.
        </SummaryTip>
      </SummaryCard>

            {/* 등급별 혜택 안내 */}
      <GradeBenefitSection>
        <SectionTitle>등급별 혜택 안내</SectionTitle>
        <GradeBenefitGrid>
          {GRADE_BENEFITS.map((g) => {
            const isCurrent = g.name === status.gradeName;
            return (
              <GradeBenefitCard key={g.name} $current={isCurrent}>
                <GradeBenefitHeader>
                  <span>{g.name}</span>
                  {isCurrent && <CurrentBadge>현재 등급</CurrentBadge>}
                </GradeBenefitHeader>
                <GradeBenefitRange>{g.range}</GradeBenefitRange>
                <GradeBenefitList>
                  <li>💳 포인트 적립: {g.pointRate}%</li>
                  <li>🚚 {g.shipping}</li>
                </GradeBenefitList>
                <GradeBenefitDesc>{g.desc}</GradeBenefitDesc>
              </GradeBenefitCard>
            );
          })}
        </GradeBenefitGrid>
      </GradeBenefitSection>

      {/* 쿠폰 */}
      <CouponSection>
        <SectionTitle>보유 쿠폰</SectionTitle>

        {coupons.length === 0 ? (
          <NoCoupon>아직 보유한 쿠폰이 없어요.</NoCoupon>
        ) : (
          <CouponGrid>
            {coupons.map((c) => (
              <CouponCard key={c.couponId}>
                <CouponName>{c.couponName}</CouponName>
                <CouponAmount>
                  {/* 할인 타입에 따라 표시 — 백엔드 필드명 맞춰서 수정 */}
                  {c.discountType === "RATE"
                    ? `${c.discountValue}% 할인`
                    : `${c.discountValue.toLocaleString()}원 할인`}
                </CouponAmount>
                <CouponExp>
                  ~ {String(c.expiresAt).slice(0, 10) || "기한 없음"}
                </CouponExp>
              </CouponCard>
            ))}
          </CouponGrid>
        )}
      </CouponSection>
    </Wrapper>
  );
}

/* -------------------- Styled Components -------------------- */
// 아래 styled 들은 그대로 사용 (변경 없음)
const Wrapper = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 25px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 50px;
`;

const GradeCard = styled.div`
  background: #FFFFD2;
  border-left: 6px solid #FAF4C0;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 30px;
`;

const GradeLabel = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #2e7d32;
`;

const GradeDesc = styled.div`
  font-size: 14px;
  margin-top: 5px;
  color: #555;
`;

const BenefitList = styled.ul`
  margin-top: 15px;
  line-height: 1.6;
`;

const ProgressCard = styled.div`
  background: white;
  border: 1px solid #eee;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 35px;
`;

const ProgressTitle = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
`;

const ProgressBar = styled.div`
  height: 14px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 14px;
  background: #78d07a;
  transition: 0.5s;
`;

const RemainText = styled.div`
  text-align: right;
  margin-top: 8px;
  font-size: 14px;
`;

const CouponSection = styled.div`
  margin-top: 40px;
`;

const SectionTitle = styled.div`
  font-size: 20px;
  margin-bottom: 15px;
  font-weight: 600;
`;

const NoCoupon = styled.div`
  padding: 40px;
  text-align: center;
  color: #777;
`;

const CouponGrid = styled.div`
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
`;

const CouponCard = styled.div`
  background: #fffdf2;
  border: 1px solid #f1e4b3;
  border-radius: 10px;
  padding: 20px;
`;

const CouponName = styled.div`
  font-size: 17px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const CouponAmount = styled.div`
  font-size: 15px;
  color: #cc8f00;
  margin-bottom: 5px;
`;

const CouponExp = styled.div`
  font-size: 13px;
  color: #888;
`;

const SummaryCard = styled.div`
  background: #f8f9fb;
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 35px;
`;

const SummaryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const SummaryList = styled.ul`
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 6px;
`;

const SummaryTip = styled.div`
  font-size: 13px;
  color: #777;
`;

const GradeBenefitSection = styled.div`
  margin-top: 40px;
  margin-bottom: 20px;
`;

const GradeBenefitGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
`;

const GradeBenefitCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 16px 18px;
  border: 1px solid
    ${(props) => (props.$current ? "#ffcf60" : "#eee")};
  box-shadow: ${(props) =>
    props.$current ? "0 0 0 1px rgba(255, 193, 7, 0.2)" : "none"};
`;

const GradeBenefitHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 4px;
`;

const CurrentBadge = styled.span`
  font-size: 11px;
  padding: 3px 7px;
  border-radius: 999px;
  background: #ffe9a5;
  color: #8a5a00;
`;

const GradeBenefitRange = styled.div`
  font-size: 12px;
  color: #777;
  margin-bottom: 8px;
`;

const GradeBenefitList = styled.ul`
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 6px;
`;

const GradeBenefitDesc = styled.div`
  font-size: 12px;
  color: #666;
`;