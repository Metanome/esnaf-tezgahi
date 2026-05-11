from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from services.event_service import subscribe

router = APIRouter(prefix="/api/events", tags=["events"])

@router.get("/stream")
async def event_stream():
    """
    Server-Sent Events (SSE) endpoint.
    Clients connect here to receive real-time invalidation broadcasts.
    """
    return StreamingResponse(
        subscribe(),
        media_type="text/event-stream"
    )
