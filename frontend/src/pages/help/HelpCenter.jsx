// src/pages/help/HelpCenter.jsx
import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const LEFT_MENU = [
  { key: "INTRO", label: "사이트 소개" },
  { key: "FAQ", label: "자주 묻는 질문" },
  { key: "GUIDE", label: "이용 안내 · 정책" },
  // { key: "NOTICE", label: "공지사항" },
  { key: "INQUIRY", label: "1:1 문의 안내" },
];

export default function HelpCenter() {
  const [activeSection, setActiveSection] = useState("INTRO");

  // ===== FAQ 상태 =====
  const [faqList, setFaqList] = useState([]);
  const [loadingFaq, setLoadingFaq] = useState(false);
  const [faqError, setFaqError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [openedFaqId, setOpenedFaqId] = useState(null);

  // ===== GUIDE(이용안내·정책) 상태 =====
  const [guideArticles, setGuideArticles] = useState([]);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [guideError, setGuideError] = useState("");
  const [openedArticleId, setOpenedArticleId] = useState(null);

  const handle1to1Click = () => {
    if (!window.ChannelIO) {
      console.warn("ChannelIO not loaded yet");
      alert("상담 채팅을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    window.ChannelIO("show");  // 숨겨둔 말풍선 보이기 (옵션)
    window.ChannelIO("open");  // 바로 채팅창 열기
  };

  // FAQ 로딩
  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setLoadingFaq(true);
        setFaqError("");

        const res = await axios.get(`${API_BASE}/api/help/faq`);
        setFaqList(res.data || []);
      } catch (err) {
        console.error("FAQ 조회 실패:", err);
        setFaqError("FAQ 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoadingFaq(false);
      }
    };
    fetchFaq();
  }, []);

  // GUIDE 로딩
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoadingGuide(true);
        setGuideError("");

        const res = await axios.get(`${API_BASE}/api/help/articles`);
        // 응답 예시: [{ articleId, slug, title, content, articleType }]
        setGuideArticles(res.data || []);
      } catch (err) {
        console.error("GUIDE 조회 실패:", err);
        setGuideError("이용 안내·정책 정보를 불러오지 못했습니다.");
      } finally {
        setLoadingGuide(false);
      }
    };
    fetchGuide();
  }, []);

  // FAQ 카테고리 목록
  const categories = useMemo(() => {
    const set = new Set(faqList.map((f) => f.categoryName || "기타"));
    return ["전체", ...Array.from(set)];
  }, [faqList]);

  // FAQ 필터링
  const filteredFaq = useMemo(() => {
    const s = search.trim().toLowerCase();

    return faqList.filter((faq) => {
      const categoryName = faq.categoryName || "기타";

      const matchCategory =
        categoryFilter === "전체" || categoryName === categoryFilter;

      const question = (faq.question || "").toLowerCase();
      const answer = (faq.answer || "").toLowerCase();

      const matchSearch =
        s === "" || question.includes(s) || answer.includes(s);

      return matchCategory && matchSearch;
    });
  }, [faqList, search, categoryFilter]);

  const toggleFaq = (faqId) => {
    setOpenedFaqId((prev) => (prev === faqId ? null : faqId));
  };

  const toggleArticle = (articleId) => {
    setOpenedArticleId((prev) => (prev === articleId ? null : articleId));
  };

  // articleType 라벨 예쁘게
  const getArticleTypeLabel = (articleType) => {
    switch (articleType) {
      case "ABOUT":
        return "서비스 소개";
      case "GUIDE":
        return "이용 안내";
      case "POLICY":
        return "취소/환불 정책";
      case "PRIVACY":
      case "PRIVACY_POLICY":
        return "개인정보 처리방침";
      case "TERMS":
        return "이용약관";
      default:
        return "기타";
    }
  };

  return (
    <Wrapper>
      <Content>
        {/* 상단 제목 영역 */}
        <PageHeader>
          <PageTitle>고객센터</PageTitle>
          <PageDesc>
            FarmDay 이용 중 궁금한 점을 빠르게 확인해 보세요.
            <br />
            자주 묻는 질문과 이용 안내, 실시간 1:1 문의를 통해 도와드립니다.
          </PageDesc>
        </PageHeader>

        <Layout>
          {/* 좌측 메뉴 */}
          <SideNav>
            <NavGroupTitle>고객센터 메뉴</NavGroupTitle>
            <NavList>
              {LEFT_MENU.map((item) => (
                <NavItem
                  key={item.key}
                  $active={activeSection === item.key}
                  onClick={() => setActiveSection(item.key)}
                >
                  <span>{item.label}</span>
                  <span className="arrow">›</span>
                </NavItem>
              ))}
            </NavList>

            <HelpBox>
              <HelpTitle>도움이 필요하신가요?</HelpTitle>
              <HelpDesc>실시간 1:1 문의로 상담원과 바로 대화할 수 있어요.</HelpDesc>
              <HelpButton id="farmday-1to1" type="button"
              onClick={handle1to1Click}>
                1:1 실시간 문의하기
              </HelpButton>
            </HelpBox>
          </SideNav>

          {/* 우측 메인 콘텐츠 */}
          <MainPanel>
            {activeSection === "INTRO" && (
              <>
                <SectionHeader>
                  <SectionTitle>사이트 소개</SectionTitle>
                  <SectionDesc>
                    FarmDay 서비스의 개요와 주요 기능을 안내드립니다.
                  </SectionDesc>
                </SectionHeader>

                <Divider />

                <SectionBody>
                  <h3 className="h3">FarmDay 서비스 소개</h3>
                  <p>
                    FarmDay는 <strong>농산물 직거래 플랫폼</strong>으로,
                    생산자와 소비자를 직접 연결하여 더 신선하고 합리적인 가격의
                    농산물을 제공하는 서비스입니다.
                  </p>

                  <h4 className="h4">FarmDay에서는 이런 일들을 해요</h4>
                  <ul>
                    <li>산지 직송의 신선한 농산물을 한 눈에 비교하고 구매</li>
                    <li>생산자 스토어를 통해 다양한 농가 정보 확인</li>
                    <li>멤버십, 쿠폰, 이벤트를 통한 다양한 혜택 제공</li>
                    <li>리뷰와 평점을 기반으로 신뢰도 높은 상품 선택</li>
                  </ul>

                  <h4 className="h4">이용 흐름 한 눈에 보기</h4>
                  <ol className="number-list">
                    <li>회원가입 및 로그인</li>
                    <li>원하는 상품 검색 및 장바구니 담기</li>
                    <li>주문/결제 진행</li>
                    <li>배송 조회 및 수령</li>
                    <li>리뷰 작성 및 멤버십 적립</li>
                  </ol>

                  <p className="note">
                    더 궁금한 점이 있다면 좌측 하단의{" "}
                    <strong>1:1 실시간 문의</strong>를 통해 상담사에게 바로 문의해 주세요.
                  </p>
                </SectionBody>
              </>
            )}

            {activeSection === "FAQ" && (
              <>
                <SectionHeader>
                  <SectionTitle>자주 묻는 질문</SectionTitle>
                  <SectionDesc>
                    자주 문의되는 내용을 모아두었습니다. 검색 또는 카테고리별로
                    확인해 보세요.
                  </SectionDesc>
                </SectionHeader>

                <Divider />

                <SectionBody>
                  <FilterRow>
                    <SearchInput
                      type="text"
                      placeholder="궁금한 내용을 검색해 보세요. (예: 환불, 배송, 로그인)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </FilterRow>

                  {loadingFaq ? (
                    <EmptyState>FAQ를 불러오는 중입니다...</EmptyState>
                  ) : faqError ? (
                    <EmptyState>{faqError}</EmptyState>
                  ) : filteredFaq.length === 0 ? (
                    <EmptyState>
                      검색 조건에 해당하는 FAQ가 없습니다.
                      <br />
                      키워드를 바꿔보거나, 1:1 실시간 문의를 이용해 주세요.
                    </EmptyState>
                  ) : (
                    <FaqList>
                      {filteredFaq.map((faq) => (
                        <FaqItem key={faq.faqId}>
                          <FaqQuestion onClick={() => toggleFaq(faq.faqId)}>
                            <span className="q-label">Q.</span>
                            <span className="q-text">
                              [{faq.categoryName}] {faq.question}
                            </span>
                            <span className="q-icon">
                              {openedFaqId === faq.faqId ? "−" : "+"}
                            </span>
                          </FaqQuestion>
                          {openedFaqId === faq.faqId && (
                            <FaqAnswer>
                              <p>{faq.answer}</p>
                            </FaqAnswer>
                          )}
                        </FaqItem>
                      ))}
                    </FaqList>
                  )}

                  <p className="note">
                    원하는 답변이 보이지 않으면 좌측의{" "}
                    <strong>1:1 실시간 문의</strong>를 이용해 주세요.
                  </p>
                </SectionBody>
              </>
            )}

            {activeSection === "GUIDE" && (
              <>
                <SectionHeader>
                  <SectionTitle>이용 안내 · 정책</SectionTitle>
                  <SectionDesc>
                    서비스 이용과 관련된 주요 안내 및 정책 내용을 확인하실 수 있습니다.
                  </SectionDesc>
                </SectionHeader>

                <Divider />

                <SectionBody>
                  {loadingGuide ? (
                    <EmptyState>이용 안내·정책 정보를 불러오는 중입니다...</EmptyState>
                  ) : guideError ? (
                    <EmptyState>{guideError}</EmptyState>
                  ) : guideArticles.length === 0 ? (
                    <EmptyState>
                      등록된 이용 안내·정책 문서가 없습니다.
                    </EmptyState>
                  ) : (
                    <GuideList>
                      {guideArticles.map((article) => (
                        <li key={article.articleId}>
                          <div
                            className="guide-header"
                            onClick={() => toggleArticle(article.articleId)}
                          >
                            <span className="guide-type">
                              {getArticleTypeLabel(article.articleType)}
                            </span>
                            <span className="guide-title">{article.title}</span>
                            <span className="guide-icon">
                              {openedArticleId === article.articleId ? "−" : "+"}
                            </span>
                          </div>
                          {openedArticleId === article.articleId && (
                            <div className="guide-body">
                              {/* CONTENT는 줄바꿈 포함 텍스트라서 pre-wrap */}
                              <p className="guide-content">
                                {article.content}
                              </p>
                            </div>
                          )}
                        </li>
                      ))}
                    </GuideList>
                  )}

                </SectionBody>
              </>
            )}

            {activeSection === "INQUIRY" && (
              <>
                <SectionHeader>
                  <SectionTitle>1:1 문의 안내</SectionTitle>
                  <SectionDesc>
                    실시간 채팅 상담 및 기타 문의 채널에 대해 안내드립니다.
                  </SectionDesc>
                </SectionHeader>

                <Divider />

                <SectionBody>
                  <h3 className="h3">실시간 1:1 채팅 상담</h3>
                  <p>
                    상담 운영 시간에는 실시간 채팅을 통해 CS 상담원과 바로 대화하실
                    수 있습니다.
                  </p>
                  <ul>
                    <li>평일 10:00 ~ 18:00</li>
                    <li>점심 시간 12:00 ~ 13:00 제외</li>
                    <li>
                      화면 좌측 하단 <strong>1:1 실시간 문의하기</strong> 버튼을
                      클릭하면 채팅창이 열립니다.
                    </li>
                  </ul>

                  <h4 className="h4">다른 문의 채널</h4>
                  <ul>
                    <li>이메일: support@farmday.com</li>
                    <li>전화: 02-222-3333</li>
                  </ul>

                  <p className="note">
                    실제 연락처 정보와 운영 시간은 추후 설정 또는 CS 설정 테이블과
                    연동해 관리할 수 있습니다.
                  </p>
                </SectionBody>
              </>
            )}
          </MainPanel>
        </Layout>
      </Content>
    </Wrapper>
  );
}

/* ===================== styled-components ===================== */

const Wrapper = styled.div`
  background-color: #ffffff;
  padding: 32px 0 60px;
  border-top: 1px solid #f1f3f5;
  font-family: "SUIT Variable", -apple-system, BlinkMacSystemFont, system-ui,
    "Noto Sans KR", "Malgun Gothic", sans-serif;
  font-weight: 400;
`;

const Content = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
`;

const PageHeader = styled.header`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 6px;
`;

const PageDesc = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.6;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 32px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* 좌측 메뉴 */

const SideNav = styled.aside`
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background-color: #fafafa;
`;

const NavGroupTitle = styled.div`
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #e5e5e5;
  background-color: #f5f5f5;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 4px 0;
`;

const NavItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 14px;
  font-size: 13px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "#2f9e44" : "#444")};
  background-color: ${(p) => (p.$active ? "#ffffff" : "transparent")};
  border-left: 3px solid ${(p) => (p.$active ? "#2f9e44" : "transparent")};

  &:hover {
    background-color: #ffffff;
  }

  .arrow {
    font-size: 12px;
    color: #aaa;
  }
`;

const HelpBox = styled.div`
  border-top: 1px solid #e5e5e5;
  padding: 12px 14px 14px;
  background-color: #ffffff;
`;

const HelpTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const HelpDesc = styled.p`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const HelpButton = styled.button`
  width: 100%;
  border-radius: 4px;
  border: 1px solid #2f9e44;
  background-color: #2f9e44;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 10px;
  cursor: pointer;
  margin-bottom: 6px;

  &:hover {
    background-color: #2b8a3e;
  }
`;

const HelpSub = styled.p`
  font-size: 11px;
  color: #999;
  line-height: 1.5;
`;

/* 우측 메인 */

const MainPanel = styled.section`
  border-top: 2px solid #222;
`;

const SectionHeader = styled.div`
  padding: 6px 4px 10px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const SectionDesc = styled.p`
  font-size: 13px;
  color: #777;
`;

const Divider = styled.div`
  border-bottom: 1px solid #e5e5e5;
`;

const SectionBody = styled.div`
  padding: 18px 4px 28px;
  font-size: 14px;
  color: #444;
  line-height: 1.7;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 12px;

  .h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 10px 0 4px;
  }

  strong,
  b {
    font-weight: 700;
  }

  .note {
    font-size: 12px;
    color: #888;
    margin-top: 10px;
  }
`;

/* FAQ */

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const SearchInput = styled.input`
  flex: 1 1 260px;
  min-width: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: #2f9e44;
  }
`;

const Select = styled.select`
  flex: 0 0 150px;
  border-radius: 4px;
  border: 1px solid #ddd;
  padding: 8px 10px;
  font-size: 13px;
  background-color: #fff;
`;

const EmptyState = styled.div`
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: #888;
`;

const FaqList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #eee;
`;

const FaqItem = styled.li`
  border-bottom: 1px solid #eee;
`;

const FaqQuestion = styled.button`
  width: 100%;
  padding: 10px 4px;
  border: none;
  background-color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  .q-label {
    font-weight: 600;
    color: #2f9e44;
    font-size: 13px;
  }

  .q-text {
    flex: 1 1 auto;
    font-size: 13px;
    text-align: left;
  }

  .q-icon {
    font-size: 16px;
    color: #999;
  }

  &:hover {
    background-color: #fafafa;
  }
`;

const FaqAnswer = styled.div`
  padding: 8px 4px 12px 24px;
  font-size: 13px;
  color: #555;
`;

/* GUIDE */

const GuideList = styled.ul`
  list-style: none;
  margin: 0 0 4px;
  padding: 0;
  border-top: 1px solid #eee;

  li {
    border-bottom: 1px solid #eee;
  }

  .guide-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 4px;
    cursor: pointer;
  }

  .guide-type {
    flex: 0 0 auto;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 999px;
    border: 1px solid #e0e0e0;
    background-color: #fafafa;
    color: #777;
  }

  .guide-title {
    flex: 1 1 auto;
    font-size: 13px;
  }

  .guide-icon {
    font-size: 16px;
    color: #999;
  }

  .guide-body {
    padding: 4px 4px 12px 4px;
  }

  .guide-content {
    white-space: pre-wrap; /* 줄바꿈 유지 */
    font-size: 13px;
    color: #555;
  }
`;