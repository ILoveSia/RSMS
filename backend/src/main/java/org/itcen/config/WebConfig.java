package org.itcen.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 웹 설정 클래스
 * 
 * Spring Boot 3.5의 웹 관련 설정을 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 웹 설정만 담당
 * - Interface Segregation: WebMvcConfigurer 인터페이스의 필요한 메서드만 구현
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * CORS 설정
     * 
     * 프론트엔드 애플리케이션에서 백엔드 API에 접근할 수 있도록
     * Cross-Origin Resource Sharing을 설정합니다.
     * 
     * @param registry CORS 레지스트리
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://127.0.0.1:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }



    /**
     * ObjectMapper Bean 설정
     * JSON 직렬화/역직렬화를 위한 ObjectMapper 설정
     * 
     * @return 설정된 ObjectMapper
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Java 8 시간 모듈 등록
        mapper.registerModule(new JavaTimeModule());
        
        // 프로퍼티 네이밍 전략 설정 (camelCase 유지)
        mapper.setPropertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE);
        
        // null 값 제외 설정
        mapper.setDefaultPropertyInclusion(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL);
        
        // 날짜를 타임스탬프로 쓰지 않도록 설정
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // 빈 객체 직렬화 실패 방지
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS);
        
        // 알 수 없는 프로퍼티 무시
        mapper.disable(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        
        return mapper;
    }
} 