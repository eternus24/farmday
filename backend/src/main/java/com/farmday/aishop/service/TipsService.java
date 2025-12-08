package com.farmday.aishop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TipsService {

    @Value("${openai.api-key}")
    private String openAiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();


    /** 보관/손질 팁 생성 */
    public String generateTips(String keyword) {

        //body 구성
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        //message 배열
        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> sys = new HashMap<>();
        sys.put("role", "system");
        sys.put("content",
                "너는 식재료 보관/손질 전문가 AI이다.\n"
                + "사용자가 입력한 식재료에 대해 보관 및 손질 방법을 "
                + "Markdown 형식으로 가독성 있게 노인분들이 읽기 쉽게 제공하라.\n\n"
                + "예시 형식:\n"
                + "🥕 보관 방법\n"
                + "설명 1\n"
                + "설명 2\n\n"
                + "🔪 손질 팁\n"
                + "설명 1\n"
                + "설명 2\n"
        );
        messages.add(sys);

        Map<String, String> user = new HashMap<>();
        user.put("role", "user");
        user.put("content", "식재료: " + keyword);
        messages.add(user);

        body.put("messages", messages);
        //헤더 구성
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        //api 호출
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.openai.com/v1/chat/completions",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
            //응답 파싱
            List choices = (List) response.getBody().get("choices");
            Map first = (Map) choices.get(0);
            Map msg = (Map) first.get("message");
            //반환 결과 프론트로 전달
            return (String) msg.get("content");

        } catch (Exception e) {
            return "손질/보관 정보 생성 중 오류가 발생했습니다.";
        }
    }
}