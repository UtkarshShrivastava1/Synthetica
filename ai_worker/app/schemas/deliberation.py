from pydantic import BaseModel, Field
from typing import List, Optional

class TurnHistoryItem(BaseModel):
    sender: str = Field(..., description="Sender identifier, e.g. agent_a or agent_b")
    message: str = Field(..., description="Dialogue message content")

class DeliberateRequest(BaseModel):
    agent_id: str = Field(..., description="Active speaking agent identifier")
    core_premise: str = Field(..., description="Baseline foundational perspective of the agent")
    retrieved_memories: List[str] = Field(default_factory=list, description="Past consolidated insights retrieved via vector search")
    recent_turns: List[TurnHistoryItem] = Field(default_factory=list, description="Window of recent turns in conversation")

class DeliberateResponse(BaseModel):
    response: str = Field(..., description="Dialectical response text from the agent")
