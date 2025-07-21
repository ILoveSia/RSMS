# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ITCEN Solution is a financial compliance management system built with React 18.2/TypeScript frontend and Spring Boot 3.5/Java 21 backend. The system manages executive responsibilities, meeting bodies, positions, and compliance tracking for financial institutions.

## Development Commands

### Frontend (React/TypeScript)
```bash
cd frontend
npm run dev                # Start development server (localhost:3000)
npm run build              # Production build
npm run build:clean        # Clean build from scratch  
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues automatically
npm run type-check         # TypeScript type checking
npm run preview            # Preview production build
```

### Backend (Spring Boot/Java 21)
```bash
cd backend
./gradlew bootRun          # Start development server (localhost:8080)
./gradlew build            # Build application
./gradlew test             # Run tests
./gradlew clean            # Clean build directory
```

### Database & Infrastructure
- PostgreSQL runs on port 5433 (local) / 5432 (docker)
- Redis runs on port 6379
- Database init scripts are in `backend/database/init/`

## Architecture Overview

### Backend Architecture (Domain-Driven Design)
- **Layered Architecture**: Controller → Service → Repository → Entity
- **Domain Modules**: Each business domain (positions, meeting, responsibility, etc.) has its own package
- **Package Structure**: `org.itcen.domain.{domain-name}.{controller|service|repository|entity|dto}`
- **Security**: Session-based authentication with Spring Security 6.x and Redis
- **API Context Path**: All endpoints are prefixed with `/api` (configured in application.yml)

### Frontend Architecture (Domain-Based Modules)
- **Domain Structure**: Each business domain has its own module in `src/domains/`
- **Domain Module Pattern**: `{domain}/api/`, `{domain}/components/`, `{domain}/pages/`, `{domain}/router/`, `{domain}/store/`
- **Shared Components**: Reusable UI components in `src/shared/components/ui/`
- **State Management**: Redux Toolkit with custom `useAPI` hook for API integration
- **Routing**: Domain-based routing with RouteManager and lazy loading

### Key Architectural Patterns

#### Backend Domain Module Example
```
domain/positions/
├── controller/PositionController.java     # REST endpoints
├── service/PositionService.java          # Business logic interface
├── service/PositionServiceImpl.java      # Business logic implementation  
├── repository/PositionRepository.java    # Data access
├── entity/Position.java                  # JPA entity
└── dto/                                  # Data transfer objects
```

#### Frontend Domain Module Example
```
domains/ledgermngt/
├── api/                    # API client functions
├── components/             # Domain-specific components
├── pages/                  # Page components
├── hooks/                  # Custom React hooks
├── store/                  # Redux slices
└── router/                 # Domain routing configuration
```

## Critical Implementation Details

### Backend API Development
- **Controller Mapping**: Use `@RequestMapping("/resource")` without `/api` prefix (context-path adds it automatically)
- **Entity Relationships**: Use JPA annotations with `BaseTimeEntity` for audit fields
- **Service Layer**: Always use `@Transactional(readOnly = true)` by default, override for write operations
- **Exception Handling**: Use `GlobalExceptionHandler` with `BusinessException` for business logic errors

### Frontend State Management
- **API Integration**: Use `useAPI<T>(actionType)` hook for all API calls
- **Action Registration**: Register API actions in domain store files using `registerActions()`
- **Route Registration**: Add new routes to domain router and register in `app/router/routes.tsx`
- **Component Structure**: Follow the Material-UI + shared component library pattern

### Database Schema
- **Audit Fields**: All tables inherit created_at, updated_at, created_by, updated_by
- **Naming Convention**: Snake_case for database, camelCase for entities
- **Foreign Keys**: Properly defined with CASCADE constraints
- **Init Scripts**: Numbered sequentially in `backend/database/init/`

## Domain-Specific Business Logic

### Key Domains
- **ledgermngt**: Executive status, position management, responsibility tracking, meeting management
- **inquiry**: Status reporting, inspection planning, deficiency tracking
- **login**: Authentication and authorization
- **main**: Dashboard and main navigation
- **common**: Shared utilities, codes, and attachments

### Submission Management
- Critical fix applied: `rm_submit_mgmt` table requires `submit_hist_cd` field (NOT NULL constraint)
- Entity: `Submission.java` includes `submitHistCd` field
- Service: `SubmissionServiceImpl` sets `submitHistCd` in create/update operations

## Integration Points

### Frontend-Backend API Communication
- All API calls go through `/api` context path
- Authentication handled via Redis sessions
- CORS configured for localhost:3000 in development
- Proxy configuration in Vite for development API calls

### Component Communication
- **Tab System**: Dynamic tabs managed via `TabContext` and `TabContainer`
- **Modal System**: Centralized modal management with `BaseDialog` and `useDialog` hook
- **State Sharing**: Domain stores communicate via Redux toolkit

## Important Configuration

### Environment Profiles
- **local**: Development with PostgreSQL on port 5433
- **docker**: Containerized environment  
- **prod**: Production configuration with environment variables

### Security Configuration
- Session timeout: 3600 seconds (1 hour)
- Redis session store namespace: "itcen:session"
- Password encoding: BCrypt
- CORS enabled for development frontend

This codebase follows enterprise-grade patterns with clear separation of concerns, comprehensive error handling, and scalable architecture suitable for financial compliance systems.