"""Composite the 17 welcome layers in exact reference order, then diff vs screen.png."""
import sys
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "designs" / "welcome-real" / "assets"
TARGET = ROOT / "designs" / "screen.png"
OUT = ROOT / "designs" / "composite-check.png"
DIFF = ROOT / "designs" / "composite-diff.png"

GRADIENT = [(0, "#F6C6A8"), (26, "#F8D3B9"), (46, "#FBE0C9"), (66, "#FDECDD"), (84, "#FEF6ED"), (100, "#FFFBF6")]

# (asset, left%, top%, width%, height%) in paint order (back -> front)
LAYERS = [
    ("sun.png",                43.95,  4.79, 20.12, 16.21),
    ("hill-far-right.png",     51.95, 12.01, 47.33, 17.29),
    ("hill-far-left.png",       1.17, 20.02, 46.68,  9.57),
    ("school.png",              4.30, 30.18, 23.50, 31.45),
    ("trees-bush-right.png",   73.83, 30.37, 24.80, 34.77),
    ("tree-small-1.png",       30.08, 34.08, 10.94, 19.53),
    ("tree-small-2.png",       41.41, 36.04,  8.40, 16.99),
    ("hill-near-path.png",      1.76, 58.50, 49.02, 11.91),
    ("robot.png",              50.00, 33.50, 20.25, 40.23),
    ("book.png",               15.04, 69.43, 16.80, 15.62),
    ("globe.png",              34.51, 67.48,  7.88, 14.26),
    ("rocket.png",             72.66, 67.48,  8.40, 10.16),
    ("star.png",               83.27, 66.60,  6.18,  8.50),
    ("bell.png",               88.35, 67.09,  8.33, 17.48),
    ("hill-near-plain.png",     0.98, 78.03, 98.24, 19.73),
]


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def build_background(width: int, height: int) -> Image.Image:
    stops = [(pos / 100, hex_to_rgb(col)) for pos, col in GRADIENT]
    canvas = Image.new("RGB", (width, height))
    pixels = canvas.load()
    for y in range(height):
        ratio = y / max(1, height - 1) * 100
        upper = stops[0]
        lower = stops[-1]
        for index in range(len(stops) - 1):
            if stops[index][0] <= ratio <= stops[index + 1][0]:
                upper, lower = stops[index], stops[index + 1]
                break
        span = max(1e-6, lower[0] - upper[0])
        t = min(1.0, max(0.0, (ratio - upper[0]) / span))
        row = tuple(
            round(upper[1][ch] + (lower[1][ch] - upper[1][ch]) * t) for ch in range(3)
        )
        for x in range(width):
            pixels[x, y] = row
    return canvas


def main() -> int:
    target = Image.open(TARGET).convert("RGB")
    width, height = target.size

    canvas = build_background(width, height).convert("RGBA")
    for name, left, top, w, h in LAYERS:
        asset = REF / name
        if not asset.exists():
            print(f"MISSING {name}")
            return 1
        box = (
            round(left / 100 * width),
            round(top / 100 * height),
            round((left + w) / 100 * width),
            round((top + h) / 100 * height),
        )
        layer = Image.open(asset).convert("RGBA")
        layer = layer.resize((max(1, box[2] - box[0]), max(1, box[3] - box[1])), Image.LANCZOS)
        canvas.alpha_composite(layer, dest=(box[0], box[1]))

    composite = canvas.convert("RGB")
    composite.save(OUT)

    diff = ImageChops.difference(composite, target)
    bbox = diff.getbbox()
    hist = diff.convert("L").histogram()
    total = width * height
    severe = sum(hist[32:])
    print(f"target        : {width}x{height}")
    print(f"diff bbox     : {bbox}")
    print(f"pixels off >32: {severe} ({severe / total * 100:.2f}%)")
    print(f"mean abs diff : {sum(i * c for i, c in enumerate(hist)) / total:.2f}")
    diff.save(DIFF)
    print(f"wrote {OUT}")
    print(f"wrote {DIFF}")
    return 0


if __name__ == "__main__":
    sys.exit(main())