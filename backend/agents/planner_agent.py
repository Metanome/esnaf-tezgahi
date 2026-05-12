from prompts import PLANNER_REASONING_PROMPT
from services.gemini_service import generate_text


def synthesize_reasoning(context: str, lang: str = "en") -> str:
    """
    Given a plain-text context summary of what the agent did,
    generate a human-readable reasoning paragraph.
    """
    language_instruction = (
        "Respond entirely in Turkish (Türkçe)." if lang == "tr" else "Respond in English."
    )
    prompt = PLANNER_REASONING_PROMPT.format(context=context, language_instruction=language_instruction)
    return generate_text(prompt)
