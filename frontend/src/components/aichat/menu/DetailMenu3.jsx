import { getTips } from "../../../assets/js/api/AiChatbotApi";

const DetailMenu3 = ({ text, addMessage, setMenuStep, menuStep }) => {

    // ⬅ 뒤로가기
    if (text === "back") {
        setMenuStep("main");
        addMessage({
            from: "bot",
            text: "메인 메뉴로 돌아갑니다.",
            buttons: [{ label: "🏠 메인 메뉴", value: "back" }]
        });
        return;
    }

    if (text === "tips") {
        setMenuStep("tips");
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
        return;
    }

    /* -------------------------------------------------------------------
       1) tips 메뉴에 처음 들어온 상태 (카테고리 선택 UI)
    ------------------------------------------------------------------- */
    if (menuStep === "tips") {

        const categoryMap = {
            "tips-fruit": "과일",
            "tips-lettuce": "채소",
            "tips-potato": "생선",
            "tips-meet": "고기"
        };

        const category = categoryMap[text];

        // ✔ 버튼으로 선택한 카테고리라면
        if (category) {
            setMenuStep("tipsInput");
            addMessage({
                from: "bot",
                text: `${category} 중 어떤 항목의 보관/손질 팁을 알고 싶으신가요? [예) 식재료명 입력]`
            });
            return;
        }

        // ✔ 텍스트로 바로 재료 입력한 경우 → 바로 검색
        if (!text.startsWith("tips-")) {
            return searchTip(text, addMessage, setMenuStep);
        }

        // ✔ 버튼도 텍스트도 아닐 때
        addMessage({
            from: "bot",
            text: "식재료를 입력하거나 카테고리를 선택해주세요."
        });
        return;
    }

    /* -------------------------------------------------------------------
       2) tipsInput (카테고리 선택 후 실제 재료 입력)
    ------------------------------------------------------------------- */
    if (menuStep === "tipsInput") {
        return searchTip(text, addMessage, setMenuStep);
    }
};

/* --------------------------------------------------------------
   ✨ 재사용 가능한 보관/손질 정보 검색 함수
-------------------------------------------------------------- */
const searchTip = (item, addMessage, setMenuStep) => {

    item = item.trim();

    addMessage({
        from: "bot",
        text: `AI가 ${item} 정보를 검색 중입니다... ⏳`
    });

    (async () => {
        const data = await getTips(item);

        if (!data || !data.result) {
            addMessage({
                from: "bot",
                text: "정보를 찾을 수 없습니다. 다시 입력해주세요.",
                buttons: [
                    { label: "새 항목 입력", value: "tips" },
                    { label: "⬅ 뒤로가기", value: "back" }
                ]
            });
            return;
        }

        // 정상 출력
        addMessage({
            from: "bot",
            text: data.result,
            category: "tips"
        });

        //네이버 검색 버튼 추가
        const query = encodeURIComponent(`${item} 손질 방법`);
        addMessage({
            from: "bot",
            text: "자세한 손질법이 더 궁금하다면 아래를 눌러 확인하세요!",
            buttons: [
                {
                    label: "🔍 네이버에서 더 보기",
                    value: `naver-search:${query}`
                },
                { label: "새 항목 입력", value: "tips" },
                { label: "⬅ 뒤로가기", value: "back" }
            ]
        });

        setMenuStep("tips");
    })();
};

export default DetailMenu3;