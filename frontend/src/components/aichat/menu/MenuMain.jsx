import React from 'react';

export const showMainMenu = (addMessage) => {
    addMessage({
        from: "bot",
        text: "안녕하세요! 어떤 기능을 도와드릴까요?",
        buttons: [
            { label: "✨ AI 장보기 (예산 기반)", value: "shop-ai" },
            { label: "🍽️ 재료 기반 레시피 추천", value: "recipe" },
            { label: "❄️ 보관/손질 팁", value: "tips" },
            { label: "🧑 생산자/스토어 추천", value: "store" },
            { label: "💬 고객지원", value: "support" }
        ]
    });
};

const MenuMain = ({ text, addMessage, setMenuStep }) => {

    if (text === "start") {
        showMainMenu(addMessage);
        return;
    }

    //사용자 입력처리
    if(text === "shop-ai") {
        addMessage({
            from: "bot",
            text: "예산을 고려하여, \n상품 가격대를 선택해주세요.",
            category: "product",
            buttons: [
                { label: "💰 가격대별 추천", value: "shop-ai" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        })
        setMenuStep("shop-ai")
        return;
    }

    // 2. 재료 기반 레시피
    if (text === "recipe") {
        addMessage({
            from: "bot",
            text: "가지고 있는 재료 및 요리이름을 입력해주세요.\n예: 감자, 양파, 김치찌개, 된장국",
            buttons: [{ label: "⬅️ 뒤로가기", value: "back" }]
        });
        setMenuStep("recipe");
        return;
    }

    // 4. 보관/손질 팁
    if (text === "tips") {
        addMessage({
            from: "bot",
            text: "어떤 식재료를 도움받고 싶나요?",
            buttons: [
                { label: "과일 보관법", value: "tips-fruit" },
                { label: "채소 손질법", value: "tips-lettuce" },
                { label: "생선 오래 보관", value: "tips-potato" },
                { label: "고기 손질법", value: "tips-meet"},
                { label: "사용자 입력", value: "tips-search"},
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        });
        setMenuStep("tips");
        return;
    }

    // 5. 생산자/스토어 추천
    if (text === "store") {
        addMessage({
            from: "bot",
            text: "생산자/스토어 추천입니다.",
            buttons: [
                { label: "👨‍🌾 인기 생산자", value: "5-1" },
                { label: "🏪 인기 스토어", value: "5-2" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        });
        setMenuStep("store");
        return;
    }

    // 6. 고객지원
    if (text === "support") {
        addMessage({
            from:"bot",
            text: "고객지원 메뉴입니다.",
            buttons: [
                { label: "📧 문의하기", value: "6-1" },
                { label: "🚚 배송 현황", value: "6-2" },
                { label: "💳 환불 요청", value: "6-3" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        });
        setMenuStep("support");
        return;
    }

    // 뒤로가기
    if (text === "back") {
        setMenuStep("main");
        showMainMenu(addMessage);
        return;
    }

    // 알 수 없는 입력
    addMessage({
        from: "bot",
        text: "해당 메뉴를 찾을 수 없습니다.",
        buttons: [{ label: "🏠 메인 메뉴", value: "back" }]
    });
};

export default MenuMain;
