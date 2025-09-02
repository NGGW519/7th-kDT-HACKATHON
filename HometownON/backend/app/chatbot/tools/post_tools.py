from langchain_core.tools import tool
from pydantic import BaseModel, Field
import httpx
from ...core.config import settings

# --- Tool Definition --- #
class CreatePostInput(BaseModel):
    title: str = Field(description="게시글 제목")
    content: str = Field(description="게시글 내용")
    category: str = Field(description="게시글 카테고리")
    token: str = Field(description="인증 토큰")

@tool("create_post_tool", args_schema=CreatePostInput)
async def create_post_tool(title: str, content: str, category: str, token: str) -> dict:
    """
    게시글을 생성하여 데이터베이스에 저장합니다.
    """
    print(f"[Tool] Creating post: {title}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.API_URL}/api/board/",
                json={
                    "title": title,
                    "content": content,
                    "category": category
                },
                headers={
                    "Authorization": f"Bearer {token}"
                }
            )
            response.raise_for_status()
            result = response.json()
            print(f"[Tool] Post created successfully with ID: {result.get('id')}")
            return {
                "status": "success", 
                "post_id": result.get("id"),
                "message": "게시글이 성공적으로 생성되었습니다."
            }
    except httpx.HTTPStatusError as e:
        error_msg = f"API 오류: {e.response.status_code} - {e.response.text}"
        print(f"[Tool] {error_msg}")
        return {"status": "error", "message": error_msg}
    except Exception as e:
        error_msg = f"예상치 못한 오류: {e}"
        print(f"[Tool] {error_msg}")
        return {"status": "error", "message": error_msg}

