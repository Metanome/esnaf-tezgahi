import json
import re
import time
from functools import lru_cache

from google import genai
from google.genai import types
from google.genai.errors import ServerError

from config import get_settings


def _with_retry(fn, *args, max_retries: int = 2, **kwargs):
    """Call fn(*args, **kwargs), retrying up to max_retries times on 503 overload."""
    for attempt in range(max_retries + 1):
        try:
            return fn(*args, **kwargs)
        except ServerError as exc:
            if exc.status_code == 503 and attempt < max_retries:
                time.sleep(2 ** attempt)  # 1 s, then 2 s
                continue
            raise


@lru_cache(maxsize=1)
def _get_client() -> genai.Client:
    return genai.Client(api_key=get_settings().gemini_api_key)


def _get_model() -> str:
    return get_settings().default_model


def _parse_json_response(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in Gemini response: {text!r}")
    return json.loads(match.group())


def generate_text(prompt: str, model: str | None = None) -> str:
    response = _with_retry(
        _get_client().models.generate_content,
        model=model or _get_model(),
        contents=prompt,
    )
    return response.text


def generate_json(prompt: str, model: str | None = None) -> dict:
    return _parse_json_response(generate_text(prompt, model))


def generate_from_image(image_bytes: bytes, mime_type: str, prompt: str, model: str | None = None) -> dict:
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    response = _with_retry(
        _get_client().models.generate_content,
        model=model or _get_model(),
        contents=[image_part, prompt],
    )
    return _parse_json_response(response.text)


def clear_client_cache() -> None:
    _get_client.cache_clear()


def generate_from_audio(audio_bytes: bytes, mime_type: str, prompt: str, model: str | None = None) -> dict:
    audio_part = types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)
    response = _with_retry(
        _get_client().models.generate_content,
        model=model or _get_model(),
        contents=[audio_part, prompt],
    )
    return _parse_json_response(response.text)
