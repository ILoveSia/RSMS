# Multi-stage build for optimized Docker image
FROM eclipse-temurin:21-jdk-alpine as builder

# 작업 디렉토리 설정
WORKDIR /app

# Gradle wrapper와 build.gradle 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# 의존성 다운로드 (캐시 최적화)
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사
COPY src src

# 애플리케이션 빌드
RUN ./gradlew clean build --no-daemon -x test

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

# 시스템 의존성 설치
RUN apk add --no-cache curl

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 결과물 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 애플리케이션 실행을 위한 사용자 생성
RUN addgroup -g 1000 spring && adduser -u 1000 -G spring -s /bin/sh -D spring
RUN chown -R spring:spring /app
USER spring

# 포트 노출
EXPOSE 8080

# JVM 옵션 및 실행 명령
ENV JAVA_OPTS="-Xms512m -Xmx1024m -Dspring.profiles.active=docker -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Seoul"
ENV JVM_OPTS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+UseContainerSupport"

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# 애플리케이션 실행
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS $JVM_OPTS -jar app.jar"] 