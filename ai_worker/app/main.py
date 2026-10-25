import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .schemas.embedding import EmbedRequest, EmbedResponse
from .schemas.deliberation import DeliberateRequest, DeliberateResponse
from .schemas.reflection import ReflectRequest, ReflectResponse
from .services.gemini_service import generate_embedding, deliberate, reflect

app = FastAPI(
    title="Synthetica AI Inference Microservice",
    description="Dedicated microservice for Gemini multi-agent deliberation, metacognitive reflection, and vector embedding",
    version="1.0.0"
)

# Enable CORS for local development and gateway connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/api/health")
async def health_check():
    gemini_key_configured = bool(os.getenv("GEMINI_API_KEY", "").strip())
    return {
        "status": "healthy",
        "service": "Synthetica AI Inference Microservice",
        "gemini_api_configured": gemini_key_configured,
        "deliberation_model": os.getenv("GEMINI_DELIBERATION_MODEL", "gemini-2.5-pro"),
        "reflection_model": os.getenv("GEMINI_REFLECTION_MODEL", "gemini-2.5-flash"),
        "embedding_model": os.getenv("GEMINI_EMBEDDING_MODEL", "text-embedding-004"),
    }


@app.post("/api/embed", response_model=EmbedResponse)
async def api_embed(request: EmbedRequest):
    try:
        vec = await generate_embedding(request.text)
        return EmbedResponse(embedding=vec)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")


@app.post("/api/deliberate", response_model=DeliberateResponse)
async def api_deliberate(request: DeliberateRequest):
    try:
        recent_turns_dict = [t.model_dump() for t in request.recent_turns]
        response_text = await deliberate(
            agent_id=request.agent_id,
            core_premise=request.core_premise,
            retrieved_memories=request.retrieved_memories,
            recent_turns=recent_turns_dict,
        )
        return DeliberateResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deliberation synthesis failed: {str(e)}")


@app.post("/api/reflect", response_model=ReflectResponse)
async def api_reflect(request: ReflectRequest):
    try:
        reflection_data = await reflect(
            agent_id=request.agent_id,
            core_premise=request.core_premise,
            incoming_message=request.incoming_message,
            agent_response=request.agent_response,
        )
        return ReflectResponse(**reflection_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reflection extraction failed: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
