// src/components/chatbot/menu/DetailMenu1.jsx

import { searchProducts } from '../../../assets/js/api/ShopApi';

const DetailMenu1 = ({ text, addMessage, menuStep, setMenuStep }) => {

    // ================================
    // 0. 뒤로가기
    // ================================
    if (text === "back") {
        setMenuStep("main");
        addMessage({
            from: "bot",
            text: "메인 메뉴로 돌아갑니다.",
            buttons: [{ label: "🏠 메인 메뉴", value: "back" }]
        });
        return;
    }

    // ================================
    // 1. 상품명 검색 단계(menu1_search)
    // ================================
    if (menuStep === "menu1_search") {
        (async () => {
            try {
                const result = await searchProducts({ keyword: text });

                addMessage({
                    from: "bot",
                    text: "검색 결과입니다.",
                    products: result
                });
            } catch (err) {
                console.error("상품 검색 실패:", err);
                addMessage({
                    from: "bot",
                    text: "상품 검색 중 오류가 발생했습니다."
                });
            }
        })(); // 즉시 실행
        return;
    }

    // ================================
    // 2. 가격대 추천 메뉴 열기
    // ================================
    if (text === "1-2") {
        addMessage({
            from: "bot",
            text: "원하는 가격대를 선택해주세요.",
            buttons: [
                { label: "💰 5천원 이하", value: "1-2_5000" },
                { label: "💰 1만원 이하", value: "1-2_10000" },
                { label: "💰 2만원 이하", value: "1-2_20000" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        });
        return;
    }

    // ================================
    // 2-1. 가격 선택 처리
    // ================================
    if (text.startsWith("1-2_")) {
        const maxPrice = parseInt(text.replace("1-2_", ""), 10);

        (async () => {
            try {
                const result = await searchProducts({ maxPrice });

                addMessage({
                    from: "bot",
                    text: `${maxPrice.toLocaleString()}원 이하 추천 상품입니다.`,
                    products: result
                });
            } catch (err) {
                console.error("가격대 검색 실패:", err);
                addMessage({
                    from: "bot",
                    text: "검색 중 오류가 발생했습니다."
                });
            }
        })();
        return;
    }

    // ================================
    // 3. 정렬 추천
    // ================================
    if (text.includes("-cheap") || text.includes("-popular") || text.includes("-review")) {

        let sortKey = null;

        if (text.includes("-cheap")) sortKey = "cheap";
        if (text.includes("-popular")) sortKey = "popular";
        if (text.includes("-review")) sortKey = "review";

        (async () => {
            try {
                const result = await searchProducts({ sort: sortKey });

                addMessage({
                    from: "bot",
                    text: "추천 결과입니다!",
                    products: result
                });
            } catch (err) {
                console.error("정렬 추천 오류:", err);
                addMessage({
                    from: "bot",
                    text: "추천 중 오류가 발생했습니다."
                });
            }
        })();

        return;
    }

    // ================================
    // 4. 처리 불가 입력
    // ================================
    addMessage({
        from: "bot",
        text: "알 수 없는 입력입니다. 다시 선택해주세요.",
        buttons: [{ label: "⬅️ 뒤로가기", value: "back" }]
    });

};

export default DetailMenu1;
