# 심리상담 수퍼바이저 플랫폼 - 프로젝트 현황

## 개요
한국 심리상담사들을 위한 통합 전문성 개발 디지털 플랫폼으로, 수퍼바이저 네트워킹과 전문 성장을 지원하는 혁신적인 솔루션입니다.

## 최신 업데이트 (2025.06.30)
- ✅ 계층형 댓글 시스템 구현 (최대 3단계 깊이)
- ✅ 제목 옆 댓글 개수 표시 기능 [숫자] 형태
- ✅ 날짜 형식을 mm.dd. hh:mm으로 변경
- ✅ 답글 작성 및 계층적 표시 기능
- ✅ 백엔드 댓글 개수 실시간 계산 API

## 기술 스택
- **Frontend**: React + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js + Express, TypeScript
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **ORM**: Drizzle ORM
- **Authentication**: JWT + bcrypt

## 주요 기능
1. **수퍼바이저 매칭 시스템**
   - 전문 분야별 필터링
   - 정부 프로그램 참여 여부 표시
   - 추가 비용 투명성

2. **커뮤니티 시스템**
   - 익명 게시판
   - 계층형 댓글 (답글 지원)
   - 카테고리별 분류
   - 신고 시스템

3. **관리자 시스템**
   - 수퍼바이저 승인 관리
   - 콘텐츠 관리
   - 통계 대시보드

4. **교육 정보 시스템**
   - 교육 프로그램 정보
   - 심리학 기사 자동 생성 (Perplexity API)

## 파일 구조
```
├── client/src/
│   ├── components/     # UI 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── hooks/         # React 훅
│   └── lib/           # 유틸리티
├── server/
│   ├── routes.ts      # API 라우트
│   ├── storage.ts     # 데이터베이스 로직
│   ├── auth.ts        # 인증 관련
│   └── db.ts          # 데이터베이스 설정
└── shared/
    └── schema.ts      # 공통 스키마 정의
```

## 설치 및 실행
```bash
npm install
npm run dev
```

## 환경 변수
- `DATABASE_URL`: PostgreSQL 연결 URL (프로덕션)
- `JWT_SECRET`: JWT 토큰 암호화 키
- `PERPLEXITY_API_KEY`: AI 기사 생성용 API 키
- `SENDGRID_API_KEY`: 이메일 발송용 API 키

## Git 리포지토리 준비
시스템 제한으로 인해 Git 커밋이 직접 실행되지 않았지만, 모든 코드가 준비되어 있습니다.
사용자가 직접 Git 리포지토리를 생성하고 다음 명령으로 업로드할 수 있습니다:

```bash
git init
git add .
git commit -m "Initial commit: Psychology counseling platform"
git remote add origin [YOUR_REPO_URL]
git push -u origin main
```

## 주요 개발 완료 사항
1. 답글 시스템 계층적 표시 구현
2. 댓글 개수 실시간 계산 및 표시
3. 날짜 형식 한국어 표준으로 변경
4. 프론트엔드-백엔드 완전 연동
5. 에러 처리 및 안정성 개선

현재 코드는 프로덕션 배포 준비가 완료된 상태입니다.