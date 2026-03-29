#!/usr/bin/env python3
"""
節入り: Skyfield + DE421。1 日刻み・前向き黄経弧で target 包含を判定し二分。
"""
from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path

from skyfield.api import load

ROOT = Path(__file__).resolve().parents[2]
OUT_PATH = ROOT / "packages" / "sanmei-core" / "data" / "solar-terms" / "solar_terms.json"

TERM_IDS = [
    "lichun", "yushui", "jingzhe", "chunfen", "qingming", "guyu", "lixia", "xiaoman",
    "mangzhong", "xiazhi", "xiaoshu", "dashu", "liqiu", "chushu", "bailu", "qiufen",
    "hanlu", "shuangjiang", "lidong", "xiaoxue", "daxue", "dongzhi", "xiaohan", "dahan",
]
LONGITUDES = [
    315, 330, 345, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210,
    225, 240, 255, 270, 285, 300,
]


def lon_deg(earth, sun, t) -> float:
    e = earth.at(t).observe(sun).apparent()
    _lat, lon, _dist = e.ecliptic_latlon(epoch="date")
    return lon.degrees % 360.0


def forward_arc(prev_lon: float, next_lon: float) -> tuple[float, float]:
    a, b = prev_lon, next_lon
    if b < a:
        b += 360.0
    return a, b


def bisect_skyfield(ts, earth, sun, t_lo, t_hi, lon_lo: float, lon_hi_raw: float, target: float):
    """lon_lo → lon_hi_raw の 1 日区間（forward_arc 済み想定）で target に到達する瞬間。"""
    a, b = forward_arc(lon_lo, lon_hi_raw)
    tgt = target
    while tgt < a:
        tgt += 360.0
    if not (a <= tgt <= b):
        return None

    lo_tt = float(t_lo.tt)
    hi_tt = float(t_hi.tt)
    for _ in range(55):
        mid_tt = (lo_tt + hi_tt) / 2.0
        tm = ts.tt_jd(mid_tt)
        lm = lon_deg(earth, sun, tm)
        la, lb = forward_arc(lon_lo, lm)
        tmid = tgt
        while tmid < la:
            tmid += 360.0
        if abs(hi_tt - lo_tt) < 5e-11:
            break
        if tmid <= lb:
            hi_tt = mid_tt
        else:
            lo_tt = mid_tt
    t = ts.tt_jd((lo_tt + hi_tt) / 2.0)
    lon_at = lon_deg(earth, sun, t)
    diff = min(abs(lon_at - target), abs(lon_at + 360 - target), abs(lon_at - 360 - target))
    if diff > 0.05:
        return None
    return t


def to_utc_ms(t) -> int:
    u = t.utc_datetime().replace(tzinfo=dt.timezone.utc)
    return int(u.timestamp() * 1000)


def main():
    y0 = int(sys.argv[1]) if len(sys.argv) > 1 else 1900
    y1 = int(sys.argv[2]) if len(sys.argv) > 2 else 2100

    ts = load.timescale()
    eph = load("de421.bsp")
    earth, sun = eph["earth"], eph["sun"]

    prev_t = ts.utc(y0, 1, 1, 12, 0, 0)
    end = ts.utc(y1 + 1, 2, 1, 12, 0, 0)
    prev_lon = lon_deg(earth, sun, prev_t)
    hits: list[tuple[int, str, int]] = []
    next_t = ts.tt_jd(prev_t.tt + 1.0)

    while next_t.tt < end.tt:
        lon_raw = lon_deg(earth, sun, next_t)
        a, b = forward_arc(prev_lon, lon_raw)
        for term_id, tgt in zip(TERM_IDS, LONGITUDES):
            tgt = float(tgt)
            ta = tgt
            while ta < a:
                ta += 360.0
            if a <= ta <= b:
                x = bisect_skyfield(ts, earth, sun, prev_t, next_t, prev_lon, lon_raw, tgt)
                if x is not None:
                    hits.append((to_utc_ms(x), term_id, int(tgt)))
        prev_t, prev_lon, next_t = next_t, lon_raw, ts.tt_jd(next_t.tt + 1.0)

    hits.sort(key=lambda h: h[0])
    out = [{"termId": tid, "longitudeDeg": lo, "instantUtcMs": ms} for ms, tid, lo in hits]

    meta = {
        "ephemerisBundleId": "skyfield-de421-v1",
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "rangeStartYear": y0,
        "rangeEndYear": y1,
        "entryCount": len(out),
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        json.dumps({"meta": meta, "entries": out}, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    want = (y1 - y0 + 1) * 24
    print(f"OK {len(out)} entries (expect ~{want}) -> {OUT_PATH}", file=sys.stderr)


if __name__ == "__main__":
    main()
