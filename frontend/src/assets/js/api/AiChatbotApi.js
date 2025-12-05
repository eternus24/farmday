import api from "./ShopApi"

//요리 3개 추천 (설명 없이 이름만)
export const getRecipeList = async(ingredients) => {
    const res = await api.post("/api/ai/recipe/list",{ingredients})
    return res.data
}

//요리 상세 설명
export const getRecipeDetail = async(dishName) => {
    const res = await api.post("/api/ai/recipe/detail",{dishName})
    return res.data;
}

//재료 기반 레시피 추천
export const getRecipe = async(ingredients) => {
    const res = await api.post("/api/ai/recipe",{ingredients})
    return res.data;
}

//식재료 보관/손질
export const getTips = async(keyword) => {
    const res = await api.post("/api/ai/tips",{keyword});
    return res.data;
}

//생산자 스토어 추천
export const getStoreRecommend = async(keyword) => {
    const res = await api.post("/api/ai/storeRecommend", {keyword})
    return res.data
}

//chatgpt 대화
export const chatMessage = async(message) => {
    const res = await api.post("/api/ai/chat",{message})
    return res.data
}

export default {
    getRecipe,
    getTips,
    getStoreRecommend,
    chatMessage
}