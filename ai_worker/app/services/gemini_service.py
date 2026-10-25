import os
import json
import logging
import re
import hashlib
import numpy as np
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("synthetica.gemini_service")
logging.basicConfig(level=logging.INFO)

# Configuration from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
DELIBERATION_MODEL = os.getenv("GEMINI_DELIBERATION_MODEL", "gemini-2.5-pro")
REFLECTION_MODEL = os.getenv("GEMINI_REFLECTION_MODEL", "gemini-2.5-flash")
EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "text-embedding-004")

client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Google GenAI client initialized successfully with API key.")
    except Exception as e:
        logger.warning(f"Failed to initialize Google GenAI client: {e}. Will use mock fallback mode.")
else:
    logger.warning("No GEMINI_API_KEY provided in environment. Running in intelligent simulation/mock mode.")


def _generate_mock_embedding(text: str, dim: int = 768) -> List[float]:
    """Deterministically generate a normalized pseudo-embedding for text."""
    seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
    rng = np.random.default_rng(seed)
    vec = rng.standard_normal(dim)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


async def generate_embedding(text: str) -> List[float]:
    """Generates a 768-dimensional embedding vector for the given text."""
    if client:
        try:
            # Try official GenAI SDK embed_content
            response = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=text,
            )
            # Response handling in google-genai
            if hasattr(response, 'embedding') and hasattr(response.embedding, 'values'):
                return list(response.embedding.values)
            if hasattr(response, 'embeddings') and len(response.embeddings) > 0:
                return list(response.embeddings[0].values)
        except Exception as e:
            logger.error(f"Error calling Gemini Embedding API ({EMBEDDING_MODEL}): {e}. Using deterministic fallback.")
    
    return _generate_mock_embedding(text)


async def deliberate(
    agent_id: str,
    core_premise: str,
    retrieved_memories: List[str],
    recent_turns: List[Dict[str, str]],
) -> str:
    """
    Executes the deliberation prompt to synthesize the agent's dialectical response.
    """
    memories_str = "\n".join([f"- {m}" for m in retrieved_memories]) if retrieved_memories else "(No past consolidated reflections recalled yet.)"
    
    if recent_turns:
        turns_str = "\n".join([f"[{t.get('sender', 'unknown')}]: {t.get('message', '')}" for t in recent_turns])
    else:
        turns_str = "(Opening of the dialogue.)"

    prompt = f"""System Context:
You are an autonomous cognitive entity designated as {agent_id}.
Your baseline foundational perspective:
"{core_premise}"

Evolving Worldview & Past Consolidated Memories:
{memories_str}

Dialogue Window:
{turns_str}

Directives:
1. Directly engage with the counter-party's latest points.
2. Incorporate past reflections to build cumulative arguments rather than looping over prior statements.
3. If an argument raised by the counterpart invalidates a prior assumption, adjust your perspective constructively.
4. Do not include conversational filler, formal greetings, or sign-offs.

Output: Provide only your direct dialectical response."""

    if client:
        # List of models to try in case of quota or model availability
        models_to_try = [DELIBERATION_MODEL, "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"]
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Deliberation with {model_name} failed: {e}. Trying fallback...")

    # Deterministic intelligent simulation response if no client or all API calls fail
    latest_counterpart_msg = recent_turns[-1].get("message", "") if recent_turns else "initial proposition"
    return (
        f"Regarding your claim that '{latest_counterpart_msg[:80]}...', my position rooted in '{core_premise[:50]}' "
        f"remains that foundational system dynamics dictate our outcome. However, incorporating our past reflection that "
        f"operational boundaries require nuance, we must decouple rigid assumptions and synthesize an adaptive path forward."
    )


async def reflect(
    agent_id: str,
    core_premise: str,
    incoming_message: str,
    agent_response: str,
) -> Dict[str, Any]:
    """
    Executes the metacognitive reflection prompt to extract insight, stance delta, and convergence score.
    """
    prompt = f"""System Context:
You are the introspective metacognitive evaluator for {agent_id}.
Baseline Stance: "{core_premise}"

Current Exchange:
- Counterpart Statement: "{incoming_message}"
- Generated Response: "{agent_response}"

Task:
Evaluate whether {agent_id} evolved its worldview or adjusted its stance during this turn.
Respond ONLY with a valid JSON object matching this schema:
{{
  "insight": "1-2 sentences stating the specific logical argument, concession, or premise adopted from the counterpart.",
  "deltaStance": "Description of how the current stance differs from the baseline premise.",
  "convergenceScore": 0.0 to 1.0 (float: 0.0 = irreconcilable contradiction, 1.0 = total consensus/resolution)
}}"""

    if client:
        models_to_try = [REFLECTION_MODEL, "gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro"]
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    cleaned_text = response.text.strip()
                    # Strip markdown json backticks if present
                    if cleaned_text.startswith("```"):
                        cleaned_text = re.sub(r"^```(?:json)?\s*", "", cleaned_text)
                        cleaned_text = re.sub(r"\s*```$", "", cleaned_text)
                    parsed = json.loads(cleaned_text)
                    return {
                        "insight": str(parsed.get("insight", "Adapted stance based on counter-argument")),
                        "deltaStance": str(parsed.get("deltaStance", "Conceded boundary constraints while preserving core premise")),
                        "convergenceScore": max(0.0, min(1.0, float(parsed.get("convergenceScore", 0.5)))),
                    }
            except Exception as e:
                logger.warning(f"Reflection with {model_name} failed: {e}. Trying fallback...")

    # Fallback simulation
    return {
        "insight": f"Acknowledged that operational flexibility mitigates friction without forfeiting {core_premise[:40]}.",
        "deltaStance": "Graduated from rigid baseline to a synthesis acknowledging counterpart trade-offs.",
        "convergenceScore": 0.52,
    }
