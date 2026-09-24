"""Draw every Deep End icon and splash image with nothing but the standard library.

A life ring floating at the waterline over water that darkens with depth, the same
motif as the depth slider's knob. Run from the repo root:

    python tools/make_icons.py            # web icons only (fast)
    python tools/make_icons.py --store    # also the 1024 store icon and the splash screen

Store images are RGB with no transparency: Apple rejects an App Store icon with alpha.
"""
import math
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "docs" / "icons"
STORE = ROOT / "assets"   # read by `npx capacitor-assets generate`

TOP = (0x1E, 0x5A, 0x63)      # surface band above the waterline
DEPTHS = [(0x12, 0x3F, 0x48), (0x10, 0x33, 0x4F), (0x0D, 0x27, 0x48), (0x0A, 0x1B, 0x3A), (0x05, 0x0B, 0x1F)]
WHITE = (0xFF, 0xFF, 0xFF)
RED = (0xFF, 0x5A, 0x4E)
AQUA = (0x6F, 0xD6, 0xD0)


def mix(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)


def water(t):
    t = max(0.0, min(1.0, t)) * (len(DEPTHS) - 1)
    i = min(int(t), len(DEPTHS) - 2)
    return mix(DEPTHS[i], DEPTHS[i + 1], t - i)


def draw(size, ring_scale=1.0):
    s = size
    cx = cy = s / 2
    r_out, r_in = s * 0.29 * ring_scale, s * 0.155 * ring_scale
    wl = s * 0.5
    amp = s * 0.018 * max(ring_scale, 0.5)
    crest_w = max(1.0, s * 0.006 * max(ring_scale, 0.5))
    waves = [wl + math.sin((x + 0.5) / s * math.pi * 3) * amp for x in range(s)]
    rows = []
    for y in range(s):
        py = y + 0.5
        row = bytearray([0])
        in_ring_band = abs(py - cy) <= r_out + 1
        for x in range(s):
            px, wave = x + 0.5, waves[x]
            under = max(0.0, min(1.0, py - wave + 0.5))
            col = mix(TOP, water((py - wave) / (s - wave) if py > wave else 0), under)
            crest = 1 - abs(py - wave) / crest_w
            if crest > 0:
                col = mix(col, AQUA, crest * 0.8)
            if in_ring_band and abs(px - cx) <= r_out + 1:
                # coverage from the distance to both edges keeps the ring smooth without supersampling
                d = math.hypot(px - cx, py - cy)
                cov = max(0.0, min(1.0, r_out - d + 0.5)) * max(0.0, min(1.0, d - r_in + 0.5))
                if cov > 0:
                    ang = (math.degrees(math.atan2(py - cy, px - cx)) + 405) % 360
                    ring = WHITE if int(ang // 90) % 2 == 0 else RED
                    if py > wave:   # the half under water takes on its colour
                        ring = mix(ring, DEPTHS[1], 0.28)
                    col = mix(col, ring, cov)
            row += bytes((int(col[0] + .5), int(col[1] + .5), int(col[2] + .5)))
        rows.append(bytes(row))
    return png(s, s, b"".join(rows))


def png(w, h, raw):
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))   # colour type 2 = RGB, no alpha
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))


SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#123F48"/><stop offset="1" stop-color="#050B1F"/></linearGradient></defs>
<rect width="64" height="64" rx="14" fill="#1E5A63"/>
<path d="M0 32 Q16 28 32 32 T64 32 V50 A14 14 0 0 1 50 64 H14 A14 14 0 0 1 0 50Z" fill="url(#w)"/>
<circle cx="32" cy="32" r="14" fill="none" stroke="#fff" stroke-width="8.5"/>
<circle cx="32" cy="32" r="14" fill="none" stroke="#FF5A4E" stroke-width="8.5" stroke-dasharray="10.996 10.996" transform="rotate(-45 32 32)"/>
</svg>
"""


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    # Maskable icons get cropped to a circle by Android, so the ring shrinks into the safe zone.
    for name, size, scale in [("icon-192.png", 192, 1.0), ("icon-512.png", 512, 1.0),
                              ("icon-maskable-512.png", 512, 0.8), ("apple-touch-icon.png", 180, 1.0)]:
        write(WEB / name, draw(size, scale))
    (WEB / "icon.svg").write_text(SVG, encoding="utf-8")
    if "--store" in sys.argv:
        write(STORE / "icon-only.png", draw(1024))
        write(STORE / "icon-foreground.png", draw(1024, 0.7))   # Android adaptive icon
        write(STORE / "icon-background.png", draw(1024, 0.0))
        splash = draw(2732, 0.32)                                 # takes a minute or two
        write(STORE / "splash.png", splash)
        write(STORE / "splash-dark.png", splash)
