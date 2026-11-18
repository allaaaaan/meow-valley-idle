#!/usr/bin/env python3
"""Procedural 喵喵谷 app icons. Fixed 32-colour game palette, INK outline #241a2e.
Drawn by code only — no image-generation models.

The face is a broad, round cat: short wide triangular ears, big highlighted
eyes, a pink triangle nose, a 'w' mouth, and clear whiskers. Tuned to read
as a cat at 60px, not a rabbit or mouse.
"""
from pathlib import Path
from PIL import Image

PAL = {
    'INK':  (0x24, 0x1a, 0x2e),
    'DEEP': (0x3b, 0x2a, 0x40),
    'WD0':  (0x5a, 0x3b, 0x3c),
    'WD1':  (0x8a, 0x52, 0x36),
    'WD2':  (0xb9, 0x77, 0x4a),
    'WD3':  (0xe0, 0xa8, 0x6a),
    'WARM': (0xff, 0xf4, 0xdc),
    'BL1':  (0x5f, 0xa3, 0xc8),
    'BL2':  (0xa9, 0xe0, 0xf0),
    'GR1':  (0x3b, 0x7a, 0x45),
    'GR2':  (0x69, 0xad, 0x4f),
    'GR3':  (0xa6, 0xd6, 0x5a),
    'GOLD': (0xff, 0xd3, 0x4d),
    'ORNG': (0xff, 0xa5, 0x31),
    'PINK': (0xe8, 0x57, 0x7e),
    'LPNK': (0xff, 0xb3, 0xc8),
    'WHITE':(0xff, 0xff, 0xff),
}

N = 32

def paint():
    px = [['BL2' for _ in range(N)] for _ in range(N)]

    def setp(x, y, c):
        if 0 <= x < N and 0 <= y < N:
            px[y][x] = c

    def fill_rect(x, y, w, h, c):
        for j in range(h):
            for i in range(w):
                setp(x + i, y + j, c)

    def fill_ell(cx, cy, rx, ry, color_fn):
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - rx - 1), int(cx + rx + 2)):
                u = (x + 0.5 - cx) / rx
                v = (y + 0.5 - cy) / ry
                if u * u + v * v <= 1:
                    setp(x, y, color_fn(u, v) if callable(color_fn) else color_fn)

    # sky + grass
    for y in range(22):
        for x in range(N):
            px[y][x] = 'BL1' if y == 0 else 'BL2'
    for y in range(22, N):
        for x in range(N):
            if y == 22:
                px[y][x] = 'GR1'
            elif (x + y * 2) % 7 == 0:
                px[y][x] = 'GR1'
            elif (x * 3 + y) % 11 == 0:
                px[y][x] = 'GR3'
            else:
                px[y][x] = 'GR2'

    # small sun, top-left (game lighting)
    fill_ell(5.2, 5.0, 2.6, 2.6, lambda u, v: 'WARM' if u * u + v * v < 0.28 else 'GOLD')
    # tiny cloud, far right, away from the ears
    fill_ell(27.5, 6.0, 3.0, 1.4, 'WARM')
    fill_ell(29.0, 6.8, 2.0, 1.1, 'WARM')

    # ---- short, WIDE triangular ears (cat, not rabbit) ----
    # sit low on the head, broader than they are tall
    left_ear = {
        (8, 4): 'ORNG', (9, 4): 'ORNG',
        (7, 5): 'ORNG', (8, 5): 'ORNG', (9, 5): 'ORNG', (10, 5): 'ORNG',
        (6, 6): 'WD2', (7, 6): 'ORNG', (8, 6): 'ORNG', (9, 6): 'LPNK', (10, 6): 'ORNG', (11, 6): 'ORNG',
        (6, 7): 'WD2', (7, 7): 'ORNG', (8, 7): 'LPNK', (9, 7): 'LPNK', (10, 7): 'ORNG', (11, 7): 'ORNG', (12, 7): 'ORNG',
        (6, 8): 'WD2', (7, 8): 'ORNG', (8, 8): 'ORNG', (9, 8): 'ORNG', (10, 8): 'ORNG', (11, 8): 'ORNG',
    }
    right_ear = {
        (22, 4): 'WD2', (23, 4): 'WD1',
        (21, 5): 'WD2', (22, 5): 'WD2', (23, 5): 'WD2', (24, 5): 'WD1',
        (20, 6): 'WD2', (21, 6): 'WD2', (22, 6): 'PINK', (23, 6): 'WD2', (24, 6): 'WD1', (25, 6): 'WD1',
        (19, 7): 'WD2', (20, 7): 'WD2', (21, 7): 'WD2', (22, 7): 'PINK', (23, 7): 'PINK', (24, 7): 'WD2', (25, 7): 'WD1',
        (20, 8): 'WD2', (21, 8): 'WD2', (22, 8): 'WD2', (23, 8): 'WD2', (24, 8): 'WD1', (25, 8): 'WD1',
    }
    for (x, y), c in left_ear.items():
        setp(x, y, c)
    for (x, y), c in right_ear.items():
        setp(x, y, c)

    # ---- broad, round head (wider than tall) ----
    def head_color(u, v):
        light = -u * 0.5 - v * 0.65
        # pale muzzle
        if v > 0.22 and abs(u) < 0.48:
            return 'WD3'
        if light > 0.42:
            return 'WD3'
        if light > -0.18:
            return 'ORNG'
        return 'WD2'

    fill_ell(16.0, 17.2, 11.6, 10.2, head_color)
    # forehead tuft
    setp(15, 9, 'WD3'); setp(16, 9, 'WD3'); setp(15, 8, 'WD3')

    # blush
    setp(7, 19, 'LPNK'); setp(8, 20, 'LPNK'); setp(6, 20, 'LPNK')
    setp(24, 19, 'PINK'); setp(23, 20, 'LPNK'); setp(25, 20, 'PINK')

    # ---- big eyes with top-left highlights ----
    # 4x5 ink blocks, white spark, deep inner
    fill_rect(8, 13, 4, 5, 'INK')
    setp(8, 13, 'WHITE'); setp(9, 13, 'WHITE')
    setp(8, 14, 'WHITE')
    setp(10, 15, 'DEEP'); setp(10, 16, 'DEEP')
    fill_rect(20, 13, 4, 5, 'INK')
    setp(20, 13, 'WHITE'); setp(21, 13, 'WHITE')
    setp(20, 14, 'WHITE')
    setp(22, 15, 'DEEP'); setp(22, 16, 'DEEP')

    # ---- pink triangle nose ----
    setp(15, 19, 'PINK'); setp(16, 19, 'PINK')
    setp(14, 20, 'PINK'); setp(15, 20, 'PINK'); setp(16, 20, 'PINK'); setp(17, 20, 'PINK')
    setp(15, 21, 'PINK'); setp(16, 21, 'WD0')  # tiny shadow under the tip

    # ---- 'w' cat mouth ----
    #   #     #
    #  # # # #
    setp(13, 22, 'WD0'); setp(18, 22, 'WD0')
    setp(14, 23, 'WD0'); setp(15, 22, 'WD0'); setp(16, 23, 'WD0'); setp(17, 22, 'WD0')

    # small gold bell under the chin (app identity, doesn't hide the mouth)
    setp(14, 26, 'WD1'); setp(15, 26, 'WD1'); setp(16, 26, 'WD1'); setp(17, 26, 'WD1')
    fill_rect(14, 27, 4, 3, 'GOLD')
    setp(17, 27, 'ORNG'); setp(17, 28, 'ORNG'); setp(14, 28, 'ORNG')
    setp(15, 28, 'WARM'); setp(16, 29, 'ORNG'); setp(15, 30, 'GOLD')

    def is_bg(c, x, y):
        if c in ('BL1', 'BL2', 'GR1', 'GR2', 'GR3'):
            return True
        # sun + clouds (the bell is GOLD/WARM at y >= 26)
        if c in ('GOLD', 'WARM') and y < 14:
            return True
        return False

    outline = []
    for y in range(N):
        for x in range(N):
            if is_bg(px[y][x], x, y):
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < N and 0 <= yy < N and is_bg(px[yy][xx], xx, yy):
                    outline.append((xx, yy))
    for x, y in outline:
        setp(x, y, 'INK')

    # Whiskers AFTER the outline so they stay 1px lines (outlining them
    # made heavy black cheek blobs that read as a hamster / mouse).
    for x, y in [(2,18),(3,18),(4,19),(5,19),
                 (27,18),(28,18),(26,19),(25,19),
                 (1,21),(2,21),(3,21),(4,21),
                 (27,21),(28,21),(29,21),(30,21),
                 (2,24),(3,24),(4,23),(5,23),
                 (27,24),(28,24),(26,23),(25,23)]:
        setp(x, y, 'INK')

    im = Image.new('RGB', (N, N), PAL['BL2'])
    pix = im.load()
    for y in range(N):
        for x in range(N):
            pix[x, y] = PAL[px[y][x]]
    return im

def scale_exact(src, scale):
    return src.resize((src.width * scale, src.height * scale), Image.NEAREST)

def scale_padded(src, dest):
    scale = dest // src.width
    inner = src.resize((src.width * scale, src.height * scale), Image.NEAREST)
    canvas = Image.new('RGB', (dest, dest), PAL['BL2'])
    pix = canvas.load()
    sp = src.load()
    pad = (dest - inner.width) // 2
    for y in range(dest):
        for x in range(dest):
            if x < pad:
                sx = 0
            elif x >= pad + inner.width:
                sx = src.width - 1
            else:
                sx = (x - pad) // scale
            if y < pad:
                sy = 0
            elif y >= pad + inner.height:
                sy = src.height - 1
            else:
                sy = (y - pad) // scale
            if x < pad or x >= pad + inner.width or y < pad or y >= pad + inner.height:
                pix[x, y] = sp[sx, sy]
    canvas.paste(inner, (pad, pad))
    return canvas

def main():
    root = Path(__file__).resolve().parents[1]
    out = root / 'icons'
    out.mkdir(parents=True, exist_ok=True)
    preview = root / 'out'
    preview.mkdir(parents=True, exist_ok=True)
    base = paint()
    scale_exact(base, 6).save(out / 'icon-192.png')
    scale_exact(base, 16).save(out / 'icon-512.png')
    scale_padded(base, 180).save(out / 'apple-touch-icon.png')
    # review sizes: ~60px home-screen-ish, plus a zoomed preview
    base.resize((60, 60), Image.NEAREST).save(preview / 'icon_60.png')
    scale_exact(base, 12).save(preview / 'icon_zoom.png')
    print('wrote', out, 'and previews in', preview)

if __name__ == '__main__':
    main()
