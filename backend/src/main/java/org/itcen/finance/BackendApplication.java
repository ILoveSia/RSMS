package org.itcen.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

/**
 * ITCEN Solution Backend Application
 * 
 * Spring Boot 3.5 기반의 재사용 가능한 웹 애플리케이션
 * 
 * 주요 기능:
 * - JPA Auditing 활성화 (생성일시, 수정일시 자동 관리)
 * - JPA Repository 스캔 활성화
 * - JPA Entity 스캔 활성화
 * - Redis Session 관리 활성화
 * - Component Scan 최적화
 */
@SpringBootApplication(
    scanBasePackages = "org.itcen",
    exclude = {
        org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class,
        org.springframework.boot.autoconfigure.session.SessionAutoConfiguration.class
    }
)
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = {"org.itcen.domain.*.repository", "org.itcen.auth.repository"})
@EntityScan(basePackages = {"org.itcen.domain.*.entity", "org.itcen.auth.domain"})
// @EnableRedisHttpSession(maxInactiveIntervalInSeconds = 3600) // H2 프로파일에서는 비활성화
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

}
