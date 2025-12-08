import { getRecipe,getRecipeList,getRecipeDetail } from '../../../assets/js/api/AiChatbotApi';

const DetailMenu2 = async ({ text, addMessage, setMenuStep }) => {

    // 뒤로가기
    if (text === "back") {
        setMenuStep("main");
        addMessage({
            from: "bot",
            text: "메인 메뉴로 돌아갑니다.",
            buttons: [{ label: "🏠 메인 메뉴", value: "back" }]
        });
        return;
    }

    //요리 상세 요청 버튼
    if(text.startsWith("recipe-detail:")){
        const dishName = text.replace("recipe-detail:","");

        addMessage({from:"bot",text:`AI가 ${dishName} 레시피를 불러오는 중입니다.⏳`});
        const data = await getRecipeDetail(dishName);
        addMessage({from:"bot",text:data.result});
        addMessage({
            from:"bot",
            text:"다른 요리로 추천받으시겠습니까?",
            buttons:[
                { label: "🔄 다른 요리 추천", value: "recipe-more" },
                { label: "⬅ 뒤로가기", value: "back" }
            ]
        })
        return
    }

    //다른 요리 추천
    if(text === "recipe-more"){
        const ingredients = localStorage.getItem("lastIngredients");
        const listData = await getRecipeList(ingredients);

        addMessage({
            from:"bot",
            text:"AI가 새로운 요리들을 추천해드릴께요.",
            buttons: [
                ...listData.recipes.map(name => ({
                    label: name,
                    value: `recipe-detail:${name}`
                })),
                { label: "🔄 다시 추천", value: "recipe-more" },
                { label: "⬅ 뒤로가기", value: "back" }
            ]
        })
        return
    }
    //요리 & 재료인지 확인
    const isDishName = text.length >= 3; //3자리 이상이면 요리로 판단!!

    //요리 이름으로 입력한 경우
    if(isDishName){
        addMessage({
            from:"bot",
            text:`AI가 ${text} 레시피를 검색 중입니다...⏳`
        })

        const data = await getRecipeDetail(text);

        addMessage({from:"bot",text:data.result})

        addMessage({
            from:"bot",
            text:"다른 메뉴를 원하시면 선택해주세요.",
            buttons: [{ label: "⬅ 뒤로가기", value: "back" }]
        })
        return
    }

    //********** 재료 기반으로 요리 3개 추천 **********
    const ingredients = text;

    addMessage({
        from: "bot",
        text: `AI가 입력하신 재료 '${ingredients}'로 만들 수 있는 요리를 추천해드릴게요! ⏳`
    });

    localStorage.setItem("lastIngredients", ingredients);

    const listData = await getRecipeList(ingredients);

    addMessage({
        from: "bot",
        text: "AI가 다음 요리들을 추천합니다!",
        buttons: [
            ...listData.recipes.map(name => ({
                label: name,
                value: `recipe-detail:${name}`
            })),
            { label: "🔄 다른 추천 보기", value: "recipe-more" },
            { label: "⬅ 뒤로가기", value: "back" }
        ]
    });

    return;
};

export default DetailMenu2;