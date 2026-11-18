#!/usr/bin/env python3
"""Procedural 喵喵谷 app icon. Game palette, INK outline #241a2e.
Drawn by code only — no image-generation models.

Orange tabby cat: tall sharp triangular ears with pink inners, a narrower
face (no hamster cheeks), an M forehead mark, amber eyes with a vertical
slit pupil, a pink triangle nose, a 'w' mouth, and three long whiskers
per side that sit outside the face so they stay visible at 60px.
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

    def fill_tri(ax, ay, bx, by, cx, cy, color_fn):
        """Filled triangle, inclusive."""
        xs = [ax, bx, cx]; ys = [ay, by, cy]
        for y in range(int(min(ys)), int(max(ys)) + 1):
            for x in range(int(min(xs)), int(max(xs)) + 1):
                # barycentric
                den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
                if den == 0:
                    continue
                w1 = ((by - cy) * (x + 0.5 - cx) + (cx - bx) * (y + 0.5 - cy)) / den
                w2 = ((cy - ay) * (x + 0.5 - cx) + (ax - cx) * (y + 0.5 - cy)) / den
                w3 = 1 - w1 - w2
                if w1 >= -0.02 and w2 >= -0.02 and w3 >= -0.02:
                    setp(x, y, color_fn(x, y) if callable(color_fn) else color_fn)

    # sky + grass (keep simple; ears use the top of the canvas)
    for y in range(24):
        for x in range(N):
            px[y][x] = 'BL1' if y == 0 else 'BL2'
    for y in range(24, N):
        for x in range(N):
            if y == 24:
                px[y][x] = 'GR1'
            elif (x + y * 2) % 7 == 0:
                px[y][x] = 'GR1'
            elif (x * 3 + y) % 11 == 0:
                px[y][x] = 'GR3'
            else:
                px[y][x] = 'GR2'

    def line(x0, y0, x1, y1, c, thick=1):
        x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            setp(x0, y0, c)
            if thick >= 2:
                setp(x0, y0 + 1, c)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy; x0 += sx
            if e2 <= dx:
                err += dx; y0 += sy

    # ---- tall, sharp, UPRIGHT triangular ears (on top of the head, not splayed) ----
    # left ear tip (9,0); right tip (22,0). Pink inner, same orange family.
    fill_tri(9, 0, 6, 11, 13, 11, 'ORNG')
    fill_tri(9, 2, 8, 10, 12, 10, 'LPNK')
    setp(9, 0, 'ORNG'); setp(8, 1, 'ORNG'); setp(9, 1, 'ORNG'); setp(10, 1, 'ORNG')
    setp(6, 10, 'WD1'); setp(6, 11, 'WD1')
    fill_tri(22, 0, 18, 11, 25, 11, 'ORNG')
    fill_tri(22, 2, 19, 10, 23, 10, 'PINK')
    setp(22, 0, 'ORNG'); setp(21, 1, 'ORNG'); setp(22, 1, 'ORNG'); setp(23, 1, 'WD2')
    setp(25, 10, 'WD1'); setp(25, 11, 'WD1')

    # ---- narrower, slightly oval head (no puffed cheeks) ----
    def head_color(u, v):
        light = -u * 0.45 - v * 0.6
        # pale muzzle, modest, not a wide bulge
        if v > 0.28 and abs(u) < 0.38:
            return 'WD3'
        if light > 0.45:
            return 'WD3'
        if light > -0.15:
            return 'ORNG'
        return 'WD2'

    # narrower than earlier icons (was rx~11.6). jaw is tighter.
    fill_ell(16.0, 18.2, 8.7, 9.6, head_color)

    # clean tabby M on the forehead
    #  #     #
    # # #   # #
    #    # #    #
    for x, y in [
        (13, 11), (19, 11),
        (13, 12), (15, 12), (17, 12), (19, 12),
        (14, 13), (16, 13), (18, 13),
        (16, 14),
    ]:
        setp(x, y, 'WD1')

    # cheek tabby stripes, inset (do not widen the silhouette)
    setp(9, 20, 'WD1'); setp(10, 21, 'WD1')
    setp(22, 20, 'WD1'); setp(21, 21, 'WD1')

    # ---- big amber eyes with vertical slit pupils + highlights ----
    def paint_eye(ex, ey):
        # rounded 5x5 eye: ink lid, amber iris, vertical slit, highlight
        fill_rect(ex, ey + 1, 5, 4, 'INK')
        setp(ex + 1, ey, 'INK'); setp(ex + 2, ey, 'INK'); setp(ex + 3, ey, 'INK')
        setp(ex, ey + 5, 'INK'); setp(ex + 4, ey + 5, 'INK')
        fill_rect(ex + 1, ey + 1, 3, 3, 'GOLD')
        setp(ex + 1, ey + 1, 'ORNG'); setp(ex + 3, ey + 3, 'ORNG')
        setp(ex + 2, ey + 1, 'INK')
        setp(ex + 2, ey + 2, 'INK')
        setp(ex + 2, ey + 3, 'INK')
        setp(ex + 1, ey, 'WHITE')
        setp(ex, ey + 1, 'WHITE')

    paint_eye(8, 14)
    paint_eye(19, 14)

    # ---- pink triangle nose + 'w' mouth ----
    setp(15, 20, 'PINK'); setp(16, 20, 'PINK')
    setp(14, 21, 'PINK'); setp(15, 21, 'PINK'); setp(16, 21, 'PINK'); setp(17, 21, 'PINK')
    setp(15, 22, 'PINK'); setp(16, 22, 'WD0')
    # w
    setp(13, 23, 'WD0'); setp(18, 23, 'WD0')
    setp(14, 24, 'WD0'); setp(15, 23, 'WD0'); setp(16, 24, 'WD0'); setp(17, 23, 'WD0')

    def is_bg(c, x, y):
        return c in ('BL1', 'BL2', 'GR1', 'GR2', 'GR3')

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

    # Long continuous whiskers AFTER the outline, 2px thick so they hold up at 60px.
    # They start on the cheek and run clearly outside the face.
    line(7, 19, 0, 16, 'INK', 2)
    line(7, 21, 0, 21, 'INK', 2)
    line(7, 23, 0, 26, 'INK', 2)
    line(24, 19, 31, 16, 'INK', 2)
    line(24, 21, 31, 21, 'INK', 2)
    line(24, 23, 31, 26, 'INK', 2)

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
    base.resize((60, 60), Image.NEAREST).save(preview / 'icon_60.png')
    scale_exact(base, 2).save(preview / 'icon_64.png')
    scale_exact(base, 12).save(preview / 'icon_zoom.png')
    print('wrote', out, 'and previews in', preview)

if __name__ == '__main__':
    main()
