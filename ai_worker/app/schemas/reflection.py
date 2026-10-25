from pydantic import BaseModel, Field

class ReflectRequest(BaseModel):
    agent_id: str = Field(..., description="Active speaking agent identifier")
    core_premise: str = Field(..., description="Baseline foundational premise")
    incoming_message: str = Field(..., description="Counterpart's statement this turn")
    agent_response: str = Field(..., description="Agent's generated response this turn")

class ReflectResponse(BaseModel):
    insight: str = Field(..., description="1-2 sentences stating the specific logical argument or concession adopted")
    deltaStance: str = Field(..., description="Description of how the current stance differs from the baseline premise")
    convergenceScore: float = Field(..., ge=0.0, le=1.0, description="Consensus metric between 0.0 and 1.0")
