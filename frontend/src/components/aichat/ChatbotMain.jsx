import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import "../../assets/css/chatbot.css";
import ChatPriceView from './ChatPriceView';
import MenuMain from './menu/MenuMain';
import DetailMenu1 from './menu/DetailMenu1';
import DetailMenu2 from './menu/DetailMenu2';
import DetailMenu3 from './menu/DetailMenu3';
import { useNavigate } from "react-router-dom";

const ChatbotMain = () => {

    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 메뉴 단계
    const [menuStep, setMenuStep] = useState("main");

    // 시세 분석 관련
    const [productName, setProductName] = useState('');
    const [analysisData, setAnalysisData] = useState(null);

    // 새 구조: 홈 화면 / 대화 화면만 존재
    const [bottomTab, setBottomTab] = useState("home");


    /* ---------------------------------
       챗봇 열기
    -----------------------------------*/
    const toggleChatbot = () => {
        setIsOpen(prev => !prev);
    };


    /* ---------------------------------
       메시지 추가
    -----------------------------------*/
    const addMessage = (msg) => {
        setMessages(prev => [...prev, msg]);
    };

    /* ---------------------------------
       공통 버튼 클릭 처리
    -----------------------------------*/
    const handleButtonClick = (btn) => {
        addMessage({ from: 'user', text: btn.label });
        processUserInput(btn.value);
    };

    /* ---------------------------------
       하단 자동 스크롤
    -----------------------------------*/
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    /* ---------------------------------
       상품 카드 클릭 → product detail 이동
    -----------------------------------*/
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    /* ---------------------------------
       메뉴 라우트 처리
    -----------------------------------*/
    const processUserInput = async (text) => {
        if (menuStep === "main") return MenuMain({ text, addMessage, setMenuStep });
        if (menuStep === "menu1") return DetailMenu1({ text, addMessage, setMenuStep });
        if (menuStep === "menu2") return DetailMenu2({ text, addMessage, setMenuStep });
        if (menuStep === "menu3") return DetailMenu3({ text, addMessage, setMenuStep });

        addMessage({ from: "bot", text: "⚠️ 오류: 메뉴 단계를 찾을 수 없습니다." });
    };


    /* ---------------------------------
       사용자 입력 정규화
    -----------------------------------*/
    const normalizeUserInput = (text) => {
        const t = text.trim();

        if (/^\d(-\d)?$/.test(t)) return t;

        if (t.includes("검색")) return "1-6";
        if (t.includes("가격")) return "1-7";
        if (t.includes("뒤로")) return "back";

        return t;
    };


    /* ---------------------------------
       대화창 입력 전송
    -----------------------------------*/
    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        const normalized = normalizeUserInput(userText);

        addMessage({ from: "user", text: userText });
        await processUserInput(normalized);
        setInput('');
    };


    /* ---------------------------------
       시세 분석 (임시)
    -----------------------------------*/
    const handlePriceCheck = () => {
        if (!productName.trim()) return;
        setAnalysisData({
            productName,
            todayPrice: 12000,
            avgPrice: 10000,
            comment: "최근 평균보다 비싼 편입니다."
        });
    };


    /* ---------------------------------
       챗봇 켤 때 기본 메뉴 자동 출력
    -----------------------------------*/
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

                    {/* 상단 헤더 */}
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
                        <button className="chatbot-close-btn" onClick={toggleChatbot}>✖</button>
                    </div>

                    {/* ===================== 홈 화면 ===================== */}
                    {bottomTab === "home" && (
                        <>
                            <div className="chatbot-home-layout">

                                <div className="chatbot-home-title">대화 종류</div>

                                <button className="chatbot-home-btn"
                                        onClick={() => setBottomTab("chatroom")}>
                                    💬 문의하기
                                </button>

                                <button className="chatbot-home-btn"
                                        onClick={() => setMenuStep("main")}>
                                    🌱 일반 대화 시작
                                </button>

                                <button className="chatbot-home-btn"
                                        onClick={() => setMenuStep("menu1")}>
                                    📈 시세 정보
                                </button>
                            </div>
                        </>
                    )}

                    {/* ===================== 대화 화면(chatroom) ===================== */}
                    {bottomTab === "chatroom" && (
                        <>
                            <div className="chatroom-header-info">
                                <div className="chatroom-status">💡 24시간 운영해요</div>
                            </div>

                            <div className="chatroom-main">

                                {/* 기존 챗봇 메시지 영역 */}
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

                    {/* ===================== 하단 탭(설정 제거됨) ===================== */}
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
