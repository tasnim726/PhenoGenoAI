import time

from .metrics import METRICS


class RequestMetricsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        duration_ms = (time.perf_counter() - start) * 1000
        client_ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0]
        if not client_ip:
            client_ip = request.META.get("REMOTE_ADDR", "")
        METRICS.record(request.path, response.status_code, duration_ms, client_ip)
        return response
