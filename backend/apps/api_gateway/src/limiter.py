import os
from slowapi import Limiter
from slowapi.util import get_remote_address

from modules.core.config.settings import settings

limiter = Limiter(key_func=get_remote_address, storage_uri=settings.db.redis_url, default_limits=[])
