package com.farmday.aishop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.farmday.aishop.service.TipsService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class TipsAiController {

    private final TipsService tipsService;

    /** 식재료 보관/손질 팁 */
    @PostMapping("/tips")
    public Map<String, String> getTips(@RequestBody Map<String, String> req) {

        String keyword = req.get("keyword");
        String result = tipsService.generateTips(keyword);

        Map<String, String> map = new HashMap<>();
        map.put("result", result);

        return map;
    }
}