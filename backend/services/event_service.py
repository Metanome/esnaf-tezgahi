import asyncio

_loop: asyncio.AbstractEventLoop | None = None
_queues: set[asyncio.Queue] = set()

def set_event_loop(loop: asyncio.AbstractEventLoop):
    """Capture the main event loop to allow thread-safe broadcasting."""
    global _loop
    _loop = loop

async def subscribe():
    """Generator for SSE streams."""
    q = asyncio.Queue()
    _queues.add(q)
    try:
        while True:
            msg = await q.get()
            yield f"data: {msg}\n\n"
    finally:
        _queues.remove(q)

def notify_clients(msg: str = "update"):
    """
    Broadcast a message to all connected SSE clients.
    Safe to call from synchronous threadpools (e.g., BackgroundTasks).
    """
    if _loop is None:
        return
    for q in _queues:
        try:
            _loop.call_soon_threadsafe(q.put_nowait, msg)
        except RuntimeError:
            pass
