package com.farmday.aishop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RecipeService {

    @Value("${openai.api-key}")
    private String openAiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    //사용자가 입력한 재료 기반으로 ai 레시피 
    public String generateRecipe(String ingredients) {

        // Body 구성
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        // messages 배열
        List<Map<String, String>> messages = new ArrayList<>();

        // system message
        Map<String, String> sys = new HashMap<>();
        sys.put("role", "system");
        sys.put("content",
                "너는 전문 요리사 AI다. 사용자가 입력한 재료로 만들 수 있는 요리 1가지를 추천해라.\n\n"
                + "출력은 반드시 다음의 Markdown 형식으로 작성해라.\n\n"
                + "🍽️ FarmDay 요리 이름\n"
                + "{요리명}\n\n"
                + "🧂 필요한 재료\n"
                + "- 항목1\n"
                + "- 항목2\n"
                + "- 항목3\n\n"
                + "👨‍🍳 조리 순서\n"
                + "1. 단계1\n"
                + "2. 단계2\n"
                + "3. 단계3\n\n"
                + "문단간 충분한 줄바꿈을 포함하여 가독성을 높여라."
        );
        messages.add(sys);

        // user message
        Map<String, String> user = new HashMap<>();
        user.put("role", "user");
        user.put("content", "재료: " + ingredients);
        messages.add(user);

        body.put("messages", messages);

        // Header 구성
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        // API 호출
        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                entity,
                Map.class
        );

        // 응답 파싱
        try {
            List choices = (List) response.getBody().get("choices");
            Map firstChoice = (Map) choices.get(0);
            Map message = (Map) firstChoice.get("message");
            
            return (String) message.get("content");//반환하는 결과가 프론트로 그래도 전달!

        } catch (Exception e) {
            e.printStackTrace();
            return "레시피 생성 중 오류가 발생했습니다.";
        }
    };

    //재료 기반 요리 이름 3개 추천
    public List<String> generateRecipeList(String ingredients) {

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> sys = new HashMap<>();
        sys.put("role", "system");
        sys.put("content",
                "너는 요리 전문가 AI다.\n"
                + "사용자가 입력한 재료로 만들 수 있는 요리 3가지만 추천해라.\n\n"
                + "출력 형식은 반드시 아래와 같아야 한다:\n"
                + "1) 요리 이름\n"
                + "2) 요리 이름\n"
                + "3) 요리 이름\n\n"
                + "설명 금지. 이름만 출력해라.");
        messages.add(sys);

        Map<String, String> user = new HashMap<>();
        user.put("role", "user");
        user.put("content", "재료: " + ingredients);
        messages.add(user);

        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                entity,
                Map.class
        );

        try {
            List choices = (List) response.getBody().get("choices");
            Map first = (Map) choices.get(0);
            Map msg = (Map) first.get("message");

            String text = (String) msg.get("content");

            // 결과 파싱 → “1) 감자전” 형태를 라인별로 나눔
            List<String> list = new ArrayList<>();
            for (String line : text.split("\n")) {
                line = line.trim();
                if (line.contains(")")) {
                    list.add(line.substring(line.indexOf(")") + 1).trim());
                }
            }

            return list;

        } catch (Exception e) {
            return Arrays.asList("추천 실패");
        }
    }

    // 3) 선택된 요리 상세 레시피 생성
    public String generateRecipeDetail(String dishName) {

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> sys = new HashMap<>();
        sys.put("role", "system");
        sys.put("content",
                "너는 전문 요리사 AI다.\n"
                + "사용자가 선택한 요리에 대해 상세 레시피를 아래의 Markdown 형식으로 제공하라.\n\n"
                + "🍽️ 요리 이름\n"
                + "{요리명}\n\n"
                + "🧂 필요한 재료\n"
                + "- 항목1\n"
                + "- 항목2\n"
                + "- 항목3\n\n"
                + "👨‍🍳 조리 순서\n"
                + "1. 단계1\n"
                + "2. 단계2\n"
                + "3. 단계3\n\n"
                + "문장과 문단은 반드시 줄바꿈을 포함하여 가독성을 높여라.");
        messages.add(sys);

        Map<String, String> user = new HashMap<>();
        user.put("role", "user");
        user.put("content", "요리 이름: " + dishName);
        messages.add(user);

        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                entity,
                Map.class
        );

        try {
            List choices = (List) response.getBody().get("choices");
            Map first = (Map) choices.get(0);
            Map msg = (Map) first.get("message");

            return (String) msg.get("content");

        } catch (Exception e) {
            return "상세 레시피 생성 중 오류가 발생했습니다.";
        }
    }
}
