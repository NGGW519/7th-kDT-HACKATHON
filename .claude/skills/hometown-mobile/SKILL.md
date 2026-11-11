---
name: hometown-mobile
description: "고향으로 ON 앱(React Native/Expo, HometownON/frontend) 작업 규칙. 화면을 서버 API에 연결, 로그인 토큰을 요청에 붙이기, API 주소 설정, 화면 이동(navigate) 대상 등록, 앱의 환경 변수(@env) 사용 시 반드시 따른다. 서버 코드 수정은 hometown-backend를 쓴다."
---

# 고향으로 ON 앱 규칙

## 서버 주소
- 모든 요청은 `src/config/apiConfig.js`의 `API_URL`을 쓴다. 이 값은 루트 `.env`의 `API_URL`(없으면 에뮬레이터 기본값)에서 온다.
- `http://localhost:8000`, `10.0.2.2`, IP 주소를 화면 코드에 직접 쓰지 않는다. 실제 기기에서 연결되지 않는다.
- `process.env.REACT_APP_*`는 React Native에서 동작하지 않는다(웹 CRA 전용). `@env` 또는 apiConfig를 쓴다.

## 환경 변수(@env)
- `babel.config.js`의 react-native-dotenv가 루트 `.env`를 읽는다(`path: '../../.env'`).
- `@env`에서 import 한 값은 **앱 파일 안에 그대로 들어간다.** 공개돼도 되는 값만 쓴다: `API_URL`, `GOOGLE_CLIENT_ID_WEB`, `GOOGLE_CLIENT_ID_IOS`, `GOOGLE_CLIENT_ID_ANDROID`.
- 절대 import 금지: `MONOGPT_API_KEY`, `GOOGLE_API_KEY`, `SECRET_KEY`, `POSTGRES_PASSWORD`, `OPENROUTER_API_KEY`, `WEATHER_API_KEY`, `GOOGLEMAP_API_KEY`. LLM·날씨·지도는 서버를 거쳐 호출한다.

## 인증
- 로그인 토큰은 `utils/storage.js`/`services/AuthService.js`가 저장한 값을 쓴다. 로그인이 필요한 API(글쓰기, 좋아요, 미션 완료, 챗봇의 미션/글 생성)는 `Authorization: Bearer <token>` 헤더를 붙인다.
- 미션 목록·통계는 토큰이 있어야 사용자별 완료 상태가 나온다. 토큰 없이 부르면 모든 미션이 'today'로 보인다.

## 서버 응답 형식 (현재 계약)
- 게시판: `/api/board/`(자유), `/api/requests/`(의뢰), `/api/mentors/`(멘토). 목록은 배열, 글에는 `author.profile.display_name`, `comments[]`, `likes_count`, `comments_count`.
  - 의뢰: `budget`, `location`, `accepted_by`, `status`(pending/matched/completed/cancelled), `views`
  - 멘토: `experience`, `hourly_rate`, `location`, `status`, `views`
- 미션: `/api/missions/`(배열, `status`는 today/completed, `mission_type`은 exploration/bonding/career), `/api/missions/user-stats`, `/api/missions/completed_missions_with_difficulty`, `PATCH /api/missions/{id}` `{status}`
- 장소: `/api/locations/{id}`, `/api/locations/by_name/{name}` → `geom`은 `POINT(경도 위도)`, `latitude`/`longitude`도 함께 온다.
  - 근처 검색 `POST /api/locations/nearby` `{latitude, longitude, radius_km?, limit?, category?}` → 가까운 순 배열, 각 항목에 `coordinates: {latitude, longitude}`, `distance_km`
  - 분류 목록 `GET /api/locations/categories/` → `[{id, main, sub}]`, 목록 `GET /api/locations/?category_id=&search=`
- 챗봇: `POST /api/chatbot/chat` `{message, session_id?}` → 텍스트, 새 세션은 헤더 `X-Session-Id`.
- 계약이 바뀌면 이 목록도 함께 고친다(리더가 갱신).

## 화면 이동
- `navigation.navigate('이름')`의 이름은 `src/navigation/AppNavigator.js` 등에 `name="이름"`으로 등록돼 있어야 한다. 등록 안 된 이름으로 이동하면 앱이 경고만 내고 아무 일도 일어나지 않는다.
- 확인: `python .claude/skills/hometown-qa/scripts/check_app_contract.py --nav`

## 파일
- 모든 소스는 UTF-8로 저장한다. CP949로 저장된 파일의 한글 문자열은 앱 화면에서 깨진다.
- 큰 화면 파일을 통째로 다시 쓰지 말고 필요한 부분만 Edit로 고친다.
