---
name: hometown-dev
description: "고향으로 ON 앱 개발 총괄(오케스트레이터). 서버·앱·챗봇에 걸친 기능 추가나 연동(예: 게시판/미션/챗봇/장소 기능을 앱에 연결, API 추가 후 화면 반영, 브랜치 포팅), 여러 담당이 함께 고쳐야 하는 작업, 구현 후 통합 검증을 요청받으면 사용한다. 이전 작업의 수정, 보완, 다시 실행, QA에서 나온 문제만 다시 고치기, 결과 개선 같은 후속 요청에도 사용한다. 한 파일의 작은 수정이나 단순 질문에는 쓰지 않고 직접 처리한다."
---

# 고향으로 ON 개발 오케스트레이터

## 실행 모드: 혼합

| 단계 | 실행 모드 | 이유 |
|---|---|---|
| 1. 계약 정하기 | 리더(메인)가 직접 | 서버·앱이 같은 기준으로 동시에 작업하려면 API 형식을 먼저 확정해야 한다 |
| 2. 구현 | 서브에이전트 위임 (병렬) | 담당마다 고치는 폴더가 달라 서로 대화할 필요가 없다 |
| 3. 검증 | 서브에이전트 위임 (qa-integrator) | 독립된 검증자 한 명이 결과를 한 번 판정하면 된다 |
| 4. 수정 반복 | 서브에이전트 위임 (해당 담당만) | QA 항목별로 담당이 정해져 있다. 최대 2회 |

## 에이전트 구성

| 에이전트 (`subagent_type`) | 맡는 폴더 | 스킬 | 산출물 |
|---|---|---|---|
| backend-engineer | `HometownON/backend/app` (chatbot 제외), `tests/`, `Crawling_Haman/Hometown_on.sql`, 테이블 설명서 | hometown-backend | `_workspace/02_backend_report.md` |
| mobile-engineer | `HometownON/frontend/src` | hometown-mobile | `_workspace/02_mobile_report.md` |
| ai-engineer | `HometownON/backend/app/chatbot`, `Ai_llm/`, `Crawling_Haman/*.py` | hometown-ai | `_workspace/02_ai_report.md` |
| qa-integrator | (읽기 + 테스트 실행) | hometown-qa | `_workspace/03_qa_findings.md` |

필요한 담당만 부른다. 서버만 바뀌는 작업이면 backend-engineer와 qa-integrator만 쓴다.

## 작업 절차

### 0단계: 기존 작업 확인
1. `_workspace/`(저장소 루트, git 에 올리지 않음)가 있는지 본다.
   - 없음 → 처음부터 실행.
   - 있음 + "QA에서 나온 것만 고쳐줘" 같은 부분 요청 → `03_qa_findings.md`를 읽고 4단계부터.
   - 있음 + 새 기능 요청 → 기존 폴더를 `_workspace_YYYYMMDD_HHMM/`으로 옮기고 새로 시작.
2. 현재 브랜치와 `git status`를 확인한다. main 에서 바로 작업하지 않는다.

### 1단계: 계약 정하기 (리더)
1. 관련 코드를 직접 읽는다: 서버 라우터/스키마, 앱 화면의 fetch 와 응답 사용 부분.
2. `_workspace/01_contract.md`에 적는다:
   - 엔드포인트별 메서드·주소·인증 필요 여부·요청 본문·응답 필드(예시 JSON)
   - 담당별 작업 목록과 **고칠 파일 범위**(겹치지 않게)
   - 지켜야 할 원칙: 기존 주소/필드 유지, LLM 은 MonoGPT, 비밀값은 루트 `.env`만
   - 저장 키와 값(예: `preferences.careerPlan` 에 무엇을 넣는지)을 적을 때는 **그 키를 이미 쓰는 코드를 직접 열어 실제 값을 확인**하고 계약에 옮겨 적는다. 이름만 보고 뜻을 추측하면 같은 키에 값 체계가 둘 생긴다 (가입은 직업 분류, 수정은 지속/전환을 같은 키에 넣은 사례)
3. 앱 응답 형식이 바뀌면 `hometown-mobile` 스킬의 "서버 응답 형식" 목록도 갱신한다.

### 2단계: 구현 (병렬 위임)
한 메시지에서 필요한 담당을 동시에 호출한다. 프롬프트에 넣을 것: 계약 파일 경로, 담당 작업 목록, 고칠 수 있는 파일 범위, 보고서 경로.

```
Agent(subagent_type: "backend-engineer", description: "서버 구현", prompt: "...계약: _workspace/01_contract.md ... 보고서: _workspace/02_backend_report.md")
Agent(subagent_type: "mobile-engineer",  description: "앱 연결",  prompt: "...")
Agent(subagent_type: "ai-engineer",      description: "챗봇 수정", prompt: "...")
```
완료 알림을 기다린다. 기다리는 동안 같은 작업을 직접 하지 않는다.

### 3단계: 검증
`Agent(subagent_type: "qa-integrator", prompt: "계약과 02_*_report.md 를 읽고 hometown-qa 절차로 검증, 결과는 _workspace/03_qa_findings.md")`

### 4단계: 수정 반복 (최대 2회)
- 판정이 FAIL 이면 항목의 담당만 다시 호출한다: "`_workspace/03_qa_findings.md`의 #1, #3 만 고쳐라".
- 수정 뒤 3단계를 다시 실행한다. 2회 뒤에도 남은 항목은 사용자에게 그대로 보고한다.

### 5단계: 마무리
1. 리더가 직접 `pytest`와 `check_app_contract.py`를 한 번 더 돌려 결과를 확인한다(보고서만 믿지 않는다).
2. 커밋은 사용자가 요청했을 때만, 영역별로 나눠 한다. `.env` 가 커밋에 없는지 확인한다.
3. 사용자에게: 바뀐 것, 테스트 결과(숫자), 남은 문제, 사용자가 해야 할 일(키 등록 등)을 보고한다.

## 데이터 전달
- 모든 중간 산출물은 `_workspace/{단계}_{담당}_{내용}.md` 파일로 주고받는다(예: `02_backend_report.md`).
- 최종 산출물은 코드 변경 자체다. `_workspace/`는 사후 확인용으로 남긴다(.gitignore 대상).

## 오류 처리

| 상황 | 대응 |
|---|---|
| 담당 에이전트 실패 | 한 번 다시 호출한다. 또 실패하면 그 부분 없이 진행하고 최종 보고에 적는다 |
| 테스트 DB 없음 | QA 판정이 INCOMPLETE 이면 리더가 DB 를 띄울 방법(`docker compose up -d db`)을 사용자에게 안내한다 |
| MonoGPT 401/402, 사용량 한도 | 다시 시도하지 않는다. 어디까지 됐는지 확인해 보고하고 사용자에게 키/잔액 확인을 요청한다 |
| 두 담당이 같은 파일을 고쳐야 함 | 동시에 시키지 않는다. 한 담당이 끝난 뒤 다음 담당을 부른다 |
| 계약과 기존 앱 동작이 충돌 | 기존 앱 동작을 우선하고 계약을 고친다. 바꿔야 하면 사용자에게 묻는다 |

## 테스트 시나리오

### 정상 흐름
1. 요청: "의뢰 게시판에서 의뢰 수락 기능을 앱에 연결해줘"
2. 1단계: `PUT /api/requests/{id}` `{status: "matched", accepted_by}` 계약 작성, 담당 = backend(테스트 추가), mobile(RequestBoardScreen 수락 버튼).
3. 2단계: 두 담당 병렬 실행 → 보고서 2개.
4. 3단계: QA 가 pytest 통과 + 앱 호출이 `PUT` 이고 Authorization 헤더가 있는지 대조 → PASS.
5. 결과: 코드 변경, `_workspace/` 보고서 3개, 사용자 보고.

### 오류 흐름
1. 3단계 QA 가 FAIL: "화면이 `item.acceptedBy` 를 읽지만 서버는 `accepted_by`".
2. 4단계: mobile-engineer 만 "#1 만 고쳐라"로 다시 호출 → QA 재실행 → PASS.
3. 2회 뒤에도 실패하면 남은 항목과 원인을 사용자에게 그대로 보고한다.
