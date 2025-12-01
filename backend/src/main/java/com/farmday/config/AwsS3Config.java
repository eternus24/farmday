// backend/src/main/java/com/example/config/AwsS3Config.java
package com.farmday.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsS3Config {

    @Value("${aws.region}")
    private String region;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                // ~/.aws/credentials, 환경변수 등에서 자동으로 키를 읽어옴
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}