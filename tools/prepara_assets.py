"""Prepara gli asset del sito a partire da _estratti/ (eseguire con: python -I tools/prepara_assets.py)."""
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_estratti"
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)


def logo_nome():
    s = (SRC / "nome_raw.svg").read_text(encoding="utf-8")
    defs = re.findall(r'<path id="font_3_\d+"[^>]*/>', s)
    uses = [u for u in re.findall(r"<use [^>]*/>", s) if "#font_3_" in u and ",50)" in u]
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        'viewBox="10 8 186 60" fill="currentColor" role="img" aria-label="Elisa e Davide">\n<defs>\n'
        + "\n".join(defs)
        + "\n</defs>\n"
        + "\n".join(uses)
        + "\n</svg>\n"
    )
    (OUT / "nome-elisa-davide.svg").write_text(svg, encoding="utf-8")


def webp(img, name, max_w, q=82, lossless=False):
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    img.save(OUT / name, "WEBP", quality=q, lossless=lossless, method=6)
    print(name, img.size, (OUT / name).stat().st_size // 1024, "KB")


def trim(img, pad=8):
    box = img.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    box = (max(box[0] - pad, 0), max(box[1] - pad, 0), min(box[2] + pad, img.width), min(box[3] + pad, img.height))
    return img.crop(box)


def foto():
    strip = Image.open(SRC / "p1_img80_760x2481.jpg").convert("RGB")
    # riquadri delle tre foto nella striscia (misurati a occhio, poi verificati)
    boxes = [(78, 170, 676, 810), (78, 890, 676, 1530), (78, 1602, 676, 2212)]
    for i, b in enumerate(boxes, 1):
        webp(strip.crop(b), f"foto-{i}.webp", 760, q=86)


def villa():
    tag = Image.open(SRC / "p1_img89_1182x2481.jpg").convert("RGB")
    webp(tag.crop((130, 600, 1060, 1060)), "villa-mattioli.webp", 930, q=88)


def png_trasparenti():
    for src, name, w in [
        ("p1_img86_2042x3060.png", "calla.webp", 900),
        ("p1_img87_1250x1250.png", "fiocco.webp", 900),
        ("p1_img78_5616x3744.png", "nastro.webp", 1400),
        ("p1_img85_1142x1378.png", "busta.webp", 1000),
        ("p1_img82_314x314.png", "occhiello.webp", 314),
    ]:
        im = trim(Image.open(SRC / src).convert("RGBA"))
        webp(im, name, w, q=88)


if __name__ == "__main__":
    logo_nome()
    foto()
    villa()
    png_trasparenti()
