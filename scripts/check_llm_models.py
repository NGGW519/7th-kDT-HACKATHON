#!/usr/bin/env python3
"""MonoGPT 모델 상태 점검 (매주 GitHub Actions 에서 실행, 로컬 실행도 가능).

설정된 채팅 모델(LLM_MODEL + LLM_FALLBACK_MODELS)과 임베딩 모델(EMBEDDING_MODEL)에 대해
  1) MonoGPT 모델 목록에 아직 있는지
  2) (MONOGPT_API_KEY 가 있으면) 실제로 응답하는지 (짧은 응답만 요청)
를 확인하고, 문제가 있으면 바꿔 쓸 수 있는 모델 후보를 보여준다.

모델 이름 우선순위: 환경 변수 > 저장소 루트 .env > 코드 기본값(backend config.py, mission_rag.py)
종료 코드: 0 = 정상(대체 모델 경고만 있을 수 있음), 1 = 기본 채팅 모델 또는 임베딩 모델을 쓸 수 없음

사용법:  python scripts/check_llm_models.py [--no-live]
표준 라이브러리만 사용하므로 별도 설치가 필요 없다.
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PY = "HometownON/backend/app/core/config.py"
MISSION_RAG_PY = "Ai_llm/mission_suggest/mission_rag.py"
DEFAULT_BASE = "https://monogpt.kr/api/monorouter/v1"


def read_dotenv(path: Path) -> dict:
    values = {}
    if path.is_file():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def code_default(relative_path: str, pattern: str) -> str:
    match = re.search(pattern, (ROOT / relative_path).read_text(encoding="utf-8"))
    if not match:
        sys.exit(f"코드에서 기본 모델 이름을 찾지 못했습니다: {relative_path}")
    return match.group(1)


def request_json(url: str, key: str | None = None, body: dict | None = None, timeout: int = 90) -> dict:
    headers = {"Content-Type": "application/json", "User-Agent": "hometown-on-model-check"}
    if key:
        headers["Authorization"] = f"Bearer {key}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if body is not None else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.load(resp)


def _error(e: Exception) -> str:
    if isinstance(e, urllib.error.HTTPError):
        return f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:120]}"
    return f"{type(e).__name__}: {str(e)[:120]}"


def live_chat(base: str, key: str, model: str, max_tokens: int) -> str | None:
    """None = 정상, 문자열 = 실패 사유. 추론형 모델도 답할 수 있도록 앱과 같은 max_tokens 를 쓴다."""
    try:
        res = request_json(f"{base}/chat/completions", key, {
            "model": model, "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": "안녕하세요. 한 단어로 인사해 주세요."}],
        })
        content = ((res.get("choices") or [{}])[0].get("message") or {}).get("content")
        return None if content and content.strip() else "빈 응답"
    except Exception as e:
        return _error(e)


def live_embedding(base: str, key: str, model: str, max_tokens: int = 0) -> str | None:
    try:
        res = request_json(f"{base}/embeddings", key, {"model": model, "input": ["함안군 경로당"]})
        vector = (res.get("data") or [{}])[0].get("embedding")
        return None if vector else "빈 응답"
    except Exception as e:
        return _error(e)


def main() -> int:
    parser = argparse.ArgumentParser(description="MonoGPT 모델 상태 점검")
    parser.add_argument("--no-live", action="store_true", help="실제 호출 없이 모델 목록만 확인")
    args = parser.parse_args()

    dotenv = read_dotenv(ROOT / ".env")

    def setting(name: str, path: str, pattern: str) -> str:
        return os.environ.get(name) or dotenv.get(name) or code_default(path, pattern)

    base = (os.environ.get("MONOGPT_BASE_URL") or dotenv.get("MONOGPT_BASE_URL") or DEFAULT_BASE).rstrip("/")
    primary = setting("LLM_MODEL", CONFIG_PY, r'LLM_MODEL: str = "([^"]+)"')
    fallbacks = [m.strip() for m in setting("LLM_FALLBACK_MODELS", CONFIG_PY, r'LLM_FALLBACK_MODELS: str = "([^"]+)"').split(",") if m.strip()]
    embedding = setting("EMBEDDING_MODEL", MISSION_RAG_PY, r'os\.getenv\("EMBEDDING_MODEL", "([^"]+)"\)')
    max_tokens = int(setting("LLM_MAX_TOKENS", CONFIG_PY, r"LLM_MAX_TOKENS: int = (\d+)"))
    key = os.environ.get("MONOGPT_API_KEY") or dotenv.get("MONOGPT_API_KEY")
    live = bool(key) and not args.no_live

    try:
        catalog = {m["id"]: m for m in request_json(f"{base}/models", key)["data"]}
    except Exception as e:
        print(f"## MonoGPT 모델 점검 실패\n\n모델 목록을 가져오지 못했습니다: {_error(e)}")
        return 1

    checks = [("기본 채팅", primary, live_chat)]
    checks += [("대체 채팅", m, live_chat) for m in fallbacks if m != primary]
    checks += [("임베딩", embedding, live_embedding)]

    rows, critical_failed, any_failed = [], False, False
    for role, model, live_fn in checks:
        problem = "목록에서 사라짐" if model not in catalog else (live_fn(base, key, model, max_tokens) if live else None)
        rows.append((role, model, "정상" if problem is None else problem))
        if problem:
            any_failed = True
            critical_failed |= role != "대체 채팅"

    mode = "목록 + 실제 호출" if live else "목록만 (MONOGPT_API_KEY 없음 또는 --no-live)"
    lines = [f"## MonoGPT 모델 점검 ({mode})", "", "| 역할 | 모델 | 결과 |", "| --- | --- | --- |"]
    lines += [f"| {r} | `{m}` | {res} |" for r, m, res in rows]
    if any_failed:
        configured = {m for _, m, _ in rows}
        embed = sorted(m for m in catalog if "embedding" in m and m not in configured)
        chat = sorted(m for m in catalog if "embedding" not in m and m not in configured
                      and not re.search(r"image|tts|transcribe|realtime|live|whisper|eleven", m))
        lines += ["", "바꿔 쓸 수 있는 모델 후보 (목록 기준, 품질·가격은 따로 확인):",
                  f"- 채팅: {', '.join(chat[:15]) or '없음'}",
                  f"- 임베딩: {', '.join(embed) or '없음'}",
                  "", "교체 방법: 루트 .env 의 LLM_MODEL / LLM_FALLBACK_MODELS / EMBEDDING_MODEL 을 바꾸고, "
                  "기본값도 바꾸려면 backend config.py 와 mission_rag.py 를 함께 수정. "
                  "임베딩 모델을 바꾸면 Crawling_Haman Step 2 와 미션 벡터를 다시 만들어야 한다."]
    report = "\n".join(lines)
    print(report)

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(report + "\n")
    return 1 if critical_failed else 0


if __name__ == "__main__":
    sys.exit(main())
