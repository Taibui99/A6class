"""
A6Class Welcome Scene — Automatic Layer Segmentation
Phân tách designs/screen.png thành các layer riêng cho animation.
"""
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
import os

SRC = "D:/A6Class/designs/screen.png"
OUT = "D:/A6Class/public/assets/welcome"
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGB")
W, H = img.size  # 1376, 768
arr = np.array(img)

print(f"Source: {W}x{H}")


# ============================================================
# Helper functions
# ============================================================

def color_mask(arr, r_range, g_range, b_range):
    """Create boolean mask from RGB ranges."""
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    return (
        (r >= r_range[0]) & (r <= r_range[1]) &
        (g >= g_range[0]) & (g <= g_range[1]) &
        (b >= b_range[0]) & (b <= b_range[1])
    )

def brightness(arr):
    """Per-pixel brightness (0-255)."""
    return arr[:,:,:3].mean(axis=2)

def feather_mask(mask, radius=5):
    """Soften mask edges for smooth compositing."""
    m = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
    m = m.filter(ImageFilter.GaussianBlur(radius))
    return np.array(m).astype(np.float32) / 255.0

def flood_fill_from_edge(mask, start_x, start_y, tolerance=30):
    """Flood fill from a starting point, expanding within tolerance of original image colors."""
    from collections import deque
    h, w = mask.shape
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()
    queue.append((start_y, start_x))
    visited[start_y, start_x] = True
    base_color = arr[start_y, start_x, :3].astype(float)
    
    while queue:
        cy, cx = queue.popleft()
        mask[cy, cx] = True
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = cy+dy, cx+dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                diff = np.abs(arr[ny, nx, :3].astype(float) - base_color).mean()
                if diff < tolerance:
                    visited[ny, nx] = True
                    queue.append((ny, nx))
    return mask

def morpho_close(mask, size=3):
    """Morphological close to fill small holes."""
    from PIL import ImageFilter
    s = size if size % 2 == 1 else size + 1
    m = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
    m = m.filter(ImageFilter.MaxFilter(s))
    m = m.filter(ImageFilter.MinFilter(s))
    return np.array(m).astype(np.float32) / 255.0

def crop_region(img, mask, padding=10):
    """Crop image+mask to bounding box of mask, with padding."""
    m = np.array(mask)
    ys, xs = np.where(m > 0.1)
    if len(ys) == 0:
        return img, mask, (0, 0, 0, 0)
    y1, y2 = max(0, ys.min()-padding), min(m.shape[0], ys.max()+padding)
    x1, x2 = max(0, xs.min()-padding), min(m.shape[1], xs.max()+padding)
    cropped_img = img.crop((x1, y1, x2, y2))
    cropped_arr = m[y1:y2, x1:x2]
    cropped_mask = Image.fromarray((cropped_arr * 255).astype(np.uint8), mode="L")
    return cropped_img, cropped_mask, (x1, y1, x2, y2)

def save_layer(name, img, mask, bbox=None):
    """Save RGBA layer (image + alpha mask)."""
    rgba = img.convert("RGBA")
    rgba.putalpha(mask.convert("L"))
    path = os.path.join(OUT, f"{name}.png")
    rgba.save(path, "PNG")
    print(f"  Saved {name}.png ({img.size[0]}x{img.size[1]})")
    return path


# ============================================================
# Layer 1: SKY (warm peach/golden tones, upper 50%)
# ============================================================
print("\n[1/8] Sky layer...")
sky_mask = np.zeros((H, W), dtype=bool)
# Warm sky: high R, medium-high G, lower B
sky_mask[:380, :] = color_mask(arr[:380, :],
    r_range=(200, 255), g_range=(150, 255), b_range=(50, 240))
# Flood fill from top-center to ensure connectivity
sky_fill = np.zeros((H, W), dtype=bool)
sky_fill = flood_fill_from_edge(sky_fill, W//2, 10, tolerance=45)
sky_mask = sky_mask | sky_fill
sky_mask = morpho_close(sky_mask, 5)
sky_mask = feather_mask(sky_mask, 8)
# Limit to upper portion
sky_mask[400:, :] *= 0  # fade out below mountains

sky_img, sky_crop, sky_bbox = crop_region(img, Image.fromarray((sky_mask*255).astype(np.uint8)))
save_layer("sky", sky_img, sky_crop, sky_bbox)


# ============================================================
# Layer 2: MOUNTAINS (blue-gray in mid section)
# ============================================================
print("\n[2/8] Mountain layer...")
mt_mask = np.zeros((H, W), dtype=bool)
# Blue mountains: medium R, medium G, higher B
mt_region = arr[100:400, :, :]
mt_submask = color_mask(mt_region,
    r_range=(100, 210), g_range=(140, 230), b_range=(170, 255))
mt_mask[100:400, :] = mt_submask
# Also include some mid-tone areas
mt_mask[100:400, :] |= color_mask(arr[100:400, :],
    r_range=(150, 220), g_range=(170, 230), b_range=(190, 255))
mt_mask = morpho_close(mt_mask, 4)
mt_mask = feather_mask(mt_mask, 6)

mt_img, mt_crop, mt_bbox = crop_region(img, Image.fromarray((mt_mask*255).astype(np.uint8)))
save_layer("mountains", mt_img, mt_crop, mt_bbox)


# ============================================================
# Layer 3: SCHOOL (red/terracotta, left side)
# ============================================================
print("\n[3/8] School layer...")
# School bounding box approx
school_region = arr[180:430, 150:420, :]
school_mask_sub = color_mask(school_region,
    r_range=(130, 240), g_range=(30, 130), b_range=(20, 130))
school_mask = np.zeros((H, W), dtype=bool)
school_mask[180:430, 150:420] = school_mask_sub
# Include brown roof
school_mask[180:430, 150:420] |= color_mask(arr[180:430, 150:420, :],
    r_range=(100, 200), g_range=(30, 110), b_range=(30, 110))
# Include clock/bell tower area
school_mask[150:250, 240:360] |= color_mask(arr[150:250, 240:360, :],
    r_range=(130, 230), g_range=(40, 120), b_range=(30, 120))
school_mask = morpho_close(school_mask, 4)
school_mask = feather_mask(school_mask, 5)

school_img, school_crop, school_bbox = crop_region(img, Image.fromarray((school_mask*255).astype(np.uint8)))
save_layer("school", school_img, school_crop, school_bbox)


# ============================================================
# Layer 4: TREES (green clusters, scattered)
# ============================================================
print("\n[4/8] Tree layer...")
tree_mask = np.zeros((H, W), dtype=bool)
# Tree foliage: green, mid brightness
# Left tree cluster
tree_mask[220:380, 30:180] = color_mask(arr[220:380, 30:180, :],
    r_range=(50, 170), g_range=(100, 210), b_range=(30, 160))
# Right tree cluster
tree_mask[150:400, 1100:1370] = color_mask(arr[150:400, 1100:1370, :],
    r_range=(50, 180), g_range=(100, 220), b_range=(30, 170))
# Middle trees (behind school)
tree_mask[200:350, 350:500] = color_mask(arr[200:350, 350:500, :],
    r_range=(60, 160), g_range=(110, 200), b_range=(40, 150))
tree_mask = morpho_close(tree_mask, 3)
tree_mask = feather_mask(tree_mask, 4)

tree_img, tree_crop, tree_bbox = crop_region(img, Image.fromarray((tree_mask*255).astype(np.uint8)))
save_layer("trees", tree_img, tree_crop, tree_bbox)


# ============================================================
# Layer 5: ROBOT (white body, right-center)
# ============================================================
print("\n[5/8] Robot layer...")
# Robot bounding box
r1, r2, c1, c2 = 170, 545, 740, 1010
robot_region = arr[r1:r2, c1:c2, :]
robot_bright = brightness(robot_region)

robot_mask = np.zeros((H, W), dtype=bool)
# White body: brightness > 190
robot_sub = robot_bright > 185
# Dark face: brightness < 100 (keep as part of robot)
robot_sub |= robot_bright < 100
# Mid-tones that are part of robot (edges, shadows)
robot_sub |= (robot_bright > 120) & (robot_bright < 185)
# But only if color is not too green (exclude grass bleed)
robot_r = robot_region[:,:,0]
robot_g = robot_region[:,:,1]
robot_b = robot_region[:,:,2]
not_green = ~(robot_g > robot_r + 20)  # exclude green-ish
robot_sub &= not_green

robot_mask[r1:r2, c1:c2] = robot_sub
# Include antenna (top area)
robot_mask[140:200, 860:920] = color_mask(arr[140:200, 860:920, :],
    r_range=(200, 255), g_range=(180, 255), b_range=(100, 255))

robot_mask = morpho_close(robot_mask, 5)
robot_mask = feather_mask(robot_mask, 4)

robot_img, robot_crop, robot_bbox = crop_region(img, Image.fromarray((robot_mask*255).astype(np.uint8)))
save_layer("robot", robot_img, robot_crop, robot_bbox)
print(f"  Robot bbox: {robot_bbox}")


# ============================================================
# Layer 6: OBJECTS (book, globe, star, rocket, bell)
# ============================================================
print("\n[6/8] Object layer...")
obj_mask = np.zeros((H, W), dtype=bool)

# Book (bottom-left area)
obj_mask[480:650, 250:500] = color_mask(arr[480:650, 250:500, :],
    r_range=(180, 255), g_range=(160, 240), b_range=(120, 220))

# Globe (center-left)
obj_mask[430:580, 440:570] = color_mask(arr[430:580, 440:570, :],
    r_range=(30, 140), g_range=(80, 200), b_range=(30, 180))

# Star (yellow, bottom-center)
obj_mask[560:650, 430:530] = color_mask(arr[560:650, 430:530, :],
    r_range=(200, 255), g_range=(180, 255), b_range=(50, 160))

# Rocket (center)
obj_mask[500:620, 560:680] = color_mask(arr[500:620, 560:680, :],
    r_range=(150, 255), g_range=(80, 200), b_range=(80, 220))

# Bell (right)
obj_mask[480:620, 1020:1170] = color_mask(arr[480:620, 1020:1170, :],
    r_range=(140, 230), g_range=(110, 200), b_range=(40, 140))

obj_mask = morpho_close(obj_mask, 3)
obj_mask = feather_mask(obj_mask, 4)

obj_img, obj_crop, obj_bbox = crop_region(img, Image.fromarray((obj_mask*255).astype(np.uint8)))
save_layer("objects", obj_img, obj_crop, obj_bbox)


# ============================================================
# Layer 7: FOREGROUND (grass, path, bottom area)
# ============================================================
print("\n[7/8] Foreground layer...")
fg_mask = np.zeros((H, W), dtype=bool)
# Bottom 40% — grass + path
fg_region = arr[480:, :, :]
fg_sub = color_mask(fg_region,
    r_range=(20, 200), g_range=(80, 230), b_range=(10, 180))
fg_mask[480:, :] = fg_sub
# Also include path (brown tones in lower half)
fg_mask[480:, :] |= color_mask(arr[480:, :, :],
    r_range=(100, 210), g_range=(80, 180), b_range=(40, 130))
fg_mask = morpho_close(fg_mask, 5)
fg_mask = feather_mask(fg_mask, 10)

fg_img, fg_crop, fg_bbox = crop_region(img, Image.fromarray((fg_mask*255).astype(np.uint8)))
save_layer("foreground", fg_img, fg_crop, fg_bbox)


# ============================================================
# Layer 8: BACKGROUND (everything — full scene without foreground)
# ============================================================
print("\n[8/8] Background (composite)...")
# Create scene-bg: full image with foreground area transparent
bg_mask = np.ones((H, W), dtype=np.float32)
# Fade out bottom area
for y in range(480, H):
    bg_mask[y, :] = max(0, 1.0 - (y - 480) / (H - 480))
bg_mask_feathered = feather_mask(bg_mask > 0.01, 15)

bg_rgba = img.convert("RGBA")
bg_alpha = Image.fromarray((bg_mask_feathered * 255).astype(np.uint8), mode="L")
bg_rgba.putalpha(bg_alpha)
bg_path = os.path.join(OUT, "scene-bg.png")
bg_rgba.save(bg_path, "PNG")
print(f"  Saved scene-bg.png ({W}x{H})")


# ============================================================
# Also save full scene as-is
# ============================================================
import shutil
shutil.copy2(SRC, os.path.join(OUT, "scene.png"))
print(f"\n  Copied scene.png (original)")


# ============================================================
# Summary
# ============================================================
print("\n" + "="*50)
print("SEGMENTATION COMPLETE")
print("="*50)
print(f"\nOutput: {OUT}/")
for f in sorted(os.listdir(OUT)):
    if f.endswith('.png'):
        size = os.path.getsize(os.path.join(OUT, f))
        print(f"  {f:25s} {size//1024:6d} KB")
print("\nLayer roles:")
print("  scene.png      — Full original (fallback)")
print("  scene-bg.png   — Background without foreground")
print("  sky.png        — Sky + sun")
print("  mountains.png  — Blue mountain range")
print("  school.png     — Red schoolhouse")
print("  trees.png      — Green trees")
print("  robot.png      — Robot (white body, dark face)")
print("  objects.png    — Book, globe, star, rocket, bell")
print("  foreground.png — Grass + path")
