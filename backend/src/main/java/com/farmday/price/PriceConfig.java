// backend/src/main/java/com/farmday/price/PriceConfig.java
package com.farmday.price;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class PriceConfig {

    // KAMIS 호출용 HTTP 클라이언트
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
