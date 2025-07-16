# Psychology Counseling Supervisor Platform

## Overview

This is a web application designed to connect psychology trainees with supervisors in South Korea, addressing issues with the National Mental Health Investment Support Program where some supervisors charge additional fees beyond the government-provided vouchers. The platform promotes transparency by publicly displaying supervisor information, fees, and participation in government programs.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and bundling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Authentication**: Custom JWT-based authentication with bcrypt password hashing
- **API Design**: RESTful API endpoints

### Database Layer
- **ORM**: Drizzle ORM
- **Database**: SQLite for development (configured for PostgreSQL via Drizzle config)
- **Schema**: Centralized schema definitions in shared directory

## Key Components

### User Management
- **Multi-role system**: Admin, Supervisor, Trainee roles
- **Authentication**: JWT tokens with 7-day expiration
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Account Approval**: Supervisor accounts require admin approval

### Supervisor Profiles
- **Comprehensive Information**: Qualifications, specializations, contact methods
- **Transparency Features**: Government program participation, additional fee disclosure
- **Search & Filtering**: Multi-criteria search with category-based filters
- **Profile Management**: Self-service profile editing for supervisors

### Community Features
- **Anonymous Posting**: Community posts with nickname-based anonymity
- **Content Moderation**: Reporting system for inappropriate content
- **Educational Content**: Psychology articles and education information

### Administrative Dashboard
- **User Management**: Approve/reject supervisor applications
- **Content Moderation**: Handle reports and manage community content
- **Statistics**: Platform usage analytics
- **Content Publishing**: Create educational articles and announcements

## Data Flow

### Authentication Flow
1. User registers with role selection (trainee/supervisor)
2. Supervisors require admin approval before activation
3. JWT tokens stored in localStorage for session management
4. Protected routes verify token validity server-side

### Supervisor Discovery Flow
1. Trainees browse supervisor listings with filtering capabilities
2. Detailed profiles show qualifications, fees, and government program participation
3. Contact information provided for direct communication

### Content Management Flow
1. Community posts support anonymous participation
2. Reporting system flags inappropriate content for admin review
3. Educational content managed through admin dashboard

## External Dependencies

### Core Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Authentication**: jsonwebtoken, bcrypt
- **Database**: better-sqlite3, drizzle-orm
- **Email**: SendGrid for password reset functionality
- **File Handling**: Built-in Node.js modules for asset management

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production build optimization
- **Vite**: Development server with hot reload
- **Replit Integration**: Development environment support

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` directory
2. Backend bundles to `dist/index.js` with external dependencies
3. Static assets served from dedicated directory

### Environment Configuration
- **Development**: SQLite database with local file storage
- **Production**: PostgreSQL via DATABASE_URL environment variable
- **Email**: SendGrid API key for password reset functionality

### Security Measures
- JWT secret configuration via environment variables
- Password hashing with industry-standard bcrypt
- Input validation with Zod schemas
- CORS and security headers configured

## Changelog
- January 16, 2025. 상단 메뉴 변경: "전국민마음투자지원사업" → "상담자가 되는 법"
- January 16, 2025. 상담자 되는 법 페이지 추가 (공식 가이드 + 대학 리스트)
- January 16, 2025. 메인페이지 익명게시판을 실제 커뮤니티 데이터와 통합
- January 16, 2025. 교육과정 등록 버튼을 로그인 사용자만 접근 가능하도록 제한
- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.