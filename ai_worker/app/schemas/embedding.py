from pydantic import BaseModel, Field
from typing import List

class EmbedRequest(BaseModel):
    text: str = Field(..., description="Text content to convert into semantic embedding")

class EmbedResponse(BaseModel):
    embedding: List[float] = Field(..., description="768-dimensional float embedding vector")
