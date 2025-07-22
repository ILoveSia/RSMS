#!/bin/bash

# 🚀 Java 개발 환경 최적화 스크립트

echo "🔧 Java 개발 환경 최적화 시작..."

# 1. Gradle 캐시 정리
echo "📦 Gradle 캐시 정리 중..."
./gradlew clean

# 2. 종속성 새로고침
echo "🔄 종속성 새로고침..."
./gradlew --refresh-dependencies

# 3. 빌드 캐시 활성화 확인
echo "🏗️ 빌드 캐시 설정 확인..."
if [ ! -f "gradle.properties" ]; then
    echo "gradle.properties 파일이 없습니다. 생성합니다..."
    cat > gradle.properties << EOF
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.caching=true
org.gradle.jvmargs=-Xmx4g -Xms1g -XX:+UseG1GC
EOF
fi

# 4. 컴파일 및 테스트 (병렬 실행)
echo "⚡ 최적화된 빌드 실행..."
./gradlew compileJava --parallel --build-cache

echo "✅ 최적화 완료!"
echo ""
echo "🎯 다음 명령어로 개발 서버를 실행하세요:"
echo "   ./gradlew bootRun"
echo ""
echo "💡 IDE 설정 팁:"
echo "   - IntelliJ: Build, Execution, Deployment > Compiler > Build project automatically 체크"
echo "   - IntelliJ: Registry에서 compiler.automake.allow.when.app.running=true 설정"
echo "   - VS Code: Java extension pack 설치 후 Hot Code Replace 활성화"