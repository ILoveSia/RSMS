# ⚙️ Backend 아키텍처 가이드 (초보자용)

## 📋 목차
- [🎯 개요](#-개요)
- [🛠 기술 스택](#-기술-스택)
- [📁 프로젝트 구조](#-프로젝트-구조)
- [🏗 아키텍처 패턴](#-아키텍처-패턴)
- [🧩 핵심 개념](#-핵심-개념)
- [🔄 데이터 흐름](#-데이터-흐름)
- [📝 개발 가이드](#-개발-가이드)
- [🔒 보안 시스템](#-보안-시스템)
- [💾 데이터베이스 설계](#-데이터베이스-설계)

---

## 🎯 개요

ITCEN Solution Backend는 **Spring Boot 3.5**와 **Java 21**을 기반으로 한 현대적인 RESTful API 서버입니다. 금융기관의 내부통제 시스템을 위한 백엔드 서비스로, 높은 보안성과 확장성을 제공합니다.

### 🎯 주요 특징
- **최신 기술 스택**: Spring Boot 3.5 + Java 21 LTS
- **보안 중심**: Spring Security 6.x 기반 세션 인증
- **확장 가능**: 도메인 기반 모듈 구조
- **고성능**: Redis 캐싱 및 JPA 최적화
- **운영 친화적**: Actuator 기반 모니터링

---

## 🛠 기술 스택

### 📦 Core Framework
```yaml
framework: "Spring Boot 3.5.0"
java_version: "Java 21 LTS"
build_tool: "Gradle 8.x"
architecture: "Layered Architecture"
```

### 🗄 데이터베이스 & 캐시
```yaml
database: "PostgreSQL 17"
cache: "Redis"
orm: "Spring Data JPA"
connection_pool: "HikariCP"
```

### 🔒 보안 & 세션
```yaml
security: "Spring Security 6.x"
session_store: "Spring Session Data Redis"  
authentication: "Session-based"
password_encoding: "BCrypt"
```

### 📊 모니터링 & 도구
```yaml
monitoring: "Spring Boot Actuator"
code_generation: "Lombok"
validation: "Spring Validation"
dev_tools: "Spring Boot DevTools"
```

---

## 📁 프로젝트 구조

```
backend/
├── src/main/
│   ├── java/org/itcen/
│   │   ├── auth/                        # 🔐 인증/인가 시스템
│   │   │   ├── config/                  # 보안 설정
│   │   │   │   └── SecurityConfig.java # Spring Security 설정
│   │   │   ├── controller/              # 인증 API
│   │   │   ├── domain/                  # 인증 DTO & Entity
│   │   │   ├── filter/                  # 보안 필터
│   │   │   ├── handler/                 # 인증 핸들러
│   │   │   ├── repository/              # 인증 데이터 액세스
│   │   │   └── service/                 # 인증 비즈니스 로직
│   │   ├── common/                      # 🔧 공통 유틸리티
│   │   │   ├── dto/                     # 공통 DTO (ApiResponse 등)
│   │   │   ├── entity/                  # 공통 Entity (BaseEntity 등)
│   │   │   └── exception/               # 전역 예외 처리
│   │   ├── config/                      # ⚙️ 전역 설정
│   │   │   ├── RedisConfig.java         # Redis 설정
│   │   │   └── WebConfig.java           # Web 설정 (CORS 등)
│   │   ├── domain/                      # 🏢 비즈니스 도메인
│   │   │   ├── casestudy/              # 케이스 스터디 관리
│   │   │   ├── common/                 # 공통 코드 관리
│   │   │   ├── departments/            # 부서 관리
│   │   │   ├── execofficer/           # 임원 관리
│   │   │   ├── hodicitem/             # 부서장 내부통제 항목
│   │   │   ├── meeting/               # 회의체 관리
│   │   │   ├── menu/                  # 메뉴 관리
│   │   │   ├── positions/             # 직책 관리
│   │   │   ├── qna/                   # Q&A 시스템
│   │   │   ├── responsibility/        # 책임 관리
│   │   │   ├── submission/            # 제출 관리
│   │   │   └── user/                  # 사용자 관리
│   │   └── finance/
│   │       └── BackendApplication.java  # 🚀 메인 애플리케이션
│   └── resources/
│       ├── application.yml              # 🔧 설정 파일
│       └── static/                      # 정적 리소스
├── database/init/                       # 🗄 DB 초기화 스크립트
├── build.gradle                         # 📦 빌드 설정
└── gradle/                              # Gradle 래퍼
```

### 📂 도메인별 구조 패턴

각 도메인은 **계층형 아키텍처**를 따릅니다:

```
domain/
├── controller/             # 🌐 Presentation Layer
│   └── XxxController.java  # REST API 엔드포인트
├── dto/                    # 📝 Data Transfer Objects
│   ├── XxxCreateRequest.java
│   ├── XxxResponse.java
│   └── XxxSearchRequest.java
├── entity/                 # 🗄 Data Layer
│   └── Xxx.java           # JPA Entity
├── repository/             # 💾 Data Access Layer
│   └── XxxRepository.java  # Spring Data JPA Repository
└── service/                # 🔧 Business Layer
    ├── XxxService.java     # Service Interface
    └── XxxServiceImpl.java # Service Implementation
```

---

## 🏗 아키텍처 패턴

### 1. 📐 Layered Architecture (계층형 아키텍처)

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│         (Controller + DTO)              │
├─────────────────────────────────────────┤
│            Business Layer               │
│              (Service)                  │
├─────────────────────────────────────────┤
│           Data Access Layer             │
│            (Repository)                 │
├─────────────────────────────────────────┤
│             Data Layer                  │
│         (Entity + Database)             │
└─────────────────────────────────────────┘
```

### 2. 🏢 Domain-Driven Design (DDD)

비즈니스 도메인별로 패키지를 분리하여 응집력을 높이고 결합도를 낮춥니다:

```java
// 도메인별 독립적인 구조
org.itcen.domain.
├── positions/      // 직책 관리 도메인
├── meeting/        // 회의 관리 도메인  
├── responsibility/ // 책임 관리 도메인
└── qna/           // Q&A 도메인
```

### 3. 🔄 Dependency Injection

Spring의 IoC 컨테이너를 활용한 의존성 주입:

```java
@RestController
@RequiredArgsConstructor  // Lombok: final 필드 생성자 자동 생성
public class PositionController {
    
    private final PositionService positionService;  // 의존성 주입
    
    @GetMapping("/positions")
    public ApiResponse<List<PositionDto>> getPositions() {
        // Service 계층 호출
        List<PositionDto> positions = positionService.getAllPositions();
        return ApiResponse.success(positions);
    }
}
```

---

## 🧩 핵심 개념

### 1. 🚀 애플리케이션 진입점

```java
// BackendApplication.java - Spring Boot 메인 클래스
@SpringBootApplication(
    scanBasePackages = "org.itcen",                    // 컴포넌트 스캔 범위
    exclude = {                                        // 자동 설정 제외
        RedisAutoConfiguration.class,
        RedisRepositoriesAutoConfiguration.class,
        SessionAutoConfiguration.class
    }
)
@EnableJpaAuditing                                     // JPA Auditing 활성화
@EnableJpaRepositories(basePackages = {                // JPA Repository 스캔
    "org.itcen.domain.*.repository",
    "org.itcen.auth.repository"
})
@EntityScan(basePackages = {                          // JPA Entity 스캔
    "org.itcen.domain.*.entity",
    "org.itcen.auth.domain"
})
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
```

### 2. 🌐 REST API Controller 패턴

```java
@RestController
@RequestMapping("/api/positions")
@RequiredArgsConstructor
@Validated
public class PositionController {

    private final PositionService positionService;

    // 📋 목록 조회 - GET /api/positions
    @GetMapping
    public ApiResponse<Page<PositionDto>> getPositions(
        @Valid PositionSearchRequestDto searchDto,
        Pageable pageable
    ) {
        Page<PositionDto> positions = positionService.getPositions(searchDto, pageable);
        return ApiResponse.success(positions);
    }

    // 📝 상세 조회 - GET /api/positions/{id}
    @GetMapping("/{id}")
    public ApiResponse<PositionDetailDto> getPosition(@PathVariable Long id) {
        PositionDetailDto position = positionService.getPositionDetail(id);
        return ApiResponse.success(position);
    }

    // ➕ 생성 - POST /api/positions
    @PostMapping
    public ApiResponse<PositionDto> createPosition(
        @Valid @RequestBody PositionCreateRequestDto createDto
    ) {
        PositionDto created = positionService.createPosition(createDto);
        return ApiResponse.success(created);
    }

    // ✏️ 수정 - PUT /api/positions/{id}
    @PutMapping("/{id}")
    public ApiResponse<PositionDto> updatePosition(
        @PathVariable Long id,
        @Valid @RequestBody PositionUpdateRequestDto updateDto
    ) {
        PositionDto updated = positionService.updatePosition(id, updateDto);
        return ApiResponse.success(updated);
    }

    // 🗑️ 삭제 - DELETE /api/positions/{id}
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePosition(@PathVariable Long id) {
        positionService.deletePosition(id);
        return ApiResponse.success();
    }
}
```

### 3. 🔧 Service Layer 패턴

```java
// Service Interface
public interface PositionService {
    Page<PositionDto> getPositions(PositionSearchRequestDto searchDto, Pageable pageable);
    PositionDetailDto getPositionDetail(Long id);
    PositionDto createPosition(PositionCreateRequestDto createDto);
    PositionDto updatePosition(Long id, PositionUpdateRequestDto updateDto);
    void deletePosition(Long id);
}

// Service Implementation
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)  // 기본적으로 읽기 전용 트랜잭션
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;

    @Override
    public Page<PositionDto> getPositions(PositionSearchRequestDto searchDto, Pageable pageable) {
        // 1. Repository에서 데이터 조회
        Page<Position> positions = positionRepository.findBySearchCondition(searchDto, pageable);
        
        // 2. Entity → DTO 변환
        return positions.map(PositionDto::from);
    }

    @Override
    @Transactional  // 쓰기 작업은 별도 트랜잭션
    public PositionDto createPosition(PositionCreateRequestDto createDto) {
        // 1. DTO → Entity 변환
        Position position = Position.builder()
            .name(createDto.getName())
            .description(createDto.getDescription())
            .build();

        // 2. 저장
        Position saved = positionRepository.save(position);

        // 3. Entity → DTO 변환 후 반환
        return PositionDto.from(saved);
    }
}
```

### 4. 💾 Repository Layer 패턴

```java
// Spring Data JPA Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    // 🔍 쿼리 메서드 (메서드 이름으로 쿼리 자동 생성)
    List<Position> findByNameContaining(String name);
    Optional<Position> findByName(String name);
    boolean existsByName(String name);

    // 📊 사용자 정의 쿼리 (JPQL)
    @Query("SELECT p FROM Position p WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    Page<Position> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 🗂️ 네이티브 쿼리 (SQL)
    @Query(value = "SELECT * FROM positions WHERE created_at >= :startDate", nativeQuery = true)
    List<Position> findRecentPositions(@Param("startDate") LocalDateTime startDate);

    // 🔧 사용자 정의 Repository 확장
    Page<Position> findBySearchCondition(PositionSearchRequestDto searchDto, Pageable pageable);
}

// 사용자 정의 Repository 구현
@Repository
@RequiredArgsConstructor
public class PositionRepositoryCustomImpl implements PositionRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Position> findBySearchCondition(PositionSearchRequestDto searchDto, Pageable pageable) {
        QPosition position = QPosition.position;

        // 동적 쿼리 구성
        BooleanBuilder builder = new BooleanBuilder();
        
        if (StringUtils.hasText(searchDto.getName())) {
            builder.and(position.name.containsIgnoreCase(searchDto.getName()));
        }
        
        if (StringUtils.hasText(searchDto.getDescription())) {
            builder.and(position.description.containsIgnoreCase(searchDto.getDescription()));
        }

        // 쿼리 실행
        List<Position> content = queryFactory
            .selectFrom(position)
            .where(builder)
            .orderBy(position.createdAt.desc())
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        long total = queryFactory
            .selectFrom(position)
            .where(builder)
            .fetchCount();

        return new PageImpl<>(content, pageable, total);
    }
}
```

### 5. 🗄 Entity 설계 패턴

```java
@Entity
@Table(name = "positions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(callSuper = false)
public class Position extends BaseTimeEntity {  // 공통 필드 상속

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PositionStatus status = PositionStatus.ACTIVE;

    // 🔗 연관관계 매핑
    @OneToMany(mappedBy = "position", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PositionAdmin> admins = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "position_meetings",
        joinColumns = @JoinColumn(name = "position_id"),
        inverseJoinColumns = @JoinColumn(name = "meeting_id")
    )
    private Set<MeetingBody> meetings = new HashSet<>();

    // 🏗️ Builder 패턴
    @Builder
    public Position(String name, String description, PositionStatus status) {
        this.name = name;
        this.description = description;
        this.status = status != null ? status : PositionStatus.ACTIVE;
    }

    // 📝 비즈니스 메서드
    public void updateInfo(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public void activate() {
        this.status = PositionStatus.ACTIVE;
    }

    public void deactivate() {
        this.status = PositionStatus.INACTIVE;
    }
}

// 공통 Base Entity
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseTimeEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(updatable = false, length = 100)
    private String createdBy;

    @LastModifiedBy
    @Column(length = 100)  
    private String updatedBy;
}
```

---

## 🔄 데이터 흐름

### 1. 📡 일반적인 API 요청 흐름

```
[클라이언트] 
    ↓ HTTP Request
[Controller]
    ↓ DTO 검증 (@Valid)
[Service] 
    ↓ 비즈니스 로직 처리
[Repository]
    ↓ JPA Query 실행
[Database]
    ↓ 결과 반환
[Service]
    ↓ Entity → DTO 변환
[Controller]
    ↓ ApiResponse 래핑
[클라이언트]
```

### 2. 🔍 상세 데이터 처리 흐름

```java
// 1. 클라이언트 요청
POST /api/positions
{
  "name": "팀장",
  "description": "팀 리더 역할"
}

// 2. Controller에서 요청 받기
@PostMapping
public ApiResponse<PositionDto> createPosition(@Valid @RequestBody PositionCreateRequestDto createDto) {
    // 3. Service 호출
    PositionDto created = positionService.createPosition(createDto);
    return ApiResponse.success(created);
}

// 4. Service에서 비즈니스 로직 처리
@Transactional
public PositionDto createPosition(PositionCreateRequestDto createDto) {
    // 5. Entity 생성
    Position position = Position.builder()
        .name(createDto.getName())
        .description(createDto.getDescription())
        .build();
    
    // 6. Repository로 저장
    Position saved = positionRepository.save(position);
    
    // 7. DTO 변환 후 반환
    return PositionDto.from(saved);
}

// 8. 클라이언트 응답
{
  "success": true,
  "data": {
    "id": 1,
    "name": "팀장",
    "description": "팀 리더 역할",
    "status": "ACTIVE",
    "createdAt": "2025-01-19T10:30:00"
  },
  "message": null,
  "error": null
}
```

### 3. 🔍 페이징 처리 흐름

```java
// 페이징 요청: GET /api/positions?page=0&size=10&sort=name,asc
@GetMapping
public ApiResponse<Page<PositionDto>> getPositions(
    PositionSearchRequestDto searchDto,
    Pageable pageable  // Spring이 자동으로 파라미터 바인딩
) {
    Page<PositionDto> positions = positionService.getPositions(searchDto, pageable);
    return ApiResponse.success(positions);
}

// Service에서 페이징 처리
public Page<PositionDto> getPositions(PositionSearchRequestDto searchDto, Pageable pageable) {
    // Repository에서 페이징된 데이터 조회
    Page<Position> entities = positionRepository.findBySearchCondition(searchDto, pageable);
    
    // Entity Page → DTO Page 변환
    return entities.map(PositionDto::from);
}
```

---

## 📝 개발 가이드

### 1. 🆕 새로운 도메인 추가하기

#### Step 1: 패키지 구조 생성
```
src/main/java/org/itcen/domain/example/
├── controller/
├── dto/
├── entity/
├── repository/
└── service/
```

#### Step 2: Entity 생성
```java
@Entity
@Table(name = "examples")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Example extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Builder
    public Example(String name) {
        this.name = name;
    }
}
```

#### Step 3: Repository 생성
```java
public interface ExampleRepository extends JpaRepository<Example, Long> {
    List<Example> findByNameContaining(String name);
}
```

#### Step 4: DTO 생성
```java
// Request DTO
@Getter
@NoArgsConstructor
public class ExampleCreateRequestDto {
    @NotBlank(message = "이름은 필수입니다")
    private String name;
}

// Response DTO
@Getter
@Builder
public class ExampleDto {
    private Long id;
    private String name;
    private LocalDateTime createdAt;

    public static ExampleDto from(Example example) {
        return ExampleDto.builder()
            .id(example.getId())
            .name(example.getName())
            .createdAt(example.getCreatedAt())
            .build();
    }
}
```

#### Step 5: Service 생성
```java
public interface ExampleService {
    List<ExampleDto> getAllExamples();
    ExampleDto createExample(ExampleCreateRequestDto createDto);
}

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExampleServiceImpl implements ExampleService {

    private final ExampleRepository exampleRepository;

    @Override
    public List<ExampleDto> getAllExamples() {
        return exampleRepository.findAll()
            .stream()
            .map(ExampleDto::from)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExampleDto createExample(ExampleCreateRequestDto createDto) {
        Example example = Example.builder()
            .name(createDto.getName())
            .build();
        
        Example saved = exampleRepository.save(example);
        return ExampleDto.from(saved);
    }
}
```

#### Step 6: Controller 생성
```java
@RestController
@RequestMapping("/api/examples")
@RequiredArgsConstructor
public class ExampleController {

    private final ExampleService exampleService;

    @GetMapping
    public ApiResponse<List<ExampleDto>> getExamples() {
        List<ExampleDto> examples = exampleService.getAllExamples();
        return ApiResponse.success(examples);
    }

    @PostMapping
    public ApiResponse<ExampleDto> createExample(@Valid @RequestBody ExampleCreateRequestDto createDto) {
        ExampleDto created = exampleService.createExample(createDto);
        return ApiResponse.success(created);
    }
}
```

#### Step 7: 애플리케이션에 등록
```java
// BackendApplication.java에 패키지 추가
@EnableJpaRepositories(basePackages = {
    "org.itcen.domain.example.repository",  // 추가
    // ... 기존 패키지들
})
@EntityScan(basePackages = {
    "org.itcen.domain.example.entity",      // 추가
    // ... 기존 패키지들
})
```

### 2. 🗄 데이터베이스 테이블 생성

#### database/init/ 폴더에 SQL 파일 추가
```sql
-- 30.create_table_examples.sql
CREATE TABLE examples (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 인덱스 생성
CREATE INDEX idx_examples_name ON examples(name);

-- 코멘트 추가
COMMENT ON TABLE examples IS '예시 테이블';
COMMENT ON COLUMN examples.id IS '예시 ID';
COMMENT ON COLUMN examples.name IS '예시 이름';
```

### 3. 🔍 검색 기능 구현

```java
// 동적 검색 조건을 위한 Specification 사용
public class ExampleSpecification {
    
    public static Specification<Example> hasName(String name) {
        return (root, query, criteriaBuilder) ->
            name == null ? null : criteriaBuilder.like(root.get("name"), "%" + name + "%");
    }
    
    public static Specification<Example> createdAfter(LocalDateTime date) {
        return (root, query, criteriaBuilder) ->
            date == null ? null : criteriaBuilder.greaterThan(root.get("createdAt"), date);
    }
}

// Repository에서 Specification 사용
public interface ExampleRepository extends JpaRepository<Example, Long>, JpaSpecificationExecutor<Example> {
}

// Service에서 동적 검색
public Page<ExampleDto> searchExamples(ExampleSearchDto searchDto, Pageable pageable) {
    Specification<Example> spec = Specification.where(null);
    
    if (StringUtils.hasText(searchDto.getName())) {
        spec = spec.and(ExampleSpecification.hasName(searchDto.getName()));
    }
    
    if (searchDto.getStartDate() != null) {
        spec = spec.and(ExampleSpecification.createdAfter(searchDto.getStartDate()));
    }
    
    Page<Example> examples = exampleRepository.findAll(spec, pageable);
    return examples.map(ExampleDto::from);
}
```

---

## 🔒 보안 시스템

### 1. 🛡️ Spring Security 설정

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (REST API)
            .csrf(AbstractHttpConfigurer::disable)
            
            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 세션 관리
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)                    // 동시 세션 1개
                .maxSessionsPreventsLogin(false)       // 새 로그인 시 기존 세션 만료
                .sessionRegistry(sessionRegistry())
            )
            
            // 요청 권한 설정
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**", "/actuator/**").permitAll()  // 인증 불필요
                .requestMatchers("/admin/**").hasRole("ADMIN")            // 관리자 권한
                .anyRequest().authenticated()                             // 나머지는 인증 필요
            )
            
            // 예외 처리
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(customAuthenticationEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            );

        return http.build();
    }
}
```

### 2. 🔐 세션 기반 인증

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponseDto> login(@Valid @RequestBody AuthRequestDto request, HttpServletRequest httpRequest) {
        // 1. 사용자 인증
        AuthResponseDto response = authService.authenticate(request.getUsername(), request.getPassword());
        
        // 2. 세션 생성
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("USER_ID", response.getUserId());
        session.setAttribute("USERNAME", response.getUsername());
        session.setAttribute("ROLES", response.getRoles());
        
        return ApiResponse.success(response);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();  // 세션 무효화
        }
        return ApiResponse.success();
    }
}
```

### 3. 🔍 세션 인증 필터

```java
@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpSession session = httpRequest.getSession(false);
        
        if (isAuthenticationRequired(httpRequest)) {
            if (session == null || session.getAttribute("USER_ID") == null) {
                // 인증되지 않은 요청
                sendUnauthorizedResponse((HttpServletResponse) response);
                return;
            }
            
            // 인증 정보를 Security Context에 설정
            setAuthenticationInContext(session);
        }
        
        chain.doFilter(request, response);
    }

    private void setAuthenticationInContext(HttpSession session) {
        String username = (String) session.getAttribute("USERNAME");
        List<String> roles = (List<String>) session.getAttribute("ROLES");
        
        Collection<SimpleGrantedAuthority> authorities = roles.stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
            .collect(Collectors.toList());

        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken(username, null, authorities);
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
```

### 4. 🔑 비밀번호 암호화

```java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;  // BCrypt
    private final UserRepository userRepository;

    public AuthResponseDto authenticate(String username, String password) {
        // 1. 사용자 조회
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다"));

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("비밀번호가 일치하지 않습니다");
        }

        // 3. 인증 응답 생성
        return AuthResponseDto.builder()
            .userId(user.getId())
            .username(user.getUsername())
            .roles(user.getRoles())
            .build();
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다"));

        // 기존 비밀번호 확인
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("기존 비밀번호가 일치하지 않습니다");
        }

        // 새 비밀번호 암호화 후 저장
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.changePassword(encodedPassword);
        userRepository.save(user);
    }
}
```

---

## 💾 데이터베이스 설계

### 1. 🗄 테이블 설계 원칙

```sql
-- 기본 테이블 구조 예시
CREATE TABLE positions (
    -- 기본키
    id BIGSERIAL PRIMARY KEY,
    
    -- 비즈니스 데이터
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    
    -- 감사(Audit) 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    -- 제약조건
    CONSTRAINT uk_positions_name UNIQUE (name),
    CONSTRAINT ck_positions_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 인덱스 생성
CREATE INDEX idx_positions_name ON positions(name);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_created_at ON positions(created_at);
```

### 2. 🔗 연관관계 테이블 설계

```sql
-- 다대다 관계: Position ↔ MeetingBody
CREATE TABLE position_meetings (
    position_id BIGINT NOT NULL,
    meeting_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (position_id, meeting_id),
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES meeting_bodies(id) ON DELETE CASCADE
);

-- 일대다 관계: Position → PositionAdmin
CREATE TABLE position_admins (
    id BIGSERIAL PRIMARY KEY,
    position_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(position_id, user_id)
);
```

### 3. 📊 성능 최적화

#### 인덱스 전략
```sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 복합 인덱스 (검색 조건이 많은 경우)
CREATE INDEX idx_qna_status_created_at ON qna(status, created_at);
CREATE INDEX idx_positions_status_name ON positions(status, name);

-- 부분 인덱스 (특정 조건만)
CREATE INDEX idx_active_positions ON positions(name) WHERE status = 'ACTIVE';
```

#### JPA 성능 최적화 설정
```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20          # 배치 처리 크기
        order_inserts: true       # INSERT 순서 최적화
        order_updates: true       # UPDATE 순서 최적화
        batch_versioned_data: true # 버전 관리 배치 처리
    open-in-view: false          # OSIV 비활성화 (성능 향상)
```

---

## 📊 모니터링 & 운영

### 1. 📈 Actuator 설정

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,env
      base-path: /actuator
  endpoint:
    health:
      show-details: always      # 상세 헬스 정보 표시
      show-components: always
  metrics:
    export:
      prometheus:
        enabled: true           # Prometheus 메트릭 활성화
```

### 2. 🔍 커스텀 헬스 체크

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    @Autowired
    private DataSource dataSource;

    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(1)) {
                return Health.up()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("status", "Available")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("database", "PostgreSQL")
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}
```

### 3. 📝 로깅 설정

```yaml
# application.yml
logging:
  level:
    org.itcen: DEBUG                    # 애플리케이션 로그
    org.hibernate.SQL: DEBUG            # SQL 쿼리 로그
    org.springframework.security: DEBUG  # 보안 로그
  pattern:
    console: '%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n'
```

---

## 🚀 개발 시작하기

### 1. 📥 개발 환경 설정
```bash
# Java 21 설치 확인
java --version

# 프로젝트 빌드
./gradlew build

# 개발 서버 실행
./gradlew bootRun

# 애플리케이션 확인
# http://localhost:8080/api/actuator/health
```

### 2. 🗄 데이터베이스 설정
```bash
# PostgreSQL 설치 및 실행
# 데이터베이스 생성: dev_db
# 사용자: postgres / 비밀번호: 1q2w3e4r!

# Redis 설치 및 실행
# 기본 포트: 6379
```

### 3. 🔧 IDE 설정 (IntelliJ IDEA)
- **필수 플러그인**:
  - Lombok Plugin
  - Spring Boot Assistant
  - Database Navigator
  - JPA Buddy

### 4. 📚 학습 리소스
- **Spring Boot 공식 가이드**: https://spring.io/guides
- **Spring Data JPA 문서**: https://spring.io/projects/spring-data-jpa
- **Spring Security 레퍼런스**: https://spring.io/projects/spring-security
- **PostgreSQL 문서**: https://www.postgresql.org/docs/

---

## 🎯 마무리

이 문서는 ITCEN Solution Backend의 아키텍처를 초보자도 이해할 수 있도록 상세히 설명했습니다.

### 💡 핵심 포인트
1. **계층형 아키텍처**로 관심사 분리
2. **도메인 기반 구조**로 비즈니스 로직 캡슐화
3. **Spring Security**를 활용한 세션 기반 인증
4. **JPA**를 통한 객체 관계 매핑
5. **Redis**를 활용한 세션 관리 및 캐싱

### 🔄 다음 단계
1. 간단한 CRUD API부터 개발 시작
2. JPA 연관관계 매핑 학습
3. Spring Security 인증/인가 이해
4. 성능 최적화 및 모니터링 적용

---

**Created by ITCEN Team** | 최종 업데이트: 2025.01