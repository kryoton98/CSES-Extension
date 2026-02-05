import os
from PIL import Image, ImageOps

def resize_for_store():
    # Microsoft Store Requirement
    TARGET_SIZE = (1280, 800)
    
    # CSES Dark Theme Background Color (to fill empty space)
    BG_COLOR = (24, 26, 27) # #181a1b

    # Find all PNGs in the current folder
    files = [f for f in os.listdir('.') if f.lower().endswith('.png')]
    
    # Create a 'ready_for_store' folder so we don't overwrite originals
    if not os.path.exists('ready_for_store'):
        os.makedirs('ready_for_store')

    print(f"found {len(files)} PNG images. Processing...")

    for filename in files:
        if filename.startswith("processed_"): continue # Skip already processed ones
        
        try:
            with Image.open(filename) as img:
                # Convert to RGB to ensure compatibility
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                # Logic: Resize the image to FIT inside 1280x800 without stretching.
                # Then paste it onto a centered background.
                
                # 1. Create the blank canvas
                new_img = Image.new("RGB", TARGET_SIZE, BG_COLOR)
                
                # 2. Resize original image to fit (preserving aspect ratio)
                img.thumbnail(TARGET_SIZE, Image.Resampling.LANCZOS)
                
                # 3. Calculate position to center it
                x_offset = (TARGET_SIZE[0] - img.width) // 2
                y_offset = (TARGET_SIZE[1] - img.height) // 2
                
                # 4. Paste
                new_img.paste(img, (x_offset, y_offset))
                
                # 5. Save
                save_path = os.path.join('ready_for_store', filename)
                new_img.save(save_path)
                print(f"✅ Fixed: {filename} -> {save_path}")
                
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")

if __name__ == "__main__":
    resize_for_store()