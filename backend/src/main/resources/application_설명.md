
이 파일은 크게 **세 부분**으로 나눌 수 있습니다.

1.  **공통 설정**: 어떤 환경에서든 동일하게 적용되는 기본 설정입니다.
2.  **프로파일별 설정**: `local`(개발), `docker`(도커), `prod`(운영) 등 실행 환경에 따라 다르게 적용되는 설정입니다.
3.  **액추에이터 설정**: 애플리케이션의 상태를 모니터링하고 관리하기 위한 설정입니다.

---

### 1. 공통 설정 (모든 환경에 적용)

이 부분은 애플리케이션의 기본적인 동작 방식을 정의합니다.

#### **`server` - 내장 웹 서버(Tomcat) 설정**

* `port: 8080`: 애플리케이션이 실행될 **포트 번호**를 8080으로 지정합니다.
* `context-path: /api`: 모든 API 주소 앞에 공통으로 `/api` 경로가 붙습니다. (예: `http://localhost:8080/api/users`)
* `encoding`: 모든 요청과 응답의 **문자 인코딩**을 `UTF-8`로 설정하여 한글 깨짐을 방지합니다.
* `tomcat`: 웹 서버의 성능을 최적화하는 부분입니다.
    * `threads`: 동시에 처리할 수 있는 **사용자 요청의 최대 개수**(max: 200)와 **최소 개수**(min-spare: 10)를 설정하여 안정적인 성능을 보장합니다.

#### **`spring` - 스프링 프레임워크 핵심 설정**

* `application.name: itcen-backend`: 애플리케이션의 **이름**을 `itcen-backend`로 지정합니다.
* `profiles.active: local`: 애플리케이션을 실행할 때 기본적으로 **`local` 프로파일(개발 환경 설정)을 활성화**합니다.
* `jpa`: 데이터베이스와 관련된 설정입니다.
    * `hibernate.ddl-auto: update`: 애플리케이션 실행 시 **Entity(자바 클래스)와 데이터베이스 테이블을 비교**하여 변경된 부분을 자동으로 반영합니다. 개발 시에는 편리하지만, 운영(`prod`) 환경에서는 `validate`로 변경하여 데이터 손실을 방지합니다.
    * `show-sql: true`: JPA가 실행하는 **SQL 쿼리를 로그에 표시**해 줍니다. 개발 시 디버깅에 매우 유용합니다.
    * `properties.hibernate...`: SQL 로그를 예쁘게 정렬(`format_sql`)하고, 데이터베이스 종류(`dialect`)를 PostgreSQL로 지정하는 등 세부적인 성능 최적화 설정이 포함되어 있습니다.
* `session`: 사용자 로그인 정보를 관리하는 **세션 설정**입니다.
    * `store-type: redis`: 세션 정보를 서버 메모리가 아닌 **Redis 데이터베이스에 저장**합니다. 이렇게 하면 서버를 여러 대 운영하더라도 사용자의 로그인 상태가 유지됩니다.
    * `timeout: 3600`: 사용자가 아무 활동이 없으면 **1시간(3600초) 후에 자동으로 로그아웃**됩니다.
* `devtools`: **개발 편의 기능** 설정입니다.
    * `livereload.enabled: true`: 코드 변경 시 브라우저를 자동으로 새로고침해 줍니다.
    * `restart.enabled: true`: 자바 코드 변경 시 애플리케이션을 **자동으로 재시작**해 줍니다. 개발 속도를 크게 향상시킵니다.
* `jackson`: 자바 객체를 JSON 데이터로 변환할 때의 규칙을 설정합니다.
    * `time-zone: Asia/Seoul`: 시간 데이터를 처리할 때 **서울 시간대**를 기준으로 합니다.
    * `property-naming-strategy: SNAKE_CASE`: 자바의 `camelCase` 변수명을 JSON에서는 `snake_case`로 자동 변환합니다. (예: `userName` -> `user_name`)
* `servlet.multipart`: **파일 업로드** 관련 설정입니다.
    * `max-file-size: 10MB`: 업로드 가능한 **개별 파일의 최대 크기**를 10MB로 제한합니다.
    * `max-request-size: 50MB`: 한 번의 요청으로 업로드할 수 있는 **모든 파일의 총합 최대 크기**를 50MB로 제한합니다.
* `web.cors`: **CORS(Cross-Origin Resource Sharing)** 설정입니다.
    * `allowed-origins: 'http://localhost:3000'`: `http://localhost:3000` 주소(주로 프론트엔드 개발 서버)에서 오는 API 요청을 허용합니다. 다른 주소에서의 요청은 보안상 차단됩니다.

#### **`logging` - 로그 설정**

* 어떤 패키지의 로그를 얼마나 자세히 보여줄지 **레벨(TRACE < DEBUG < INFO < WARN < ERROR)을 설정**합니다.
* `org.hibernate.SQL: DEBUG`: JPA가 실행하는 SQL문을 보여줍니다.
* `org.itcen: DEBUG`: 직접 작성한 `org.itcen` 패키지의 모든 코드에 대해 상세한 로그를 남깁니다.

#### **`app` - 직접 정의한 추가 설정**

* 애플리케이션에서 사용할 **사용자 정의 설정**입니다.
* `file.upload-dir`: 파일이 업로드될 **서버 내의 폴더 경로**를 지정합니다.
* `file.allowed-types`: 업로드를 허용할 **파일 확장자**들을 정의합니다.

---

### 2. 프로파일별 설정 (`---`로 구분)

`spring.profiles.active` 값에 따라 아래 설정 중 하나가 선택되어 적용됩니다. 이를 통해 개발, 테스트, 운영 환경의 설정을 쉽게 분리하고 관리할 수 있습니다.

#### **`local` 프로파일 (내 PC에서 개발할 때)**

* `datasource`: 내 PC의 PostgreSQL(`localhost:5433`)에 연결하도록 설정되어 있습니다.
* `data.redis`: 내 PC의 Redis(`localhost:6379`)에 연결합니다.
* `hikari`: 데이터베이스 커넥션 풀의 크기를 개발 환경에 맞게 비교적 작게(`maximum-pool-size: 10`) 설정했습니다.

#### **`docker` 프로파일 (도커 컨테이너로 실행할 때)**

* `datasource.url`: `jdbc:postgresql://postgres:5432/postgres`
    * `localhost` 대신 `postgres`라는 **서비스 이름(컨테이너 이름)**을 사용합니다. 도커 네트워크 내부에서 컨테이너끼리 통신할 때 사용되는 방식입니다.
* `data.redis.host`: `redis`
    * 마찬가지로 `localhost` 대신 `redis`라는 서비스 이름을 사용합니다.
* `hikari.maximum-pool-size`: 커넥션 풀 크기를 `local`보다 조금 더 크게(`20`) 설정하여 더 많은 요청을 처리할 수 있도록 했습니다.

#### **`prod` 프로파일 (실제 서비스 환경에서 운영할 때)**

* `jpa.hibernate.ddl-auto: validate`: **가장 중요한 차이점 중 하나입니다.** `update` 대신 `validate`를 사용하여, Entity와 DB 테이블 구조가 다르면 애플리케이션 실행을 막아버립니다. 이는 **운영 환경의 데이터가 실수로 변경되거나 삭제되는 것을 방지**하는 안전장치입니다.
* `show-sql: false`: 불필요한 로그를 줄여 성능을 확보하기 위해 SQL 쿼리를 로그에 표시하지 않습니다.
* `datasource` & `data.redis`:
    * `${DB_URL}`, `${DB_USERNAME}` 와 같이 **환경 변수**를 사용합니다.
    * 이렇게 하면 소스 코드에 민감한 정보(DB 접속 주소, 비밀번호 등)를 직접 노출하지 않고, 서버 환경에 설정된 값을 동적으로 가져와 보안을 강화할 수 있습니다.
* `hikari` & `lettuce.pool`: **커넥션 풀과 레디스 풀의 크기를 가장 크게 설정**하여 많은 트래픽을 감당할 수 있도록 최적화했습니다.
* `logging.level`: 로그 레벨을 `INFO`나 `WARN`으로 높여서, 정말 필요한 정보와 에러만 기록하도록 설정했습니다.

---

### 3. 관리 엔드포인트 설정 (`management`)

* **Spring Boot Actuator**라는 기능을 활성화하여 애플리케이션의 내부 상태를 들여다볼 수 있는 여러 **관리용 API 엔드포인트**를 제공합니다.
* `/actuator/health`: 애플리케이션이 정상적으로 동작하는지 상태를 보여줍니다.
* `/actuator/metrics`: CPU 사용량, 메모리 사용량 등 다양한 성능 지표를 제공합니다.
* `/actuator/prometheus`: 이 성능 지표들을 **프로메테우스**(모니터링 시스템)가 수집해 갈 수 있는 형태로 제공합니다.

이처럼 `application.yml` 파일 하나에 애플리케이션의 동작 방식, 데이터베이스 연결, 성능 최적화, 개발 편의성, 환경별 설정 분리 등 핵심적인 내용이 모두 담겨 있습니다. 매우 체계적으로 관리되고 있는 좋은 설정 파일입니다.

혹시 특정 설정에 대해 더 궁금한 점이 있으시면 언제든지 다시 질문해 주세요!