"""Check whether robot.png aligns over the baked-in robot in screen.png."""
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "designs" / "welcome-real" / "assets"
TARGET = ROOT / "designs" / "screen.png"
OUT = ROOT / "designs" / "robot-align-check.png"

# reference position from a6class-welcome-real.html
L, T, W, H = 50.00, 33.50, 20.25, 40.23


def main() -> int:
    base = Image.open(TARGET).convert("RGB")
    width, height = base.size
    box = (
        round(L / 100 * width),
        round(T / 100 * height),
        round((L + W) / 100 * width),
        round((T + H) / 100 * height),
    )
    print(f"stage size    : {width}x{height}")
    print(f"robot box     : {box} -> {box[2]-box[0]}x{box[3]-box[1]}")
    print(f"aspect stage  : {width/height:.4f}  (reference html assumes 1.5)")

    robot = Image.open(REF / "robot.png").convert("RGBA")
    print(f"robot asset   : {robot.size}")

    # stretch robot to the reference box, composite over screen.png
    layer = robot.resize((box[2] - box[0], box[3] - box[1]), Image.LANCZOS)
    over = base.convert("RGBA")
    over.alpha_composite(layer, dest=(box[0], box[1]))
    result = over.convert("RGB")

    # region inside the robot box
    region_a = base.crop(box)
    region_b = result.crop(box)
    diff = ImageChops.difference(region_a, region_b).convert("L")
    hist = diff.histogram()
    px = diff.size[0] * diff.size[1]
    print(f"robot-region pixels off >32: {sum(hist[32:])} / {px} ({sum(hist[32:])/px*100:.1f}%)")
    print(f"robot-region mean abs diff : {sum(i*c for i,c in enumerate(hist))/px:.2f}")

    result.save(OUT)
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())