from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

def create_master_banner():
    # 1. Setup Canvas (1400 x 560 for Large Promo Tile)
    W, H = 1400, 560
    # Professional Dark Blue Gradient Colors (CSES Theme)
    c1 = (15, 23, 42)  # Dark Navy
    c2 = (30, 58, 138) # Brighter Blue
    
    img = Image.new("RGB", (W, H), c1)
    draw = ImageDraw.Draw(img)

    # 2. Draw Diagonal Gradient Background
    for y in range(H):
        r = int(c1[0] + (c2[0] - c1[0]) * (y / H))
        g = int(c1[1] + (c2[1] - c1[1]) * (y / H))
        b = int(c1[2] + (c2[2] - c1[2]) * (y / H))
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # 3. Add Tech "Grid" Overlay (Subtle)
    step = 40
    for x in range(0, W, step):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 10))
    for y in range(0, H, step):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 10))

    # 4. Draw Central Shield (Hexagon)
    cx, cy = W // 2 - 200, H // 2  # Shift left to make room for text
    size = 100
    angle_offset = 30
    points = []
    for i in range(6):
        angle_rad = math.radians(angle_offset + 60 * i)
        px = cx + size * math.cos(angle_rad)
        py = cy + size * math.sin(angle_rad)
        points.append((px, py))
    
    # Glow effect behind shield
    glow = Image.new("RGBA", (W, H), (0,0,0,0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.polygon(points, fill=(59, 130, 246, 100))
    glow = glow.filter(ImageFilter.GaussianBlur(20))
    img.paste(glow, (0,0), glow)
    
    # Main Shield
    draw.polygon(points, fill=(15, 23, 42), outline=(59, 130, 246), width=5)

    # 5. Draw Code Symbol inside Shield "{ }"
    try:
        # Try to use a default font, otherwise basic
        font_symbol = ImageFont.truetype("arial.ttf", 80)
        font_text = ImageFont.truetype("arial.ttf", 90)
    except:
        font_symbol = ImageFont.load_default()
        font_text = ImageFont.load_default()

    draw.text((cx, cy), "{ }", fill=(255, 255, 255), font=font_symbol, anchor="mm")

    # 6. Draw Title Text "CSES Enhanced"
    text_x = cx + 160
    draw.text((text_x, cy), "CSES Enhanced", fill=(255, 255, 255), font=font_text, anchor="lm")

    # 7. Save
    img.save("master_banner.png")
    print("✅ Created master_banner.png (1400x560)")

if __name__ == "__main__":
    create_master_banner()