from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
import json

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings
from .tools.post_tools import create_post_tool

# --- Agent Setup --- #
def create_generate_post_agent():
    """Generate Post Agent 생성"""
    
    # System prompt 설정
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert copywriter. The user wants you to write a community post.

IMPORTANT: Look at the chat history carefully. If there's already a detailed post format or content suggestion from a previous conversation, USE THAT as the basis for your post. Don't create completely different content.

You have access to the following tool:
create_post_tool(title: str, content: str, category: str, token: str) -> dict
create_post_tool: 게시글을 생성하여 데이터베이스에 저장합니다.

To create a post, you MUST use the 'create_post_tool' tool. Your response MUST be a tool call. Do NOT generate the post content directly.

The category must be one of: "일상", "맛집", "추억", "기타".

Respond in Korean.

Guidelines:
1. Check the chat history first for any previous post suggestions or formats
2. If there's a detailed post content from previous messages, use that as the basis
3. Extract the key information (title, content, appropriate category) from the conversation context
4. Only if no previous content exists, create new appropriate content

Always use the token that will be provided in the input when calling create_post_tool."""),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])
    
    # LLM 설정
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.OPENAI_API_KEY,
        temperature=0.7,
        streaming=True
    )
    
    # Tools 설정
    tools = [create_post_tool]
    
    # Agent 생성
    agent = create_openai_tools_agent(llm, tools, prompt)
    
    # AgentExecutor 생성
    agent_executor = AgentExecutor(
        agent=agent, 
        tools=tools, 
        verbose=True,
        handle_parsing_errors=True,
        return_intermediate_steps=True
    )
    
    return agent_executor

# --- Main Agent Function --- #
async def run_generate_post_agent(state: AgentState):
    """Generates a post using AgentExecutor with streaming."""
    print("--- Running Generate Post Agent with Tool Calling ---")
    
    user_id = state.get("user_id")
    token = state.get("token")
    prompt = state.get("prompt")
    
    if not user_id or not token:
        error_msg = "사용자 인증 정보가 없습니다."
        print(f"Error: {error_msg}")
        yield {"generation": error_msg}
        return
    
    if not prompt:
        error_msg = "생성할 게시글에 대한 요청이 없습니다."
        print(f"Error: {error_msg}")
        yield {"generation": error_msg}
        return
    
    try:
        # Agent 생성
        agent_executor = create_generate_post_agent()
        
        # 대화 히스토리 가져오기
        messages = state.get("messages", [])
        chat_history = []
        for msg in messages[:-1]:  # 마지막 메시지 제외 (현재 요청)
            chat_history.append(msg)
        
        # Agent 실행을 위한 입력 준비
        agent_input = {
            "input": f"""사용자 요청: {prompt}

인증 토큰: {token}

이전 대화 내용을 참고하여 사용자가 원하는 게시글을 create_post_tool을 사용하여 생성하고 저장해주세요.
만약 이전 대화에서 게시글 내용이나 포맷이 제안되었다면 그것을 기반으로 하세요.
토큰 매개변수에는 위에 제공된 토큰을 사용하세요.""",
            "chat_history": chat_history
        }
        
        # 스트리밍 실행
        full_response = ""
        async for chunk in agent_executor.astream(agent_input):
            # 중간 단계나 최종 결과 처리
            if "output" in chunk:
                content = chunk["output"]
                full_response += content
                yield content
            elif "intermediate_steps" in chunk:
                # 도구 호출 결과가 있으면 처리
                for step in chunk["intermediate_steps"]:
                    if len(step) >= 2:
                        tool_result = step[1]  # 도구 실행 결과
                        if isinstance(tool_result, dict) and tool_result.get("status") == "success":
                            success_msg = f"\n✅ {tool_result.get('message', '게시글이 생성되었습니다.')}"
                            yield success_msg
                            full_response += success_msg
        
        # 최종 결과가 없으면 기본 메시지
        if not full_response.strip():
            final_msg = "게시글 생성이 완료되었습니다!"
            yield final_msg
            full_response = final_msg
            
        # Update task index for work plan progression
        current_index = state.get("current_task_index", 0)
        yield {"generation": full_response, "current_task_index": current_index + 1}
        
    except Exception as e:
        error_msg = f"게시글 생성 중 오류가 발생했습니다: {e}"
        print(f"Agent execution error: {e}")
        yield {"generation": error_msg}

# --- Alternative: Simpler Direct Approach --- #
async def run_generate_post_agent_simple(state: AgentState):
    """더 간단한 버전: LLM으로 내용 생성 후 바로 도구 호출"""
    print("--- Running Generate Post Agent (Simple Version) ---")
    
    user_id = state.get("user_id")
    token = state.get("token")
    prompt = state.get("prompt")
    
    if not all([user_id, token, prompt]):
        error_msg = "필수 정보가 없습니다."
        yield {"generation": error_msg}
        return
    
    try:
        # 1단계: LLM으로 게시글 내용 생성
        generation_prompt = ChatPromptTemplate.from_messages([
            ("system", f"""{AgentSystemPrompt.GENERATE_POST_PROMPT}
            
사용자의 요청을 바탕으로 게시글을 생성하세요. 
응답은 반드시 다음 JSON 형식이어야 합니다:
{{
    "title": "게시글 제목",
    "content": "게시글 내용", 
    "category": "카테고리"
}}"""),
            ("human", "{prompt}")
        ])
        
        llm = ChatOpenAI(
            model="gpt-4o", 
            api_key=settings.OPENAI_API_KEY, 
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        chain = generation_prompt | llm
        response = await chain.ainvoke({"prompt": prompt})
        
        # JSON 파싱
        post_data = json.loads(response.content)
        title = post_data.get("title")
        content = post_data.get("content")  
        category = post_data.get("category")
        
        if not all([title, content, category]):
            yield {"generation": "게시글 생성 중 오류: 필수 항목이 누락되었습니다."}
            return
        
        yield f"📝 게시글을 생성했습니다:\n제목: {title}\n카테고리: {category}\n\n게시글을 저장하는 중..."
        
        # 2단계: 도구를 사용하여 저장
        result = await create_post_tool(title, content, category, token)
        
        if result["status"] == "success":
            final_msg = f"✅ 게시글 '{title}'이 성공적으로 생성되었습니다! (ID: {result.get('post_id')})"
        else:
            final_msg = f"❌ 게시글 저장 실패: {result.get('message')}"
            
        yield final_msg
        yield {"generation": f"게시글 생성 완료\n제목: {title}\n상태: {result['status']}"}
        
    except json.JSONDecodeError:
        yield {"generation": "게시글 생성 중 오류: AI 응답을 파싱할 수 없습니다."}
    except Exception as e:
        yield {"generation": f"게시글 생성 중 오류: {e}"}