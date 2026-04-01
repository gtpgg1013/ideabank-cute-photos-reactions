# IdeaBank Cute Gallery

귀여운 사진 테마의 갤러리와 리액션 랭킹을 제공하는 Node.js 웹앱입니다.

## Features

- 루트 경로 비밀번호 게이트
- 쿠키 기반 접근 유지
- 카테고리별 귀여운 사진 갤러리
- 좋아요, 하트, 웃음 리액션
- 인기 사진 및 리액션 순위
- Docker / docker compose 실행 지원

## Run

### Local

```bash
PORT=3200 ACCESS_PASSWORD=ideabank2026 npm start
```

기본 접속 주소는 `http://localhost:3200` 입니다.

### Docker

```bash
docker compose up --build
```

## Test

```bash
npm test
```

## Password

- 환경 변수: `ACCESS_PASSWORD`
- 기본값: `ideabank2026`

## Routes

- `/` 비밀번호 입력 페이지
- `/gallery` 인증 후 메인 갤러리
- `/api/photos` 사진/리액션 데이터 조회
- `/api/reactions` 리액션 추가
