import os
from slowapi import Limiter
from slowapi.util import get_remote_address

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
_redis_url = f"redis://{REDIS_HOST}:{REDIS_PORT}"

limiter = Limiter(key_func=get_remote_address, storage_uri=_redis_url, default_limits=[])
