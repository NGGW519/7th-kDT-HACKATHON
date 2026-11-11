"""게시글 작성 에이전트의 도구.

이전에는 사용자의 로그인 토큰을 LLM 프롬프트에 넣고 LLM 이 그 토큰으로 서버 API 를 부르게 했다.
토큰이 외부 LLM 제공사로 전송되므로, 지금은 서버가 사용자 ID 를 직접 넣어 DB 에 저장한다.
"""
from langchain_core.tools import tool
from pydantic import BaseModel, Field

from ...core.database import SessionLocal
from ...crud import crud_board

FREE_BOARD_CATEGORIES = ("일상", "맛집", "추억", "기타")


class CreatePostInput(BaseModel):
    title: str = Field(description="게시글 제목", max_length=200)
    content: str = Field(description="게시글 내용")
    category: str = Field(description="게시글 카테고리: 일상, 맛집, 추억, 기타 중 하나")


def make_post_tools(user_id: int, created: list | None = None):
    @tool("create_post_tool", args_schema=CreatePostInput)
    def create_post_tool(title: str, content: str, category: str) -> dict:
        """자유게시판에 게시글을 저장합니다."""
        if category not in FREE_BOARD_CATEGORIES:
            category = "기타"
        with SessionLocal() as db:
            post = crud_board.create_post(
                db, "free", {"title": title[:200], "content": content, "category": category}, user_id
            )
        if created is not None:
            created.append({"post_id": post.id, "title": post.title})
        return {"status": "success", "post_id": post.id, "message": f"게시글 '{post.title}'이 저장되었습니다."}

    return [create_post_tool]
