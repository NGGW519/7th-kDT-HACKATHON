"""LangGraph 로 구성한 미션 추천 플로우: 프로필 조회 → 후보 검색 → LLM 추천.

실행:  python mission_graph.py [user_id]
"""
import sys
from typing import TypedDict

from langgraph.graph import END, StateGraph

from mission_rag import (
    build_mission_vector_db,
    count_mission_documents,
    generate_recommendation,
    get_user_profile,
    search_candidate_missions,
)


# 각 노드는 자신이 채운 키만 담은 부분 dict 를 반환하고, LangGraph 가 상태에 병합한다.
class MissionState(TypedDict):
    user_id: int
    profile: dict
    candidates: list[dict]
    recommendation: str


def node_load_profile(state: MissionState) -> dict:
    return {"profile": get_user_profile(state["user_id"])}


def node_search_missions(state: MissionState) -> dict:
    return {"candidates": search_candidate_missions(state["user_id"], profile=state["profile"])}


def node_recommend_missions(state: MissionState) -> dict:
    return {
        "recommendation": generate_recommendation(
            state["user_id"], state["candidates"], profile=state["profile"]
        )
    }


def build_mission_recommendation_graph():
    graph = StateGraph(MissionState)
    graph.add_node("load_profile", node_load_profile)
    graph.add_node("search_missions", node_search_missions)
    graph.add_node("recommend_missions", node_recommend_missions)
    graph.set_entry_point("load_profile")
    graph.add_edge("load_profile", "search_missions")
    graph.add_edge("search_missions", "recommend_missions")
    graph.add_edge("recommend_missions", END)
    return graph.compile()


if __name__ == "__main__":
    target_user_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    if count_mission_documents() == 0:  # 첫 실행이면 미션 임베딩부터 생성
        build_mission_vector_db()
    app = build_mission_recommendation_graph()
    result = app.invoke({"user_id": target_user_id})
    print("추천 미션 결과:")
    print(result["recommendation"])
