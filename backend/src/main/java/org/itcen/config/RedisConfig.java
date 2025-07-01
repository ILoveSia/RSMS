package org.itcen.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

/**
 * Redis 설정 클래스
 * 
 * Spring Boot 3.5와 Redis 연동을 위한 설정을 담당합니다.
 * 세션 관리와 캐싱을 위한 Redis 설정을 포함합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Redis 설정만 담당
 * - Dependency Inversion: 추상화된 RedisConnectionFactory에 의존
 */
@Configuration
@Profile({"local", "docker", "prod"}) // H2 프로파일에서는 비활성화
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 3600) // 1시간 세션 유지
public class RedisConfig {

    /**
     * Redis 연결 팩토리 설정
     * 
     * @return Redis 연결 팩토리
     */
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory("localhost", 6379);
    }

    /**
     * Redis Template 설정
     * 
     * Redis와의 데이터 교환을 위한 템플릿을 설정합니다.
     * JSON 직렬화를 통해 객체를 Redis에 저장할 수 있습니다.
     * 
     * @param connectionFactory Redis 연결 팩토리
     * @return 설정된 RedisTemplate
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Key 직렬화 설정 (String)
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Value 직렬화 설정 (JSON)
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.activateDefaultTyping(
            objectMapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(objectMapper);
        
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        // 설정 적용
        template.afterPropertiesSet();
        
        return template;
    }

    /**
     * String 전용 Redis Template 설정
     * 
     * 단순한 문자열 데이터를 위한 최적화된 템플릿입니다.
     * 
     * @param connectionFactory Redis 연결 팩토리
     * @return 설정된 StringRedisTemplate
     */
    @Bean
    public org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return new org.springframework.data.redis.core.StringRedisTemplate(connectionFactory);
    }
} 