# MindCounselorHub Git 업로드 가이드

## 🎯 리포지토리 정보
- **리포지토리 이름**: MindCounselorHub
- **GitHub URL**: https://github.com/goseecloud/MindCounselorHub
- **현재 상태**: 프로덕션 배포 준비 완료

## 📋 업로드 단계별 가이드

### 1단계: 로컬 Git 설정
```bash
# 현재 디렉토리에서 실행
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### 2단계: 파일 추가 및 커밋
```bash
# 모든 파일 추가 (node_modules 제외)
git add .

# 커밋 메시지 작성
git commit -m "Complete psychology counseling platform with community features

Major features implemented:
- 심리상담 수퍼바이저 매칭 시스템
- 계층형 댓글 시스템 (최대 3단계 깊이)  
- 제목 옆 댓글 개수 표시 [숫자] 형태
- 날짜 형식 mm.dd. hh:mm으로 개선
- JWT 기반 인증 시스템
- 관리자 대시보드 및 승인 프로세스
- 커뮤니티 익명 게시판
- 교육 정보 및 AI 기사 생성
- 완전한 프론트엔드-백엔드 통합

Tech stack:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript  
- Database: SQLite (dev) / PostgreSQL (prod) with Drizzle ORM
- Authentication: JWT + bcrypt
- UI: shadcn/ui components"
```

### 3단계: 원격 리포지토리 연결
```bash
# GitHub 리포지토리 연결
git remote add origin https://github.com/goseecloud/MindCounselorHub.git

# 첫 번째 푸시
git push -u origin main
```

## 📁 업로드될 주요 파일들

### 프론트엔드 (client/)
- `src/pages/community.tsx` - 최신 댓글 시스템
- `src/components/` - UI 컴포넌트들
- `src/hooks/` - React 훅들
- `src/lib/` - 유틸리티 함수들

### 백엔드 (server/)
- `routes.ts` - API 엔드포인트
- `storage.ts` - 데이터베이스 로직
- `auth.ts` - JWT 인증
- `db.ts` - 데이터베이스 연결

### 설정 파일들
- `package.json` - 의존성 정보
- `tsconfig.json` - TypeScript 설정
- `tailwind.config.ts` - Tailwind CSS 설정
- `vite.config.ts` - Vite 설정
- `drizzle.config.ts` - ORM 설정

### 문서화
- `README.md` - 프로젝트 설명서
- `PROJECT_EXPORT.md` - 개발 현황
- `TEST_ACCOUNTS.md` - 테스트 계정 정보

## 🚀 업로드 후 확인사항

1. **GitHub에서 확인**
   - 모든 파일이 올라갔는지 확인
   - README.md가 제대로 렌더링되는지 확인

2. **클론 테스트**
   ```bash
   git clone https://github.com/goseecloud/MindCounselorHub.git
   cd MindCounselorHub
   npm install
   npm run dev
   ```

## 🔧 문제 해결

### Git 로그인 이슈
```bash
# Personal Access Token 사용
git remote set-url origin https://your-username:your-token@github.com/goseecloud/MindCounselorHub.git
```

### 브랜치 이름 변경 필요시
```bash
git branch -M main
git push -u origin main
```

## ✅ 업로드 완료 후

업로드 완료 시 다음 작업들을 진행할 수 있습니다:
- GitHub Pages 배포 설정
- Vercel/Netlify 연동
- 자동 배포 파이프라인 구성
- 이슈 트래킹 및 프로젝트 관리

---

**현재 프로젝트 상태**: 프로덕션 배포 준비 완료 ✅  
**최종 업데이트**: 2025년 6월 30일