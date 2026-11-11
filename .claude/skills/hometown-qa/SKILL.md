---
name: hometown-qa
description: "고향으로 ON 통합 검증 절차. 백엔드 pytest 실행, 앱 fetch 호출과 서버 API(주소·메서드·응답 필드) 대조, 화면 이동 대상 확인, SQL 파일↔DB 모델 일치, 앱의 비밀키 import·하드코딩 서버 주소 검사를 할 때 사용한다. 기능 구현 뒤 '검증해줘', 'QA', '연동 확인', '깨진 곳 찾아줘' 요청에도 쓴다."
---

# 고향으로 ON QA 절차

연결 지점마다 **만드는 쪽과 읽는 쪽을 함께** 열어 비교한다. 파일이나 엔드포인트가 "있는지"가 아니라 "서로 맞는지"를 본다.

## 1. 자동 검사 (먼저 실행)

```bash
# 1) 백엔드 테스트: 스키마 일치(test_schema_sql) 포함. 테스트 DB 가 떠 있어야 한다
cd HometownON/backend && pytest

# 2) 앱 ↔ 서버 정적 대조 (표준 라이브러리 + 백엔드 의존성)
python .claude/skills/hometown-qa/scripts/check_app_contract.py          # 전부
python .claude/skills/hometown-qa/scripts/check_app_contract.py --api    # 주소/메서드만
```

- 스크립트의 "문제"는 확인된 결함 후보다. "참고(앱에서 찾지 못한 서버 API)"는 다른 파일에서 주소를 조립하면 놓치므로 직접 확인한 뒤에만 보고한다.
- 테스트 DB에 접속할 수 없으면 판정을 `INCOMPLETE`로 하고 정적 검사 결과만 보고한다.

## 2. 수동 대조 (스크립트가 못 보는 것)

| 연결 지점 | 만드는 쪽 | 읽는 쪽 | 확인할 것 |
|---|---|---|---|
| 응답 필드 | `app/schemas/*.py` 응답 모델 | 화면의 `data.xxx`, `item.xxx` | 이름(snake_case 그대로인지), 배열/객체 감싸기, 값 종류(의뢰 status 값 등) |
| 인증 | `Depends(get_current_user)` 엔드포인트 | fetch 의 `Authorization` 헤더 | 로그인 필요한 호출에 토큰을 붙이는지, 401 처리 |
| 사용자별 상태 | `crud_mission`(사용자별 완료) | 미션 화면 | 토큰 없이 불러 모든 미션이 today 로 보이지 않는지 |
| 챗봇 | `chat.py` 스트림 + `X-Session-Id` | ChatbotScreen | 세션 ID 를 다음 요청에 넣는지, 응답을 텍스트로 읽는지 |
| 스키마 | `models.py` | `Hometown_on.sql`, 테이블 설명서 2개 | pytest 가 SQL↔모델을 보고, 설명서 DDL 은 SQL 파일과 직접 비교 |
| LLM 경계 | `app/chatbot/*` | 외부 MonoGPT | 프롬프트에 토큰·비밀번호·전화번호가 들어가지 않는지 (`tests/test_chat.py`) |

## 3. 보안 검사
- `git diff --cached`/작업 파일에 `.env` 값(키, 비밀번호)이 들어가지 않았는지: 루트 `.env` 의 값을 읽어 변경 파일에서 검색한다. 값은 출력하지 않는다.
- 앱 `@env` import 에 비밀키가 없는지(스크립트 `--env`).

## 4. 보고 형식 (`_workspace/03_qa_findings.md`)

```markdown
판정: FAIL (3건)   # 또는 PASS / INCOMPLETE(이유)

| # | 담당 | 심각도 | 위치 | 근거 | 기대 동작 |
|---|---|---|---|---|---|
| 1 | mobile | 차단 | screens/Board/X.js:42 | 서버 응답은 author.profile.display_name, 화면은 author_name 을 읽음 | 화면이 display_name 을 표시 |
```

- 심각도: 차단(기능이 동작하지 않음) / 중요(일부 경우 실패, 보안) / 사소(표시·문구).
- 테스트 출력은 요약하지 말고 실패한 테스트 이름과 오류 줄을 그대로 붙인다.
- 직접 고치지 않는다. 담당을 지정한다.
