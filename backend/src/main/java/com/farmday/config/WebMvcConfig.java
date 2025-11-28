// com.farmday.config.WebMvcConfig
package com.farmday.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 윈도우 기준 예시 경로 (마지막에 / 꼭)
        String uploadPath = "file:///D:/farmday/uploads/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}