#!/usr/bin/env python3
"""Procedural 喵喵谷 app icons. Fixed 32-colour game palette, INK outline #241a2e.
Drawn by code only — no image-generation models."""
from pathlib import Path
from PIL import Image

PAL = {
    'INK':  (0x24, 0x1a, 0x2e),
    'DEEP': (0x3b, 0x2a, 0x40),
    'WD1':  (0x8a, 0x52, 0x36),
    'WD2':  (0xb9, 0x77, 0x4a),
    'WD3':  (0xe0, 0xa8, 0x6a),
    'WD0':  (0x5a, 0x3b, 0x3c),
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

    for y in range(23):
        for x in range(N):
            px[y][x] = 'BL1' if y == 0 else 'BL2'
    for y in range(23, N):
        for x in range(N):
            if y == 23:
                px[y][x] = 'GR1'
            elif (x + y * 2) % 7 == 0:
                px[y][x] = 'GR1'
            elif (x * 3 + y) % 11 == 0:
                px[y][x] = 'GR3'
            else:
                px[y][x] = 'GR2'

    fill_ell(6.0, 6.0, 3.2, 3.2, lambda u, v: 'WARM' if u * u + v * v < 0.28 else 'GOLD')
    fill_ell(24.5, 6.5, 3.6, 1.7, 'WARM')
    fill_ell(27.8, 7.5, 2.6, 1.4, 'WARM')
    setp(22, 7, 'WARM'); setp(21, 7, 'WARM')

    left_ear = {
        (8, 2): 'ORNG', (9, 2): 'ORNG',
        (7, 3): 'WD2', (8, 3): 'ORNG', (9, 3): 'ORNG', (10, 3): 'ORNG',
        (7, 4): 'WD2', (8, 4): 'ORNG', (9, 4): 'LPNK', (10, 4): 'ORNG', (11, 4): 'ORNG',
        (7, 5): 'WD2', (8, 5): 'ORNG', (9, 5): 'LPNK', (10, 5): 'ORNG', (11, 5): 'ORNG',
        (8, 6): 'ORNG', (9, 6): 'ORNG', (10, 6): 'ORNG', (11, 6): 'ORNG',
    }
    right_ear = {
        (22, 2): 'WD2', (23, 2): 'WD2',
        (21, 3): 'WD2', (22, 3): 'WD2', (23, 3): 'WD1', (24, 3): 'WD1',
        (20, 4): 'WD2', (21, 4): 'WD2', (22, 4): 'PINK', (23, 4): 'WD2', (24, 4): 'WD1',
        (20, 5): 'WD2', (21, 5): 'WD2', (22, 5): 'PINK', (23, 5): 'WD2', (24, 5): 'WD1',
        (20, 6): 'WD2', (21, 6): 'WD2', (22, 6): 'WD2', (23, 6): 'WD1',
    }
    for (x, y), c in left_ear.items():
        setp(x, y, c)
    for (x, y), c in right_ear.items():
        setp(x, y, c)

    def head_color(u, v):
        light = -u * 0.55 - v * 0.70
        if v > 0.28 and abs(u) < 0.42:
            return 'WD3'
        if light > 0.40:
            return 'WD3'
        if light > -0.20:
            return 'ORNG'
        return 'WD2'

    fill_ell(16.0, 16.2, 9.4, 8.6, head_color)
    setp(14, 9, 'WD3'); setp(15, 9, 'WD3'); setp(15, 8, 'WD3')
    setp(8, 18, 'LPNK'); setp(9, 19, 'LPNK')
    setp(23, 18, 'PINK'); setp(22, 19, 'LPNK')
    fill_rect(10, 14, 3, 4, 'INK'); setp(10, 14, 'WHITE'); setp(11, 15, 'DEEP')
    fill_rect(19, 14, 3, 4, 'INK'); setp(19, 14, 'WHITE'); setp(20, 15, 'DEEP')
    setp(15, 18, 'PINK'); setp(16, 18, 'PINK'); setp(15, 19, 'PINK')
    setp(14, 20, 'WD0'); setp(17, 20, 'WD0'); setp(15, 21, 'WD0'); setp(16, 21, 'WD0')
    setp(6, 17, 'INK'); setp(7, 17, 'INK'); setp(6, 19, 'INK')
    setp(25, 17, 'INK'); setp(26, 17, 'INK'); setp(25, 19, 'INK')
    setp(14, 24, 'WD1'); setp(15, 24, 'WD1'); setp(16, 24, 'WD1'); setp(17, 24, 'WD1')
    fill_rect(14, 25, 4, 3, 'GOLD')
    setp(17, 25, 'ORNG'); setp(17, 26, 'ORNG'); setp(14, 26, 'ORNG')
    setp(15, 26, 'WARM'); setp(16, 27, 'ORNG'); setp(15, 28, 'GOLD')

    def is_bg(c, x, y):
        if c in ('BL1', 'BL2', 'GR1', 'GR2', 'GR3'):
            return True
        # sun + clouds (the bell is GOLD/WARM at y >= 24)
        if c in ('GOLD', 'WARM') and y < 23:
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
    out = Path(__file__).resolve().parents[1] / 'icons'
    out.mkdir(parents=True, exist_ok=True)
    base = paint()
    scale_exact(base, 6).save(out / 'icon-192.png')
    scale_exact(base, 16).save(out / 'icon-512.png')
    scale_padded(base, 180).save(out / 'apple-touch-icon.png')
    print('wrote', out)

if __name__ == '__main__':
    main()
