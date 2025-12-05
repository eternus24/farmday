import { searchProducts } from '../../../assets/js/api/ShopApi';
import { showMainMenu } from './MenuMain';

const DetailMenu1 = ({ text, addMessage, setMenuStep }) => {

    // 0. 뒤로가기
    if (text === "back") {
        setMenuStep("main");
        showMainMenu(addMessage);
        return;
    }

    // 1. AI 장보기 → 가격대 버튼 출력
    if (text === "shop-ai") {
        addMessage({
            from: "bot",
            text: "원하는 가격대를 선택해주세요.",
            buttons: [
                { label: "💰 5천원 이하", value: "shop-ai_0_5000" },
                { label: "💰 5천원 ~ 1만원", value: "shop-ai_5000_10000" },
                { label: "💰 1만원 이상", value: "shop-ai_10000_50000" },
                { label: "⬅️ 뒤로가기", value: "back" }
            ]
        });
        return;
    }

    // 2. 가격대 선택 처리
    if (text.startsWith("shop-ai_")) {
        const parts = text.split("_");
        const minPrice = parseInt(parts[1], 10);
        const maxPrice = parseInt(parts[2], 10);

        (async () => {
            try {
                const result = await searchProducts({ minPrice, maxPrice });

                addMessage({
                    from: "bot",
                    text: "FarmDay 추천 상품입니다.",
                    products: result
                });

                addMessage({
                    from: "bot",
                    text: "다른 가격대도 확인할 수 있어요.",
                    buttons: [
                        { label: "💰 5천원 이하", value: "shop-ai_0_5000" },
                        { label: "💰 5천원 ~ 1만원", value: "shop-ai_5000_10000" },
                        { label: "💰 1만원 이상", value: "shop-ai_10000_50000" },
                        { label: "⬅️ 뒤로가기", value: "back" }
                    ]
                });
            } catch (err) {
                addMessage({
                    from: "bot",
                    text: "검색 중 오류가 발생했습니다."
                });
            }
        })();

        return;
    }

    // 3. 예외 처리
    addMessage({
        from: "bot",
        text: "알 수 없는 입력입니다. 다시 선택해주세요.",
        buttons: [{ label: "⬅️ 뒤로가기", value: "back" }]
    });
};

export default DetailMenu1;
