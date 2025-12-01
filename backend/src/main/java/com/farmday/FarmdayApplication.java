// backend/src/main/java/com/farmday/FarmdayApplication.java
package com.farmday;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FarmdayApplication {
    public static void main(String[] args) {
        SpringApplication.run(FarmdayApplication.class, args);

    }

}
