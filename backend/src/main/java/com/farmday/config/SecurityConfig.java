// backend/src/main/java/com/farmday/config/SecurityConfig.java
package com.farmday.config;

import com.farmday.security.jwt.JwtAuthenticationFilter;
import com.farmday.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf().disable()
            .cors().and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                // 프론트 정적 리소스 허용
                .antMatchers(
                        "/",
                        "/index.html",
                        "/favicon.ico",
                        "/static/**",
                        "/public/**",
                        "/assets/**",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/groupdeal/**"
                ).permitAll()
                // 인증/회원가입 API
                .antMatchers("/api/auth/**").permitAll()
                // Swagger (있으면)
                .antMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // 관리자 / 생산자 전용
                .antMatchers("/admin/**").hasRole("ADMIN")
                .antMatchers("/producer/**").hasRole("PRODUCER")
                // 나머지는 인증 필요
                .anyRequest().authenticated()
            .and()
            // JWT 필터 추가
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // JwtAuthenticationFilter 빈
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }

    // 비밀번호 암호화용
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(Arrays.asList("http://*:*", "https://*:*"));
        cfg.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(Arrays.asList("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}