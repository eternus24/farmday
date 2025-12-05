import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import "../../assets/css/chatbot.css";
import MenuMain from './menu/MenuMain';
import DetailMenu1 from './menu/DetailMenu1';   // menu1 = AI 장보기 + 가격대 추천
import DetailMenu2 from './menu/DetailMenu2';   // menu2 = 재료 기반 레시피
import DetailMenu3 from './menu/DetailMenu3';   // menu3 = 시세/제철 추천
import { useNavigate } from "react-router-dom";

const ChatbotMain = () => {

    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    // 메뉴 단계 (새 구조)
    const [menuStep, setMenuStep] = useState("main");

    // 시세 분석 관련
    const [productName, setProductName] = useState('');
    const [analysisData, setAnalysisData] = useState(null);

    // 홈 / 대화 화면
    const [bottomTab, setBottomTab] = useState("home");

    /* 챗봇 열기 */
    const toggleChatbot = () => setIsOpen(prev => !prev);

    /* 메시지 추가 */
    const addMessage = (msg) => {
        setMessages(prev => [...prev, msg]);
    };

    /* 버튼 클릭 처리 */
    const handleButtonClick = (btn) => {
        addMessage({ from: 'user', text: btn.label });
        processUserInput(btn.value);
    };

    /* 자동 스크롤 */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    /* 상품 클릭 */
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    /* 대화 전체 리셋 */
    const resetChat = () => {
        setMessages([]);//메시지 초기화
        setMenuStep("main");//메뉴 초기화

        //처음 메뉴 자동 출력
        setTimeout(() => {
            MenuMain({text:"start",addMessage,setMenuStep})
        }, timeout);
    }

    /* 메뉴 처리 (핵심 라우팅 부분 정리됨) */
    const processUserInput = async (text) => {

        if (menuStep === "main")
            return MenuMain({ text, addMessage, setMenuStep, menuStep });

        if (menuStep === "shop-ai")
            return DetailMenu1({ text, addMessage, setMenuStep, menuStep });

        if (menuStep === "recipe")
            return DetailMenu2({ text, addMessage, setMenuStep, menuStep });

        if (menuStep === "tips")
            return addMessage({ from: "bot", text: "보관/손질 팁 기능 준비 중입니다." });

        if (menuStep === "store")
            return addMessage({ from: "bot", text: "생산자/스토어 추천 기능 준비 중입니다." });

        if (menuStep === "support")
            return addMessage({ from: "bot", text: "고객지원 기능 준비 중입니다." });

        addMessage({ from: "bot", text: "⚠️ 오류: 메뉴 단계를 찾을 수 없습니다." });
    };

    /* 사용자 입력 정규화 */
    const normalizeUserInput = (text) => {
        const t = text.trim();

        if (/^\d(-\d)?$/.test(t)) return t;
        if (t.includes("검색")) return "1-6";
        if (t.includes("가격")) return "1-7";
        if (t.includes("뒤로")) return "back";

        return t;
    };

    /* 입력 전송 */
    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        const normalized = normalizeUserInput(userText);

        addMessage({ from: "user", text: userText });
        await processUserInput(normalized);

        setInput('');
    };

    /* 챗봇 켤 때 메인 메뉴 자동 출력 */
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            MenuMain({ text: "start", addMessage, setMenuStep });
        }
        scrollToBottom();
    }, [isOpen, messages]);


    return (
        <div className="chatbot-container">
            <button className="chatbot-toggle-btn" onClick={toggleChatbot}>
                💬
            </button>

            {isOpen && (
                <div className="chatbot-panel">

                    {/* 헤더 */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-left">
                            {bottomTab === "chatroom" && (
                                <button className="chatbot-back-btn"
                                        onClick={() => setBottomTab("home")}>
                                    ←
                                </button>
                            )}
                            <img src="/api/placeholder/32/32"
                                alt="FarmDay" className="chatbot-logo" />
                            <span>FarmDay</span>
                        </div>
                        <button className='chatbot-reset-btn' onClick={resetChat}>🔄 초기화
                        </button>
                        <button className="chatbot-close-btn" onClick={toggleChatbot}>✖</button>
                    </div>

                    {/* 홈 화면 */}
                    {bottomTab === "home" && (
                        <>
                        <div className='chatroom-header-info'>
                            <div className='chatroom-status'>💡 24시간 운영해요</div>
                        </div>

                        <div className="chatbot-home-layout">
                            <div className="chatbot-home-title">대화 종류</div>

                            <button className="chatbot-home-btn"
                                    onClick={() => setBottomTab("chatroom")}>
                                🌱 문의하기
                            </button>

                            <button className="chatbot-home-btn"
                                    onClick={() => setMenuStep("menu1")}>
                                📈 시세 정보
                            </button>

                            <div className='chatroom-faq'>
                                <div className='chatroom-faq-title'>자주 묻는 질문</div>
                                <button className="chatroom-faq-item">배송 및 환불</button>
                                <button className="chatroom-faq-item">계정 및 정보</button>
                                <button className="chatroom-faq-item">결제 및 멤버십</button>
                                <button className="chatroom-faq-item">멤버십 적립</button>
                            </div>
                        </div>
                        </>
                    )}

                    {/* 대화 화면 */}
                    {bottomTab === "chatroom" && (
                        <>
                            <div className="chatroom-main">
                                <div className='chatbot-messages'>
                                    {messages.map((msg, idx) => (
                                        <ChatMessage
                                            key={idx}
                                            from={msg.from}
                                            text={msg.text}
                                            buttons={msg.buttons}
                                            category={msg.category}
                                            products={msg.products}
                                            onButtonClick={handleButtonClick}
                                            onProductClick={handleProductClick}
                                        />
                                    ))}
                                    <div ref={messagesEndRef}></div>
                                </div>
                            </div>

                            {/* 입력창 */}
                            <div className='chatbot-input-area'>
                                <input
                                    type='text'
                                    placeholder='메시지를 입력해주세요...'
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button className='chatbot-send-btn' onClick={handleSend}>
                                    전송
                                </button>
                            </div>
                        </>
                    )}

                    {/* 하단 탭 */}
                    <div className="chatbot-bottom-nav">
                        <button
                            className={bottomTab === "home" ? "active" : ""}
                            onClick={() => setBottomTab("home")}
                        >
                            <span className="nav-icon">🏠</span>
                            <span className="nav-label">홈</span>
                        </button>

                        <button
                            className={bottomTab === "chatroom" ? "active" : ""}
                            onClick={() => setBottomTab("chatroom")}
                        >
                            <span className="nav-icon">💬</span>
                            <span className="nav-label">대화</span>
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ChatbotMain;
