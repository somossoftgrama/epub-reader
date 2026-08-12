import math, random
from PIL import Image, ImageDraw

random.seed(11)

def make_icon(size):
    img = Image.new("RGB", (size, size), (10, 10, 10))
    px = img.load()
    c = size / 2.0
    maxd = math.hypot(c, c)
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - c, y - c) / maxd
            base = 10 + int((1 - d) * 14)
            g = base + random.randint(-3, 3)
            px[x, y] = (g, g, g + 2)
    d = ImageDraw.Draw(img)

    GREEN = (34, 197, 94)      # #22C55E
    GREEN_HI = (74, 222, 128)  # #4ADE80

    s = size
    # Libro abierto: dos paginas (cuadrilateros) + lomo central
    lw = max(7, int(s * 0.05))

    # Pagina izquierda (inclinada) y derecha (inclinada), borde verde
    top_w = s * 0.28
    top_h = s * 0.20
    bot_w = s * 0.30
    bot_h = s * 0.34
    mid_y = s * 0.40   # punto donde "se abren" las paginas (arriba del libro)
    spine_top_y = s * 0.24
    spine_bot_y = s * 0.74
    cx = s * 0.50

    # Lado izquierdo del libro
    left_pts = [
        (cx - bot_w, s * 0.78),        # esquina inferior izq
        (cx - top_w, spine_top_y),     # esquina superior izq (borde del lomo)
        (cx, mid_y),                   # lomo superior
        (cx, s * 0.86),                # lomo inferior
    ]
    # Lado derecho
    right_pts = [
        (cx + top_w, spine_top_y),
        (cx + bot_w, s * 0.78),
        (cx, s * 0.86),
        (cx, mid_y),
    ]

    d.polygon(left_pts, outline=GREEN, width=lw)
    d.polygon(right_pts, outline=GREEN, width=lw)

    # Lineas de texto (simulan renglones) en cada pagina, verde claro
    tl = max(3, int(s * 0.018))
    # izquierda
    for i in range(3):
        y = s * 0.42 + i * s * 0.10
        d.line([(cx - bot_w + s*0.03, y), (cx - s*0.05, y)], fill=GREEN_HI, width=tl)
    # derecha
    for i in range(3):
        y = s * 0.42 + i * s * 0.10
        d.line([(cx + s*0.05, y), (cx + bot_w - s*0.03, y)], fill=GREEN_HI, width=tl)

    # Pequena linea horizontal del lomo (tapita superior)
    d.line([(cx - top_w, spine_top_y), (cx + top_w, spine_top_y)], fill=GREEN, width=lw)

    return img

for s in (512, 192):
    make_icon(s).save(f"C:/Users/Rafael/epub-reader/public/icon-{s}.png")
    print("wrote", s)
