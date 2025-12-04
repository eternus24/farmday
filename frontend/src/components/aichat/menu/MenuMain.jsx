import React from 'react';

const MenuMain = ({text, addMessage, setMenuStep}) => {

    //메인 메뉴
    const showMainMenu = () => {
        addMessage({
            from:"bot",
            text: "안녕하세요! 원하시는 메뉴를 선택해주세요.",
            buttons: [
                { label: "🍎 상품 검색/추천", value: "1" },
                { label: "⚖️ 상품 비교", value: "2" },
                { label: "🍳 레시피 추천", value: "3" },
                { label: "🏪 생산자/스토어", value: "4" },
                { label: "💬 고객지원", value: "5" }
            ]
        });
    };

    //챗봇 처음 켜질 때
    if(text === "start") {
        showMainMenu();
        return;
    }

    //사용자 입력처리
    if(text === "1") {
        addMessage({
            from: "bot",
            text: "상품 검색/추천 메뉴입니다. 원하시는 카테고리를 선택해주세요.",
            category: "product",
            buttons: [
                { label: "🔍 상품명 검색", value: "1-1" },
                { label: "💰 가격대별 추천", value: "1-2" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        })
        setMenuStep("menu1")
        return;
    }

    if(text === "2"){
        addMessage({
            from:"bot",
            text: "상품 비교 메뉴입니다. 원하시는 기능을 선택해주세요.",
            category: "compare",
            buttons: [
                { label: "⚖️ 두 상품 비교", value: "2-1" },
                { label: "📊 가격/산지/리뷰", value: "2-2" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        })
        setMenuStep("menu2")
        return;
    }

    if(text === "3"){
        addMessage({
            from:"bot",
            text: "레시피 추천 메뉴입니다. 원하시는 방식을 선택해주세요.",
            category: "recipe",
            buttons: [
                { label: "🥕 재료로 요리 찾기", value: "3-1" },
                { label: "🍽️ 오늘 저녁 메뉴", value: "3-2" },
                { label: "🍱 종류별 요리", value: "3-3" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        })
        setMenuStep("menu3")
        return;
    }

    if(text === "4"){
        addMessage({
            from:"bot",
            text: "생산자/스토어 정보 메뉴입니다.",
            category: "store",
            buttons: [
                { label: "👨‍🌾 인기 생산자", value: "4-1" },
                { label: "🏪 인기 스토어", value: "4-2" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        })
        setMenuStep("menu4")
        return;
    }

    if(text === "5"){
        addMessage({
            from:"bot",
            text: "고객지원 메뉴입니다. 무엇을 도와드릴까요?",
            category: "support",
            buttons: [
                { label: "📧 생산자 문의", value: "5-1" },
                { label: "🚚 배송 현황", value: "5-2" },
                { label: "💳 환불 요청", value: "5-3" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        })
        setMenuStep("menu5")
        return;
    }

    if(text === "back") {
        setMenuStep("main");
        showMainMenu();
        return;
    }

    addMessage({
        from:"bot",
        text:"올바른 메뉴를 선택해주세요.",
        buttons: [
            { label: "🏠 메인 메뉴로", value: "back" }
        ]
    })

};

export default MenuMain;