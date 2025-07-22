# Multi-stage build for React application
FROM node:18-alpine as builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (빌드를 위해 devDependencies 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# 환경 변수 설정
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 애플리케이션 빌드
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 애플리케이션 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 3000

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"] 