import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import "../../assets/css/chatbot.css";

import MenuMain from './menu/MenuMain';
import DetailMenu1 from './menu/DetailMenu1';
import DetailMenu2 from './menu/DetailMenu2';
import DetailMenu3 from './menu/DetailMenu3';
import DetailMenu4 from './menu/DetailMenu4';
import logoImg from "../../assets/img/FarmDay.png";

import { useNavigate } from "react-router-dom";

const ChatbotMain = () => {

    //헤더에서 ai서비스 실행
    useEffect(() => {
        const openHandler = () => setIsOpen(true);
        window.addEventListener("open-chatbot", openHandler);

        return () => {
            window.removeEventListener("open-chatbot", openHandler);
        };
        }, []);

    const navigate = useNavigate();

    /* 문의하기(일반 상담) */
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    /* 시세 정보 상담 */
    const [priceMessages, setPriceMessages] = useState([]);
    const [priceInput, setPriceInput] = useState("");
    const priceEndRef = useRef(null);

    /* UI 상태 */
    const [bottomTab, setBottomTab] = useState("home"); // home | chatroom | priceroom
    const [menuStep, setMenuStep] = useState("main");   // 문의하기 전용 메뉴 단계
    const [isOpen, setIsOpen] = useState(false);

    const toggleChatbot = () => setIsOpen(prev => !prev);
    
    /* 대화 전체 리셋 */
    const resetChat = () => {
        setMessages([]);//메시지 초기화
        setMenuStep("main");//메뉴 초기화

        //처음 메뉴 자동 출력
        setTimeout(() => {
            MenuMain({text:"start",addMessage,setMenuStep})
        }, timeout);
    }

    /* 메시지 추가 */
    const addMessage = (msg) =>
        setMessages(prev => [...prev, msg]);

    const addPriceMessage = (msg) =>
        setPriceMessages(prev => [...prev, msg]);

    /* 자동 스크롤 */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        priceEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    /* 제품 클릭 */
    const handleProductClick = (productId) => navigate(`/product/${productId}`);

    /* 일반 상담 버튼 클릭 */
    const handleButtonClick = (btn) => {
        addMessage({ from: 'user', text: btn.label });

        if (btn.value.startsWith("go-price:")) {
            const keyword = btn.value.replace("go-price:", "");
            navigate(`/price?item=${encodeURIComponent(keyword)}`);
            return;
        }

        if (btn.value.startsWith("naver-search:")) {
            const query = btn.value.replace("naver-search:", "");
            window.open(`https://search.naver.com/search.naver?query=${query}`, "_blank");
            return;
        }

        processUserInput(btn.value);
    };

    /* 문의하기 라우팅 */
    const processUserInput = async (text) => {

        if (menuStep === "main")
            return MenuMain({ text, addMessage, setMenuStep, setBottomTab });

        if (menuStep === "shop-ai")
            return DetailMenu1({ text, addMessage, setMenuStep });

        if (menuStep === "recipe")
            return DetailMenu2({ text, addMessage, setMenuStep });

        if (menuStep === "tips" || menuStep === "tipsInput")
            return DetailMenu3({ text, addMessage, setMenuStep, menuStep });

        if (menuStep === "support-price")
            return DetailMenu4({
                text : text,
                addMessage,
                setMenuStep,
                navigate,
                mode: "price"
            });

        addMessage({ from: "bot", text: "⚠️ 메뉴 단계를 찾을 수 없습니다." });
    };

    /* 입력 처리 */
    const handleSend = async () => {
        if (!input.trim()) return;

        addMessage({ from: "user", text: input });
        await processUserInput(input);
        setInput('');
    };

    /* ============================= 시세 정보 전용 ============================= */

    const handlePriceButtonClick = (btn) => {
        addPriceMessage({
            from: "user",
            text: btn.label ?? btn
        });

        processPriceInput(btn.value ?? btn);
    };

    const processPriceInput = async (text) => {
        return DetailMenu4({
            text,
            addMessage: addPriceMessage,
            setMenuStep,
            navigate,
            mode: "price"
        });
    };

    const handlePriceSend = async () => {
        if (!priceInput.trim()) return;

        addPriceMessage({ from: "user", text: priceInput });
        await processPriceInput(priceInput);

        setPriceInput("");
    };

    /* 챗봇 실행 시 홈 초기 메뉴 출력 */
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            MenuMain({ text: "start", addMessage, setMenuStep });
        }
        scrollToBottom();
    }, [isOpen, messages, priceMessages]);

    return (
        <div className="chatbot-container">
            <button className="chatbot-toggle-btn" onClick={toggleChatbot}>
                💬
            </button>

            {isOpen && (
                <div className="chatbot-panel">

                {/* -------------------------------- 헤더 -------------------------------- */}
                <div className="chatbot-header">
                    <div className="chatbot-header-left">
                        {(bottomTab === "chatroom" || bottomTab === "priceroom") && (
                            <button className="chatbot-back-btn" onClick={() => setBottomTab("home")} > ← </button>
                        )}

                        <img src={logoImg} alt="FarmDay" className="chatbot-logo" style={{ objectFit: "contain" }}/>
                        <span>AI 서비스</span>
                    </div>

                    <div className="chatbot-header-right">
                        <button className="chatbot-reset-btn" onClick={resetChat}>🔄</button>
                        <button className="chatbot-close-btn" onClick={toggleChatbot}>✖</button>
                    </div>
                </div>

                {/* --------------------------- 홈 화면 --------------------------- */}
                    {bottomTab === "home" && (
                        <div className="chatbot-home-layout">
                        <div className='chatroom-header-info'>
                            <div className='chatroom-status'>💡 AI 채팅방은 24시간 운영합니다.</div>
                        </div>
                            <div className="chatbot-home-title">대화 종류</div>

                            {/* 문의하기 버튼 */}
                            <button
                                className="chatbot-home-btn"
                                onClick={() => {
                                    setMessages([]);
                                    setMenuStep("main");
                                    setBottomTab("chatroom");
                                    MenuMain({ text: "start", addMessage, setMenuStep });
                                }}
                            >
                                🌱 문의하기
                            </button>

                            {/* 시세 정보 버튼 */}
                            <button className="chatbot-home-btn"
                                onClick={() => {
                                    setPriceMessages([]);
                                    setBottomTab("priceroom");

                                    DetailMenu4({ text: "start", addMessage: addPriceMessage,
                                        setMenuStep, navigate,  mode: "price"
                                    });
                                }}
                            >
                                📈 시세 정보
                            </button>
                            <div className='chatroom-faq'>
                                <div className='chatroom-faq-title'>고객지원</div>
                                <button className="chatroom-faq-item" onClick={() => navigate("/mypage?tab=orderList")}>배송 및 환불</button>

                                <button className="chatroom-faq-item" onClick={() => navigate("/mypage?tab=myInfo")}>계정 및 정보</button>

                                <button className="chatroom-faq-item" onClick={() => navigate("/mypage?tab=membership")}>결제 및 멤버십</button>

                                <button className="chatroom-faq-item" onClick={() => navigate("/help")}>고객센터</button>
                            </div>
                        </div>
                    )}

                    {/* ------------------ 문의하기 대화방 ------------------ */}
                    {bottomTab === "chatroom" && (
                        <>
                            <div className="chatroom-main">
                                <div className="chatbot-messages">
                                    {messages.map((msg, idx) => (
                                        <ChatMessage
                                            key={idx}
                                            from={msg.from}
                                            text={msg.text}
                                            buttons={msg.buttons}
                                            products={msg?.products}
                                            onButtonClick={handleButtonClick}
                                            onProductClick={handleProductClick}
                                        />
                                    ))}
                                    <div ref={messagesEndRef}></div>
                                </div>
                            </div>

                            <div className="chatbot-input-area">
                                <input
                                    type="text"
                                    placeholder="메시지를 입력하세요..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <button className="chatbot-send-btn" onClick={handleSend}>
                                    전송
                                </button>
                            </div>
                        </>
                    )}

                    {/* ------------------ 시세 정보 대화방 ------------------ */}
                    {bottomTab === "priceroom" && (
                        <>
                            <div className="chatroom-main">
                                <div className="chatbot-messages">
                                    {priceMessages.map((msg, idx) => (
                                        <ChatMessage key={idx} from={msg.from}
                                            text={msg.text} buttons={msg.buttons}
                                            onButtonClick={handlePriceButtonClick}
                                        />
                                    ))}
                                    <div ref={priceEndRef}></div>
                                </div>
                            </div>

                            <div className="chatbot-input-area">
                                <input
                                    type="text"
                                    placeholder="시세를 알고 싶은 품목을 입력하세요..."
                                    value={priceInput}
                                    onChange={(e) => setPriceInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handlePriceSend()}
                                />
                                <button className="chatbot-send-btn" onClick={handlePriceSend}>
                                    전송
                                </button>
                            </div>
                        </>
                    )}

                    {/* ------------------ 하단 네비 ------------------ */}
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