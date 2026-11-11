#!/usr/bin/env python3
"""고향으로 ON 앱 ↔ 서버 연결 지점 정적 검사 (표준 라이브러리만 사용).

검사 항목
  --api  : 앱의 fetch/XHR 호출 주소·메서드가 서버 API(OpenAPI)에 있는지, 서버 API 중 앱이 안 쓰는 것
  --nav  : navigation.navigate('X') 대상이 등록된 화면(name="X")인지
  --env  : 앱에서 @env 로 비밀키를 import 하거나 서버 주소를 코드에 직접 쓴 곳
  (옵션이 없으면 모두 검사)

서버 API 목록은 백엔드 앱을 import 해서 OpenAPI 로 얻는다(DB 접속 없음). 백엔드 의존성이 없는
파이썬이면 --openapi <파일> 로 미리 저장한 openapi.json 을 넘긴다.

종료 코드: 0 = 문제 없음, 1 = 문제 있음
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
FRONT = ROOT / "HometownON" / "frontend" / "src"
BACKEND = ROOT / "HometownON" / "backend"
SOURCE_EXT = {".js", ".jsx", ".ts", ".tsx"}
SECRET_ENV = {"MONOGPT_API_KEY", "GOOGLE_API_KEY", "SECRET_KEY", "POSTGRES_PASSWORD", "OPENROUTER_API_KEY",
              "WEATHER_API_KEY", "GOOGLEMAP_API_KEY", "OPENAI_API_KEY"}


def sources():
    """앱 소스: src/ 전체 + 앱 루트의 App.js·index.js 같은 파일 (babel/metro 등 *.config.js 는 Node 에서 도는 설정이라 제외)."""
    files = [p for p in FRONT.rglob("*") if p.suffix in SOURCE_EXT and "node_modules" not in p.parts]
    files += [p for p in FRONT.parent.glob("*") if p.suffix in SOURCE_EXT and not p.name.endswith(".config.js")]
    for p in sorted(files):
        yield p, p.read_text(encoding="utf-8", errors="replace")


def load_openapi(path: str | None) -> dict:
    if path:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    os.environ.setdefault("MONOGPT_API_KEY", "x")
    os.environ.setdefault("POSTGRES_PASSWORD", "x")
    os.environ.setdefault("SECRET_KEY", "x" * 32)
    sys.path.insert(0, str(BACKEND))
    from app.main import app  # noqa: E402
    return app.openapi()


def route_patterns(openapi: dict):
    routes = []
    for path, ops in openapi["paths"].items():
        regex = "^" + re.sub(r"\\\{[^/]+\\\}", r"[^/]+", re.escape(path.rstrip("/"))) + "/?$"
        for method in ops:
            routes.append((method.upper(), path, re.compile(regex)))
    return routes


# 주소 인자: `템플릿`(안에 따옴표가 있어도 됨) | '문자열' | "문자열" | 변수 이름
CALL = re.compile(r"""(?:fetch|\.open)\(\s*(?:['"](GET|POST|PUT|PATCH|DELETE)['"]\s*,\s*)?(?:`([^`]*)`|'([^'\n]*)'|"([^"\n]*)"|(\w+))""")
METHOD_NEAR = re.compile(r"""method\s*:\s*['"](GET|POST|PUT|PATCH|DELETE)['"]""", re.I)
ASSIGN = re.compile(r"""\b(\w+)\s*=\s*(?:`([^`\n]*/api[^`\n]*)`|'([^'\n]*/api[^'\n]*)'|"([^"\n]*/api[^"\n]*)")""")
ALIAS = re.compile(r"""\b(?:const|let|var)\s+(\w+)\s*=\s*(\w+)\s*;?\s*$""", re.M)
ALIAS_TEMPLATE = re.compile(r"""\b(?:const|let|var)\s+(\w+)\s*=\s*`\$\{(\w+)\}([^`\n]*)`""")


def _assignments(text: str):
    for m in ASSIGN.finditer(text):
        yield m.group(1), m.group(2) or m.group(3) or m.group(4)


def _resolve(url: str, variables: dict[str, set[str]]) -> set[str]:
    """`${baseApiEndpoint}/${id}` 처럼 같은 파일에서 대입한 변수로 시작하는 주소를 펼친다."""
    head = re.match(r"\$\{(\w+)\}(.*)", url)
    if head and head.group(1) in variables:
        return {base + head.group(2) for base in variables[head.group(1)]}
    return {url}


def shared_variables() -> dict[str, set[str]]:
    """src/config/apiConfig.js 가 export 하는 주소 변수(API_BASE 등). 다른 파일에서 import 해 써도 따라간다."""
    config = FRONT / "config" / "apiConfig.js"
    found: dict[str, set[str]] = {}
    if config.is_file():
        for name, value in _assignments(config.read_text(encoding="utf-8", errors="replace")):
            found.setdefault(name, set()).add(value)
    return found


def app_calls():
    """앱의 fetch/XHR 호출을 (메서드, /api/... 경로, 위치)로 뽑는다. 다른 파일에서 만든 주소는 따라가지 못한다."""
    for p, text in sources():
        text = _strip_line_comments(text)  # 주석 속 예시 호출은 대조하지 않는다 (줄 번호는 유지)
        variables: dict[str, set[str]] = {k: set(v) for k, v in shared_variables().items()}
        for name, value in _assignments(text):
            variables.setdefault(name, set()).add(value)
        # 별칭: const API_BASE_URL = API_BASE;  /  const X = `${API_BASE}/board`;
        for name, other in ALIAS.findall(text):
            if other in variables:
                variables.setdefault(name, set()).update(variables[other])
        for name, other, tail in ALIAS_TEMPLATE.findall(text):
            if other in variables:
                variables.setdefault(name, set()).update(base + tail for base in variables[other])
        for m in CALL.finditer(text):
            if m.group(5):  # fetch(url) 처럼 변수 하나를 넘긴 경우
                urls = variables.get(m.group(5), set())
            else:
                urls = _resolve(m.group(2) or m.group(3) or m.group(4) or "", variables)
            method = m.group(1)
            if not method:
                near = METHOD_NEAR.search(text, m.end(), m.end() + 400)
                method = near.group(1).upper() if near else "GET"
            line = text.count("\n", 0, m.start()) + 1
            for url in urls:
                for resolved in (_resolve(url, variables) if url.startswith("${") else {url}):
                    for full in _expand_ternaries(resolved):
                        if "/api" not in full:
                            continue
                        tail = full.split("/api", 1)[1]
                        path = "/api" + (tail if tail.startswith("/") else "/" + tail)
                        path = re.sub(r"\$\{[^}]+\}", "{x}", path).split("?")[0]
                        yield method, path, f"{p.relative_to(ROOT)}:{line}"


TERNARY = re.compile(r"""\$\{[^{}]*\?\s*['"]([^'"]*)['"]\s*:\s*['"]([^'"]*)['"]\s*\}""")


def _expand_ternaries(url: str) -> list[str]:
    """`/${isLiked ? 'unlike' : 'like'}` 처럼 문자열 두 개 중 하나를 고르는 부분을 두 경우 모두로 펼친다."""
    m = TERNARY.search(url)
    if not m:
        return [url]
    head, tail = url[:m.start()], url[m.end():]
    return [*_expand_ternaries(head + m.group(1) + tail), *_expand_ternaries(head + m.group(2) + tail)]


def check_api(openapi_path):
    routes = route_patterns(load_openapi(openapi_path))
    problems, used = [], set()
    for method, path, where in app_calls():
        probe = path.replace("{x}", "1").rstrip("/")
        hits = [r for r in routes if r[2].match(probe)]
        if not hits:
            problems.append(f"[api] 서버에 없는 주소: {method} {path}  ({where})")
            continue
        if not any(r[0] == method for r in hits):
            problems.append(f"[api] 메서드 불일치: 앱 {method} {path}, 서버는 {sorted({r[0] for r in hits})}  ({where})")
        used.update((r[0], r[1]) for r in hits if r[0] == method)
    server_only = {"/", "/health"}
    unused = sorted({(m, p) for m, p, _ in routes if p in server_only or True} - used)
    unused = [(m, p) for m, p in unused if p not in server_only]
    return problems, [f"[api] 앱에서 찾지 못한 서버 API (다른 파일에서 주소를 만들면 놓칠 수 있음): {m} {p}"
                      for m, p in unused]


def _strip_line_comments(text: str) -> str:
    """// 주석 줄을 같은 길이의 공백으로 바꾼다 (줄 번호 유지). 주석 속 예시 코드를 결함으로 보지 않기 위해."""
    text = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)), text, flags=re.S)
    return re.sub(r"(?m)^[ \t]*//[^\n]*$", lambda m: " " * len(m.group(0)), text)


def check_nav():
    registered, targets = set(), []
    for p, text in sources():
        text = _strip_line_comments(text)
        registered |= set(re.findall(r"""\bname\s*=\s*\{?\s*['"]([^'"]+)['"]""", text))
        for m in re.finditer(r"""navigat(?:e|ion\.(?:navigate|replace|push))\(\s*['"]([^'"]+)['"]""", text):
            targets.append((m.group(1), f"{p.relative_to(ROOT)}:{text.count(chr(10), 0, m.start()) + 1}"))
    return [f"[nav] 등록되지 않은 화면으로 이동: '{t}'  ({w})" for t, w in targets if t not in registered], []


def check_env():
    problems = []
    for p, text in sources():
        rel = p.relative_to(ROOT)
        for m in re.finditer(r"import\s*\{([^}]*)\}\s*from\s*['\"]@env['\"]", text):
            bad = {n.strip().split(" as ")[0] for n in m.group(1).split(",")} & SECRET_ENV
            if bad:
                problems.append(f"[env] 앱에서 비밀키 import: {sorted(bad)}  ({rel})")
        for m in re.finditer(r"https?://(?:localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+)(?::\d+)?", text):
            if p.name != "apiConfig.js":
                line = text.count("\n", 0, m.start()) + 1
                problems.append(f"[env] 서버 주소를 코드에 직접 씀: {m.group(0)}  ({rel}:{line})")
        for m in re.finditer(r"""process\.env(?:\.(\w+)|\[\s*['"`](\w+)['"`]\s*\])""", _strip_line_comments(text)):
            name = m.group(1) or m.group(2)
            if name == "NODE_ENV":
                continue
            line = text.count("\n", 0, m.start()) + 1
            problems.append(f"[env] process.env.{name} 사용 - @env import 로 바꿀 것 "
                            f"(react-native-dotenv allowlist 를 우회해 .env 값이 번들에 들어갈 수 있음)  ({rel}:{line})")
    return problems, []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", action="store_true")
    ap.add_argument("--nav", action="store_true")
    ap.add_argument("--env", action="store_true")
    ap.add_argument("--openapi", help="미리 저장한 openapi.json 경로")
    args = ap.parse_args()
    run_all = not (args.api or args.nav or args.env)
    problems, notes = [], []
    if run_all or args.api:
        p, n = check_api(args.openapi); problems += p; notes += n
    if run_all or args.nav:
        p, n = check_nav(); problems += p; notes += n
    if run_all or args.env:
        p, n = check_env(); problems += p; notes += n
    for line in problems + notes:
        print(line)
    print(f"\n문제 {len(problems)}건, 참고 {len(notes)}건")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
