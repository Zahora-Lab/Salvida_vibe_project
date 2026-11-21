import logging
import threading
import time

from fastapi import APIRouter, HTTPException, Response
from db.supabase_client import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter()

# In-process cache (per worker). The KPIs change slowly, so a short TTL avoids
# hitting the database on every landing page load.
CACHE_TTL_SECONDS = 300

_cache_lock = threading.Lock()
_cached_value: dict[str, int] | None = None
_cached_at: float = 0.0


def _load_from_view() -> dict[str, int]:
    """Single query against the `global_kpis` view (migration 009)."""
    supabase = get_supabase()
    resp = supabase.table("global_kpis").select("*").limit(1).execute()
    rows = resp.data or []
    if not rows:
        raise RuntimeError("global_kpis view returned no rows")
    row = rows[0]
    return {
        "totalServices": int(row.get("total_services") or 0),
        "totalUsers": int(row.get("total_users") or 0),
        "assistancePoints": int(row.get("assistance_points") or 0),
    }


def _load_from_counts() -> dict[str, int]:
    """Fallback: three head-only counts (no rows are downloaded)."""
    supabase = get_supabase()

    # Total services = all bookings ever recorded
    services_resp = (
        supabase.table("bookings").select("id", count="exact", head=True).execute()
    )

    # Total users = active profiles in the system
    users_resp = (
        supabase.table("profiles")
        .select("id", count="exact", head=True)
        .eq("is_active", True)
        .execute()
    )

    # Assistance points = validated addresses
    points_resp = (
        supabase.table("addresses")
        .select("id", count="exact", head=True)
        .eq("validation_status", "validated")
        .execute()
    )

    return {
        "totalServices": services_resp.count or 0,
        "totalUsers": users_resp.count or 0,
        "assistancePoints": points_resp.count or 0,
    }


def _load_kpis() -> dict[str, int]:
    try:
        return _load_from_view()
    except Exception as exc:
        logger.warning(
            "global_kpis view unavailable, falling back to counts: %s", exc
        )
        return _load_from_counts()


@router.get("")
def get_global_kpis(response: Response):
    """
    Public endpoint – no authentication required.
    Returns aggregated KPIs shown on the landing page.
    """
    global _cached_value, _cached_at

    # Never let the browser / service worker cache this: the landing page uses
    # it to confirm that the backend is up before enabling login.
    response.headers["Cache-Control"] = "no-store"

    with _cache_lock:
        now = time.monotonic()
        if _cached_value is not None and now - _cached_at < CACHE_TTL_SECONDS:
            return dict(_cached_value)

        try:
            value = _load_kpis()
        except Exception as exc:
            if _cached_value is not None:
                logger.warning("Could not refresh global KPIs, serving stale: %s", exc)
                return dict(_cached_value)
            logger.error("Could not load global KPIs: %s", exc)
            raise HTTPException(
                status_code=503, detail="KPIs temporarily unavailable"
            ) from exc

        _cached_value = value
        _cached_at = time.monotonic()
        return dict(value)
