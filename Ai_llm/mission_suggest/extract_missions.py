"""PostgreSQL 의 missions / mission_parts 를 임베딩용 텍스트로 추출해 JSON 으로 저장한다.

실행:  python extract_missions.py  →  같은 폴더에 extracted_missions.json 생성
"""
import json
from pathlib import Path

from db_config import get_connection

OUTPUT_PATH = Path(__file__).parent / "extracted_missions.json"

# DB 에는 영문 키로 저장한다 (앱·챗봇과 같은 값). 사람이 읽는 텍스트에는 한글 이름을 함께 쓴다.
MISSION_TYPE_LABELS = {"exploration": "탐색형", "bonding": "사회유대형", "career": "커리어형"}


def _as_list(value) -> list:
    """JSONB 컬럼(tags 등)을 리스트로 정규화한다 (문자열로 저장된 JSON 도 허용)."""
    if not value:
        return []
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError:
            return [value]
    return value if isinstance(value, list) else [value]


def format_mission(mission: dict, parts: list[dict]) -> str:
    """미션 1개를 임베딩/프롬프트에 쓰기 좋은 텍스트로 만든다."""
    lines = [
        f"미션명: {mission['title']}",
        f"유형: {MISSION_TYPE_LABELS.get(mission['mission_type'], mission['mission_type'])}",
        f"난이도: {mission['difficulty']}",
        f"예상 소요시간: {mission['expected_minutes'] or '정보 없음'}분",
        f"태그: {', '.join(map(str, _as_list(mission['tags']))) or '없음'}",
        f"설명: {mission['description'] or ''}",
    ]
    if parts:
        lines.append("단계:")
        lines.extend(f"  {p['step_no']}. {p['instruction'] or ''}" for p in parts)
    return "\n".join(lines)


def extract_mission_data() -> list[dict]:
    with get_connection() as conn:
        missions = conn.execute(
            """
            SELECT id, code, title, mission_type, difficulty, expected_minutes, tags, description
            FROM missions
            ORDER BY id
            """
        ).fetchall()
        parts_by_mission: dict[int, list[dict]] = {}
        for part in conn.execute(
            "SELECT mission_id, step_no, instruction FROM mission_parts ORDER BY mission_id, step_no"
        ):
            parts_by_mission.setdefault(part["mission_id"], []).append(part)

    return [
        {
            "id": m["id"],
            "title": m["title"],
            "mission_type": m["mission_type"],
            "content": format_mission(m, parts_by_mission.get(m["id"], [])),
        }
        for m in missions
    ]


if __name__ == "__main__":
    data = extract_mission_data()
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"총 {len(data)}개의 미션을 {OUTPUT_PATH} 에 저장했습니다.")
