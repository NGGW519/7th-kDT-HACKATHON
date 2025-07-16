# chromadb, openai, langgraph 등은 실제 환경에서 pip install 필요
from langgraph.graph import StateGraph, END, State  # type: ignore
from typing import Dict, Any
from mission_rag import search_similar_missions, recommend_missions

# 상태 정의: 유저 ID, 검색 결과, 추천 결과
class MissionState(State):
    user_id: int
    similar_missions: list[str] = []
    recommendation: str = ''

# 1단계: 유저 프로필 기반 미션 벡터 검색
def node_search_missions(state: MissionState) -> MissionState:
    similar = search_similar_missions(state.user_id)
    state.similar_missions = similar
    return state

# 2단계: LLM을 통한 미션 추천 생성
def node_recommend_missions(state: MissionState) -> MissionState:
    rec = recommend_missions(state.user_id)
    state.recommendation = rec
    return state

# LangGraph 플로우 정의
def build_mission_recommendation_graph():
    graph = StateGraph(MissionState)
    graph.add_node('search_missions', node_search_missions)
    graph.add_node('recommend_missions', node_recommend_missions)
    graph.add_edge('search_missions', 'recommend_missions')
    graph.add_edge('recommend_missions', END)
    graph.set_entry_point('search_missions')
    return graph

if __name__ == '__main__':
    user_id = 1  # 예시 유저
    graph = build_mission_recommendation_graph()
    state = MissionState(user_id=user_id)
    result = graph.run(state)
    print('추천 미션 결과:')
    print(result.recommendation) 