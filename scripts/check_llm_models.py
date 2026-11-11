#!/usr/bin/env python3
"""OpenRouter 무료 모델 상태 점검 (매주 GitHub Actions 에서 실행, 로컬 실행도 가능).

설정된 채팅 모델(LLM_MODEL + LLM_FALLBACK_MODELS)과 임베딩 모델(EMBEDDING_MODEL)에 대해
  1) OpenRouter 모델 목록에 아직 있는지
  2) 여전히 무료인지
  3) (OPENROUTER_API_KEY 가 있으면) 실제로 응답하는지
를 확인하고, 문제가 있으면 바꿔 쓸 수 있는 무료 모델 후보를 보여준다.

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
    headers = {"Content-Type": "application/json"}
    if key:
        headers["Authorization"] = f"Bearer {key}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if body is not None else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.load(resp)


def is_free(model_info: dict) -> bool:
    pricing = model_info.get("pricing") or {}
    return all(float(pricing.get(k) or 0) == 0 for k in ("prompt", "completion"))


def live_chat(base: str, key: str, model: str, max_tokens: int) -> str | None:
    """None = 정상, 문자열 = 실패 사유. 앱과 같은 max_tokens 로 호출한다
    (추론형 모델은 답하기 전에 토큰을 쓰므로, 작게 주면 정상 모델도 빈 응답이 된다)."""
    try:
        res = request_json(f"{base}/chat/completions", key, {
            "model": model, "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": "안녕하세요. 한 단어로 인사해 주세요."}],
        })
        content = ((res.get("choices") or [{}])[0].get("message") or {}).get("content")
        return None if content and content.strip() else "빈 응답"
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:120]}"
    except Exception as e:  # 네트워크 오류 등
        return f"{type(e).__name__}: {str(e)[:120]}"


def live_embedding(base: str, key: str, model: str, max_tokens: int = 0) -> str | None:
    try:
        res = request_json(f"{base}/embeddings", key, {"model": model, "input": ["함안군 경로당"]})
        vector = (res.get("data") or [{}])[0].get("embedding")
        return None if vector else "빈 응답"
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:120]}"
    except Exception as e:
        return f"{type(e).__name__}: {str(e)[:120]}"


def main() -> int:
    parser = argparse.ArgumentParser(description="OpenRouter 무료 모델 상태 점검")
    parser.add_argument("--no-live", action="store_true", help="실제 호출 없이 모델 목록만 확인")
    args = parser.parse_args()

    dotenv = read_dotenv(ROOT / ".env")

    def setting(name: str, path: str, pattern: str) -> str:
        return os.environ.get(name) or dotenv.get(name) or code_default(path, pattern)

    base = os.environ.get("OPENROUTER_BASE_URL") or dotenv.get("OPENROUTER_BASE_URL") or "https://openrouter.ai/api/v1"
    primary = setting("LLM_MODEL", CONFIG_PY, r'LLM_MODEL: str = "([^"]+)"')
    fallbacks = [m.strip() for m in setting("LLM_FALLBACK_MODELS", CONFIG_PY, r'LLM_FALLBACK_MODELS: str = "([^"]+)"').split(",") if m.strip()]
    embedding = setting("EMBEDDING_MODEL", MISSION_RAG_PY, r'os\.getenv\("EMBEDDING_MODEL", "([^"]+)"\)')
    max_tokens = int(setting("LLM_MAX_TOKENS", CONFIG_PY, r"LLM_MAX_TOKENS: int = (\d+)"))
    key = os.environ.get("OPENROUTER_API_KEY") or dotenv.get("OPENROUTER_API_KEY")
    live = bool(key) and not args.no_live

    chat_models = {m["id"]: m for m in request_json(f"{base}/models")["data"]}
    embed_models = {m["id"]: m for m in request_json(f"{base}/embeddings/models")["data"]}

    fallbacks = [m for m in fallbacks if m != primary]
    ignored = fallbacks[2:]  # OpenRouter 는 models 배열을 기본 포함 3개까지만 받으므로 앱도 앞의 2개만 쓴다
    checks = [("기본 채팅", primary, chat_models, live_chat)]
    checks += [("대체 채팅", m, chat_models, live_chat) for m in fallbacks[:2]]
    checks += [("임베딩", embedding, embed_models, live_embedding)]

    rows, critical_failed, any_failed = [], False, False
    for role, model, catalog, live_fn in checks:
        info = catalog.get(model)
        problem = None
        if info is None:
            problem = "목록에서 사라짐"
        elif not is_free(info):
            problem = "더 이상 무료가 아님"
        elif live and key:
            problem = live_fn(base, key, model, max_tokens)
        rows.append((role, model, "정상" if problem is None else problem))
        if problem:
            any_failed = True
            critical_failed |= role != "대체 채팅"

    mode = "목록 + 실제 호출" if live else "목록만 (OPENROUTER_API_KEY 없음 또는 --no-live)"
    lines = [f"## OpenRouter 무료 모델 점검 ({mode})", "", "| 역할 | 모델 | 결과 |", "| --- | --- | --- |"]
    lines += [f"| {r} | `{m}` | {res} |" for r, m, res in rows]
    if ignored:
        lines += ["", f"참고: 대체 모델은 2개까지만 쓰입니다 (OpenRouter 제한). 무시되는 모델: {', '.join(ignored)}"]
    if any_failed:
        configured = {m for _, m, _ in rows}
        chat_free = sorted(m for m, i in chat_models.items() if m.endswith(":free") and is_free(i) and m not in configured)
        embed_free = sorted(m for m, i in embed_models.items() if is_free(i) and m not in configured)
        lines += ["", "바꿔 쓸 수 있는 무료 모델 후보 (목록 기준, 실제 품질은 따로 확인):",
                  f"- 채팅: {', '.join(chat_free[:10]) or '없음'}",
                  f"- 임베딩: {', '.join(embed_free[:10]) or '없음'}",
                  "", "교체 방법: 루트 .env 의 LLM_MODEL / LLM_FALLBACK_MODELS / EMBEDDING_MODEL 을 바꾸고, "
                  "기본값도 바꾸려면 backend config.py 와 mission_rag.py 를 함께 수정."]
    report = "\n".join(lines)
    print(report)

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(report + "\n")
    return 1 if critical_failed else 0


if __name__ == "__main__":
    sys.exit(main())
