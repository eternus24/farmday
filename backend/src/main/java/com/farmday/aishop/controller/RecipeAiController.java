package com.farmday.aishop.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.aishop.service.RecipeService;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class RecipeAiController {

    private final RecipeService recipeService;


    /** 단일 레시피 생성 */
    @PostMapping("/recipe")
    public Map<String, String> getRecipe(@RequestBody Map<String, String> req) {

        String ingredients = req.get("ingredients");
        String aiResult = recipeService.generateRecipe(ingredients);

        Map<String, String> result = new HashMap<>();
        result.put("result", aiResult);

        return result;
    }


    /** 요리 3개 추천 */
    @PostMapping("/recipe/list")
    public Map<String, Object> getRecipeList(@RequestBody Map<String, String> req){

        String ingredients = req.get("ingredients");
        List<String> recipes = recipeService.generateRecipeList(ingredients);

        Map<String, Object> result = new HashMap<>();
        result.put("recipes", recipes);

        return result;
    }


    /** 선택한 요리 상세 */
    @PostMapping("/recipe/detail")
    public Map<String, String> getRecipeDetail(@RequestBody Map<String, String> req){

        String dishName = req.get("dishName");

        String detail = recipeService.generateRecipeDetail(dishName);

        Map<String, String> result = new HashMap<>();
        result.put("result", detail);

        return result;
    }
}
