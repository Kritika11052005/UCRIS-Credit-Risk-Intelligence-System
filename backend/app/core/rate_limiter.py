import asyncio
import time
from collections import deque
from fastapi import HTTPException


class GeminiRateLimiter:
    """
    Token bucket rate limiter for Gemini API calls.

    Gemini 2.5 Flash free tier limits:
    - 10 requests per minute (RPM)
    - 250,000 tokens per minute (TPM)
    - 500 requests per day (RPD)

    We stay safely under by limiting to:
    - 8 requests per minute
    - 400 requests per day
    """

    def __init__(
        self,
        rpm: int = 8,
        rpd: int = 400,
    ):
        self.rpm = rpm
        self.rpd = rpd

        # Sliding window queues — store timestamps of recent calls
        self._minute_calls: deque = deque()
        self._day_calls:    deque = deque()
        self._lock = asyncio.Lock()

    def _clean_window(self, queue: deque, window_seconds: int):
        """Remove timestamps older than the window."""
        cutoff = time.time() - window_seconds
        while queue and queue[0] < cutoff:
            queue.popleft()

    async def acquire(self):
        """
        Check rate limits before each Gemini call.
        Raises HTTP 429 if limits are exceeded.
        """
        async with self._lock:
            now = time.time()

            # Clean old timestamps
            self._clean_window(self._minute_calls, 60)
            self._clean_window(self._day_calls,    86400)

            # Check per-minute limit
            if len(self._minute_calls) >= self.rpm:
                oldest    = self._minute_calls[0]
                wait_secs = 60 - (now - oldest)
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error":       "Rate limit exceeded",
                        "limit":       f"{self.rpm} requests per minute",
                        "retry_after": f"{wait_secs:.1f} seconds",
                    }
                )

            # Check per-day limit
            if len(self._day_calls) >= self.rpd:
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Daily rate limit exceeded",
                        "limit": f"{self.rpd} requests per day",
                        "retry_after": "Try again tomorrow",
                    }
                )

            # Record this call
            self._minute_calls.append(now)
            self._day_calls.append(now)

    @property
    def status(self) -> dict:
        """Current usage stats — useful for monitoring."""
        self._clean_window(self._minute_calls, 60)
        self._clean_window(self._day_calls,    86400)
        return {
            "requests_this_minute": len(self._minute_calls),
            "requests_today":       len(self._day_calls),
            "rpm_limit":            self.rpm,
            "rpd_limit":            self.rpd,
            "rpm_remaining":        self.rpm - len(self._minute_calls),
            "rpd_remaining":        self.rpd - len(self._day_calls),
        }


# ── Single shared instance used across the app ────────────────────────────────
gemini_limiter = GeminiRateLimiter(rpm=8, rpd=400)