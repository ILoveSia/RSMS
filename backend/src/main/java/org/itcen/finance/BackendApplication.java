package org.itcen.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * ITCEN Solution Backend Application
 *
 * Spring Boot 3.5 기반의 재사용 가능한 웹 애플리케이션
 *
 * 주요 기능: - JPA Auditing 활성화 (생성일시, 수정일시 자동 관리) - JPA Repository 스캔 활성화 - JPA Entity 스캔 활성화 - Redis
 * Session 관리 활성화 - Component Scan 최적화
 */
@SpringBootApplication(scanBasePackages = "org.itcen", exclude = {
        org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class,
        org.springframework.boot.autoconfigure.session.SessionAutoConfiguration.class})
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = {"org.itcen.domain.departments.repository",
        "org.itcen.domain.common.repository", "org.itcen.domain.casestudy.repository",
        "org.itcen.domain.hodicitem.repository", "org.itcen.domain.meeting.repository",
        "org.itcen.domain.menu.repository", "org.itcen.domain.positions.repository",
        "org.itcen.domain.qna.repository", "org.itcen.domain.responsibility.repository",
        "org.itcen.domain.user.repository", "org.itcen.auth.repository",
                "org.itcen.domain.execofficer.repository", "org.itcen.domain.submission.repository",
        "org.itcen.domain.submissionreport.repository",
        "org.itcen.domain.positionresponsibility.repository", "org.itcen.domain.audit.repository",
        "org.itcen.domain.employee.repository", "org.itcen.domain.approval.repository",
        "org.itcen.domain.handover.repository", "org.itcen.domain.notice.repository"})
@EntityScan(basePackages = {"org.itcen.domain.departments.entity", "org.itcen.domain.common.entity",
        "org.itcen.domain.casestudy.entity", "org.itcen.domain.hodicitem.entity",
        "org.itcen.domain.meeting.entity", "org.itcen.domain.menu.entity",
        "org.itcen.domain.positions.entity", "org.itcen.domain.qna.entity",
        "org.itcen.domain.responsibility.entity", "org.itcen.domain.user.entity",
        "org.itcen.auth.domain", "org.itcen.auth.domain.permission",
                "org.itcen.domain.execofficer.entity", "org.itcen.domain.submission.entity",
        "org.itcen.domain.submissionreport.entity",
        "org.itcen.domain.positionresponsibility.entity", "org.itcen.domain.audit.entity",
        "org.itcen.domain.employee.entity", "org.itcen.domain.approval.entity",
        "org.itcen.domain.handover.entity", "org.itcen.domain.notice.entity"})
// @EnableRedisHttpSession(maxInactiveIntervalInSeconds = 3600) // H2 프로파일에서는 비활성화
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

}
