import React from 'react';
import { fetchPriceDetail } from '../../../api/priceApi';

const KEYWORDS = [
    "사과","배","딸기","귤","포도",
    "토마토","양파","대파","감자","고구마",
    "배추","상추","고추","오이","깻잎",
    "돼지고기","소고기","닭고기","계란"
]

//사용자 문장 -> 키워드 추출
function extractKeyword(text) {
    return KEYWORDS.find(k => text.includes(k));
}
//키워드 랜덤 추출
function getRandomKeywords(count = 4) {
    const shuffled = [...KEYWORDS].sort(() => 0.4 - Math.random())
    return shuffled.slice(0,count);
}

//시세 분석 처리
async function handlePriceIntent(text,addMessage,navigate) {
    const keyword = extractKeyword(text);

    //키워드 못찾을 경우
    if(!keyword){
        return addMessage({
            from:"bot",
            text:"어떤 품목의 가격이 궁금하신 가요? \n예) '토마토 가격', '양파 시세'"
        })
    }
    try{
        //api 호출
        const data = await fetchPriceDetail(keyword)

        //ai 스타일 설명 생성
        const desc =
        data.up === false
            ? `오늘은 평소보다 가격이 내려갔어요.\n지금 사두셔도 괜찮아요!`
            : data.up === true
            ? `오늘은 가격이 조금 올랐어요.\n급하지 않다면 기다리셔도 돼요.`
            : `오늘은 가격이 변동 없이 안정적인 날이에요.`;

        // 메시지 출력
        addMessage({
        from: "bot",
        text:
            `📊 ${keyword} 가격 분석 결과\n\n` +
            `• 오늘 가격: ${data.todayPrice.toLocaleString()}원\n` +
            `• 평소 대비 변화: ${data.diffRate}%\n\n` +
            `${desc}`,
        buttons: [
            { label: "📈 시세 상세 페이지", value: `go-price:${keyword}` },
            { label: "다른 품목 보기", value: "ask-more" },
        ]
    });

    }catch(err){
        console.error(err);
        addMessage({
            from:"bot",
            text:"시세 정보를 가져오지 못했습니다. 잠시 후 시도해주세요."
        })
    }
}
//시세 정보 메뉴 진입
function showPriceHome(addMessage) {

    const randomItems = getRandomKeywords(4);

    addMessage({
        from: "bot",
        text: "어떤 품목 시세가 궁금하세요?",
        buttons: [
            ...randomItems.map(k => ({ label: k, value: k + " 시세" })),
            { label: "🔄 재정렬", value: "reshuffle" },
        ]
    });
}


const DetailMenu4 = async ({ text, addMessage, setMenuStep, navigate, mode }) => {

    //다른 품목 보기
    if(text==="ask-more"){
        return showPriceHome(addMessage)
    }

    //재정렬
    if(text === "reshuffle"){
        return showPriceHome(addMessage)
    }

    // --------------------------
    // 2) 시세 상세 이동
    // --------------------------
    if (text.startsWith("go-price:")) {
        const keyword = text.replace("go-price:", "");
        navigate(`/price?item=${encodeURIComponent(keyword)}`);
        return;
    }

    // --------------------------
    // 3) 시세 모드일 때 (support-price)
    // --------------------------
    if (mode === "price") {

        // 시세 질문 감지 → 분석
        if (text.includes("시세") || text.includes("가격")) {
            return await handlePriceIntent(text, addMessage, navigate);
        }
        return showPriceHome(addMessage)
    }
};

export default DetailMenu4;