import React from 'react';

export const showMainMenu = (addMessage) => {
    addMessage({
        from: "bot",
        text: "안녕하세요! 어떤 기능을 도와드릴까요?",
        buttons: [
            { label: "✨ AI 장보기 (예산 기반)", value: "shop-ai" },
            { label: "🍽️ 재료 기반 레시피 추천", value: "recipe" },
            { label: "❄️ 보관/손질 팁", value: "tips" },
        ]
    });
};

const MenuMain = ({ text, addMessage, setMenuStep,setBottomTab }) => {

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
        setBottomTab("chatroom")
        addMessage({
            from: "bot",
            text: "어떤 식재료를 도움받고 싶나요?",
            buttons: [
                { label: "맛있는 과일", value: "tips-fruit" },
                { label: "신선한 채소", value: "tips-lettuce" },
                { label: "건강한 생선", value: "tips-potato" },
                { label: "든든한 고기", value: "tips-meet"},
                { label: "사용자 입력", value: "tips-search"},
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        });
        setMenuStep("tips");
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