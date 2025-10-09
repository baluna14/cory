# Cory - Virtual Pet Companion App

레트로 픽셀 아트 스타일의 가상 펫 컴패니언 웹 애플리케이션입니다.

## 프로젝트 구조

```
cory/
├── index.html              # 메인 HTML (앱 셸)
├── views/                  # 뷰 HTML 파일들
│   ├── home.html          # 홈 화면
│   ├── pocket.html        # 포켓 (코리 컬렉션)
│   ├── journey.html       # 여행/탐험 화면
│   ├── profile.html       # 프로필 화면
│   ├── talk.html          # 대화 화면
│   └── dialogs.html       # 공유 다이얼로그 컴포넌트
├── scripts/
│   └── app.js             # 메인 애플리케이션 로직
├── styles/
│   ├── base.css           # CSS 변수, 리셋, 앱 컨테이너
│   ├── layout.css         # 헤더, 네비게이션, 레이아웃
│   ├── components.css     # 재사용 컴포넌트 스타일
│   └── views.css          # 뷰별 스타일
├── assets/
│   └── images/            # 이미지 파일들
├── CLAUDE.md              # Claude Code 가이드
└── README.md              # 이 파일
```

## 개발 환경 설정

### 로컬 서버 실행 (필수)

동적 뷰 로딩을 위해 반드시 로컬 웹 서버를 사용해야 합니다:

```bash
# Python 사용
python3 -m http.server 8000

# 또는 Node.js http-server 사용
npx http-server

# 또는 VS Code Live Server 확장 사용
```

브라우저에서 `http://localhost:8000` 접속

## 주요 기능

- **홈**: 대표 코리와 알람 확인
- **포켓**: 수집한 코리들 보기 및 대표 코리 변경
- **여행**: 사진 업로드로 새로운 코리 생성
- **대화**: 선택한 코리와 채팅
- **프로필**: 사용자 정보 및 통계

## 기술 스택

- 순수 HTML, CSS, JavaScript (프레임워크 없음)
- ES6+ (async/await, fetch API, classes)
- 모듈식 뷰 로딩 시스템
- localStorage 기반 계정 데이터 저장
- 반응형 디자인 (513x770px 모바일 뷰포트)

## 계정 관리 시스템

앱은 기본 계정 ID `1234567890`으로 시작하며, 다음 데이터를 관리합니다:

- **계정 ID**: 사용자 고유 식별자
- **플레이 타임**: 총 게임 플레이 시간 (분 단위)
- **코리 컬렉션**: 수집한 모든 코리 목록
- **대표 코리**: 현재 선택된 대표 코리

모든 데이터는 localStorage에 자동 저장되며, 30초마다 또는 페이지 종료 시 자동 저장됩니다.

## 개발 참고사항

- 빌드 프로세스 없음
- 의존성 없음 (package.json 없음)
- 로컬 서버 필수 (CORS 제약)
- 자세한 아키텍처 정보는 `CLAUDE.md` 참고
