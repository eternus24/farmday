// // src/components/price/PricePageContent.jsx
// import React, { useEffect, useState } from "react";
// import { fetchTodaySummary } from "../../api/priceApi";
// import "./price.css";
// import {
//   LineChart,
//   Line,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// function formatNumber(num) {
//   if (num == null) return "-";
//   return Number(num).toLocaleString("ko-KR");
// }

// // ──────────────────────────────────────────────
// // 상단 추천용 큰 카드 (아줌마형 문구)
// // ──────────────────────────────────────────────
// function BigRecommendationCard({ card }) {
//   const rate = card.diffRate ?? 0; // 음수(하락)
//   const absRate = Math.abs(rate).toFixed(1);

//   let line2 = "오늘은 조금 싸요 🙂";
//   let line3 = `평소보다 ${absRate}% 내려갔어요`;
//   let line4 = "지금 사두셔도 괜찮아요.";

//   if (rate <= -20) {
//     line2 = "오늘 엄청 싸요 👍";
//     line3 = `평소보다 ${absRate}% 내려갔어요`;
//     line4 = "지금 사면 정말 이득이에요!";
//   } else if (rate <= -10) {
//     line2 = "오늘 많이 싸요 👍";
//     line3 = `평소보다 ${absRate}% 내려갔어요`;
//     line4 = "장 볼 때 같이 담기 좋아요.";
//   } else if (rate <= -5) {
//     line2 = "오늘은 조금 싸요 🙂";
//     line3 = `평소보다 ${absRate}% 내려갔어요`;
//     line4 = "지금 사두셔도 괜찮아요.";
//   } else {
//     // 혹시 하락폭이 거의 없거나 데이터 애매할 때
//     line2 = "가격이 많이 나쁘지 않아요 🙂";
//     line3 = "평소와 비슷한 편이에요.";
//     line4 = "필요하시면 오늘 구매해도 괜찮아요.";
//   }

//   return (
//     <div
//       style={{
//         borderRadius: "16px",
//         background:
//           "linear-gradient(135deg, rgba(45,180,107,0.12), rgba(255,140,26,0.06))",
//         padding: "14px 14px 12px",
//         boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//         display: "flex",
//         flexDirection: "column",
//         gap: 4,
//         minHeight: 110,
//       }}
//     >
//       <div style={{ fontSize: "15px", fontWeight: 700 }}>
//         {card.productName}{" "}
//         {card.unit && (
//           <span style={{ fontSize: "12px", opacity: 0.85 }}>
//             ({card.unit})
//           </span>
//         )}
//       </div>
//       <div style={{ fontSize: "13px" }}>{line2}</div>
//       <div style={{ fontSize: "13px" }}>{line3}</div>
//       <div style={{ fontSize: "13px" }}>{line4}</div>
//     </div>
//   );
// }

// // ──────────────────────────────────────────────
// // 기존 카드(전체 시세 카드 리스트에서 사용)
// // ──────────────────────────────────────────────
// function PriceCard({ card }) {
//   const up = card.up;
//   const diffRate = card.diffRate || 0;
//   const diffPrice = card.diffPrice || 0;

//   const diffClass =
//     diffRate === 0 ? "" : up ? "price-up" : "price-down";

//   return (
//     <div className="price-card">
//       <div className="price-card-title">{card.productName}</div>
//       <div className="price-card-unit">{card.unit}</div>
//       <div className="price-card-price">
//         {formatNumber(card.todayPrice)}원
//       </div>
//       <div className={`price-card-diff ${diffClass}`}>
//         <span className="price-arrow-circle">
//           {diffRate === 0 ? "·" : up ? "▲" : "▼"}
//         </span>
//         {diffRate === 0 ? (
//           <span>보합 (0%)</span>
//         ) : (
//           <>
//             <span>
//               {(up ? "" : "-") + formatNumber(diffPrice)}
//               원
//             </span>
//             <span>({diffRate.toFixed(1)}%)</span>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // ──────────────────────────────────────────────
// // 미니 트렌드 차트 툴팁 (마우스 오버용)
// // ──────────────────────────────────────────────
// function TrendTooltip({ active, payload }) {
//   if (!active || !payload || !payload.length) return null;
//   const value = payload[0].value;

//   return (
//     <div
//       style={{
//         background: "#ffffff",
//         borderRadius: "10px",
//         padding: "8px 10px",
//         boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
//         fontSize: "12px",
//         color: "#222",
//       }}
//     >
//       <div style={{ fontWeight: 600, marginBottom: 4 }}>최근 추세</div>
//       <div>지수: {formatNumber(value)}</div>
//     </div>
//   );
// }

// // ──────────────────────────────────────────────
// // 공통 섹션 카드 래퍼
// // ──────────────────────────────────────────────
// function SectionCard({ title, children }) {
//   return (
//     <div
//       style={{
//         borderRadius: "16px",
//         background: "#ffffff",
//         padding: "18px 18px 14px",
//         boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
//         marginBottom: "20px",
//       }}
//     >
//       <div
//         style={{
//           fontSize: "18px",
//           fontWeight: 700,
//           marginBottom: "10px",
//         }}
//       >
//         {title}
//       </div>
//       {children}
//     </div>
//   );
// }

// export default function PricePageContent() {
//   const [summary, setSummary] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let mounted = true;
//     fetchTodaySummary()
//       .then((data) => {
//         if (mounted) setSummary(data);
//       })
//       .catch((e) => {
//         console.error(e);
//         if (mounted) setError("시세 정보를 불러오지 못했습니다.");
//       });
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const falling = summary?.topFallingItems || [];
//   const rising = summary?.topRisingItems || [];
//   const allItems = summary?.allItems || [];

//   // 미니 그래프용 간단한 트렌드 데이터 (느낌용)
//   const miniDownTrend = [
//     { t: 1, v: 120 },
//     { t: 2, v: 110 },
//     { t: 3, v: 100 },
//     { t: 4, v: 90 },
//     { t: 5, v: 80 },
//   ];
//   const miniUpTrend = [
//     { t: 1, v: 80 },
//     { t: 2, v: 90 },
//     { t: 3, v: 105 },
//     { t: 4, v: 115 },
//     { t: 5, v: 130 },
//   ];

//   if (error) {
//     return (
//       <div className="price-page">
//         <h2 className="price-section-title">농산물 시세</h2>
//         <p>{error}</p>
//       </div>
//     );
//   }

//   if (!summary) {
//     return (
//       <div className="price-page">
//         <h2 className="price-section-title">농산물 시세</h2>
//         <p>시세 불러오는 중입니다...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="price-page">
//       {/* 1️⃣ 오늘 뭐 사면 이득일까요? */}
//       <SectionCard title="🛒 오늘 뭐 사면 이득일까요?">
//         <p className="price-section-sub" style={{ marginBottom: 12 }}>
//           오늘 가격이 많이 내려간 품목을 먼저 보여드리고,{" "}
//           장바구니에 담기 좋은 품목을 한눈에 볼 수 있도록 구성했어요.
//         </p>

//         {/* 큰 추천 카드 4개 (하락 품목 기준) */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
//             gap: "14px",
//           }}
//         >
//           {falling.slice(0, 4).map((card) => (
//             <BigRecommendationCard
//               key={card.productName + card.unit}
//               card={card}
//             />
//           ))}
//           {falling.length === 0 && (
//             <div style={{ fontSize: 13 }}>
//               오늘은 눈에 띄게 많이 내려간 품목이 없어요.
//             </div>
//           )}
//         </div>
//       </SectionCard>

//       {/* 2️⃣ 두 번째 줄 : 좌/우 2컬럼 (인기 + 제철) */}
//       <div
//         style={{
//           display: "flex",
//           gap: "18px",
//           flexWrap: "wrap",
//         }}
//       >
//         {/* 🔥 지금 제일 인기있는 품목 */}
//         <div style={{ flex: "1", minWidth: "260px" }}>
//           <SectionCard title="🔥 지금 제일 인기있는 품목">
//             <div style={{ fontSize: 14 }}>
//               {allItems.slice(0, 5).map((item, idx) => (
//                 <div
//                   key={item.productName + item.unit}
//                   style={{
//                     padding: "7px 0",
//                     borderBottom: "1px solid rgba(0,0,0,0.05)",
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: 2,
//                   }}
//                 >
//                   <div>
//                     <span
//                       style={{
//                         display: "inline-flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         width: 22,
//                         height: 22,
//                         borderRadius: "999px",
//                         background:
//                           idx === 0
//                             ? "#ff8c1a"
//                             : "rgba(255,140,26,0.12)",
//                         color: idx === 0 ? "#fff" : "#ff8c1a",
//                         fontSize: 12,
//                         fontWeight: 700,
//                         marginRight: 8,
//                       }}
//                     >
//                       {idx + 1}
//                     </span>
//                     <b>{item.productName}</b>{" "}
//                     {item.unit && (
//                       <span style={{ fontSize: 12, opacity: 0.8 }}>
//                         ({item.unit})
//                       </span>
//                     )}
//                   </div>
//                   <div style={{ fontSize: 12, opacity: 0.85 }}>
//                     요즘 많이 찾는 식재료예요.
//                   </div>
//                 </div>
//               ))}
//               {allItems.length === 0 && (
//                 <div style={{ fontSize: 13 }}>
//                   아직 인기 순위를 계산할 데이터가 부족해요.
//                 </div>
//               )}
//             </div>
//           </SectionCard>
//         </div>

//         {/* 🌿 지금 제철이에요 */}
//         <div style={{ flex: "1", minWidth: "260px" }}>
//           <SectionCard title="🌿 지금 제철이에요">
//             <div
//               style={{
//                 fontSize: 14,
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 8,
//               }}
//             >
//               <div>
//                 🍓 <b>딸기</b>
//                 <div style={{ fontSize: 12, opacity: 0.9 }}>
//                   지금 딱 제철이에요. 맛과 향이 가장 좋은 시기예요.
//                 </div>
//               </div>
//               <div>
//                 🍊 <b>귤</b>
//                 <div style={{ fontSize: 12, opacity: 0.9 }}>
//                   겨울 대표 과일이라 가격과 맛이 둘 다 좋아요.
//                 </div>
//               </div>
//               <div>
//                 🥬 <b>대파</b>
//                 <div style={{ fontSize: 12, opacity: 0.9 }}>
//                   국, 찌개, 볶음 어디에나 잘 어울리는 제철 채소예요.
//                 </div>
//               </div>
//               <div>
//                 🥕 <b>당근</b>
//                 <div style={{ fontSize: 12, opacity: 0.9 }}>
//                   샐러드, 볶음, 조림까지 다양하게 쓰기 좋아요.
//                 </div>
//               </div>
//             </div>
//           </SectionCard>
//         </div>
//       </div>

//       {/* 3️⃣ 세 번째 줄 : 최근 가격 추세 (좌/우 그래프 + 문구) */}
//       <SectionCard title="📈 최근 가격 추세">
//         <div
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "18px",
//           }}
//         >
//           {/* 왼쪽 : 싸지는 추세 (그린) */}
//           <div style={{ flex: "1", minWidth: "280px" }}>
//             <div style={{ height: 90 }}>
//               <ResponsiveContainer>
//                 <LineChart data={miniDownTrend}>
//                   <Tooltip
//                     content={<TrendTooltip />}
//                     cursor={{
//                       stroke: "rgba(0,0,0,0.1)",
//                       strokeWidth: 1,
//                     }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="v"
//                     stroke="#2db46b" // 그린
//                     strokeWidth={3}
//                     dot={false}
//                     isAnimationActive={true}
//                     animationDuration={800}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//             <div style={{ fontSize: 14, marginTop: 8 }}>
//               요즘 가격이 계속 내려가는 분위기예요 👍
//               <br />
//               기본 식재료 위주로 장을 보신다면, 지금 담아두셔도 좋은 시기입니다.
//             </div>
//           </div>

//           {/* 오른쪽 : 비싸지는 추세 (오렌지) */}
//           <div style={{ flex: "1", minWidth: "280px" }}>
//             <div style={{ height: 90 }}>
//               <ResponsiveContainer>
//                 <LineChart data={miniUpTrend}>
//                   <Tooltip
//                     content={<TrendTooltip />}
//                     cursor={{
//                       stroke: "rgba(0,0,0,0.1)",
//                       strokeWidth: 1,
//                     }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="v"
//                     stroke="#ff8c1a" // 오렌지
//                     strokeWidth={3}
//                     dot={false}
//                     isAnimationActive={true}
//                     animationDuration={800}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//             <div style={{ fontSize: 14, marginTop: 8 }}>
//               반대로, 요즘은 가격이 조금씩 올라가는 품목들도 있어요 😥
//               <br />
//               급하지 않은 식재료라면, 조금 더 지켜보셨다가 구입하셔도 괜찮아요.
//             </div>
//           </div>
//         </div>
//       </SectionCard>

//       {/* 🔽 전체 시세 한눈에 보기 (기존 카드형 리스트 유지) */}
//       <div id="all-price-section" style={{ marginTop: 22 }}>
//         <div className="price-section-title">오늘 전체 시세 한눈에 보기</div>
//         <div className="price-section-sub">
//           오늘 조사된 주요 품목들의 가격을 한 번에 정리했습니다.
//         </div>
//         {allItems.length === 0 ? (
//           <div style={{ fontSize: 12 }}>표시할 시세가 없습니다.</div>
//         ) : (
//           <div className="price-grid">
//             {allItems.map((card) => (
//               <PriceCard
//                 key={card.productName + card.unit}
//                 card={card}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* 전체 시세 보기 버튼 (스크롤 이동) */}
//       <div style={{ textAlign: "center", marginTop: 24 }}>
//         <button
//           style={{
//             background: "#ff8c1a", // 쨍한 오렌지
//             color: "#ffffff",
//             borderRadius: "999px",
//             padding: "11px 26px",
//             fontSize: 15,
//             fontWeight: 700,
//             border: "none",
//             cursor: "pointer",
//           }}
//           onClick={() =>
//             document
//               .getElementById("all-price-section")
//               ?.scrollIntoView({ behavior: "smooth" })
//           }
//         >
//           전체 시세 보기
//         </button>
//         <div
//           style={{
//             fontSize: 12,
//             marginTop: 6,
//             opacity: 0.7,
//           }}
//         >
//           더 많은 품목의 가격을 아래에서 한 번에 확인하실 수 있어요.
//         </div>
//       </div>
//     </div>
//   );
// }
