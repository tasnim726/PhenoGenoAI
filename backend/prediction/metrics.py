from collections import deque
from dataclasses import dataclass, field
from datetime import timedelta
from threading import Lock
from typing import Deque, Dict, List, Tuple

from django.utils import timezone


@dataclass
class RequestMetrics:
    max_latency_samples: int = 500
    active_window: timedelta = timedelta(minutes=15)
    lock: Lock = field(default_factory=Lock)
    total_requests: int = 0
    success_requests: int = 0
    error_requests: int = 0
    requests_today: int = 0
    day: timezone.datetime.date = field(default_factory=lambda: timezone.now().date())
    export_count: int = 0
    predict_count: int = 0
    latencies_ms: Deque[float] = field(default_factory=lambda: deque(maxlen=500))
    recent_ips: Deque[Tuple[timezone.datetime, str]] = field(default_factory=deque)

    def record(self, path: str, status_code: int, duration_ms: float, ip: str) -> None:
        now = timezone.now()
        with self.lock:
            if now.date() != self.day:
                self._reset_daily(now)

            self.total_requests += 1
            self.requests_today += 1
            if status_code >= 500:
                self.error_requests += 1
            else:
                self.success_requests += 1

            if path.startswith("/api/predict/"):
                self.predict_count += 1
            if path.startswith("/api/export/"):
                self.export_count += 1

            self.latencies_ms.append(duration_ms)

            if ip:
                self.recent_ips.append((now, ip))
                self._prune_recent_ips(now)

    def snapshot(self) -> Dict[str, object]:
        now = timezone.now()
        with self.lock:
            self._prune_recent_ips(now)
            latencies = list(self.latencies_ms)
            avg_latency = _mean(latencies)
            p95_latency = _p95(latencies)
            success_rate = (
                (self.success_requests / self.total_requests) * 100
                if self.total_requests
                else 100.0
            )
            active_users = len({ip for _, ip in self.recent_ips})

            return {
                "avg_latency_ms": int(round(avg_latency)),
                "p95_latency_ms": int(round(p95_latency)),
                "success_rate": success_rate,
                "requests_today": self.requests_today,
                "active_users": active_users,
                "export_count": self.export_count,
                "predict_count": self.predict_count,
                "total_requests": self.total_requests,
            }

    def _reset_daily(self, now: timezone.datetime) -> None:
        self.day = now.date()
        self.requests_today = 0
        self.export_count = 0
        self.predict_count = 0

    def _prune_recent_ips(self, now: timezone.datetime) -> None:
        cutoff = now - self.active_window
        while self.recent_ips and self.recent_ips[0][0] < cutoff:
            self.recent_ips.popleft()


METRICS = RequestMetrics()


def _mean(values: List[float]) -> float:
    if not values:
        return 0.0
    return sum(values) / len(values)


def _p95(values: List[float]) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = int(round(0.95 * (len(ordered) - 1)))
    return ordered[index]
