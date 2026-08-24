from pathlib import Path

from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Logo_ORefugio2.png"
ASSETS = ROOT / "assets" / "images"
PUBLIC = ROOT / "public"
ASSETS.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

image = Image.open(SOURCE).convert("RGBA")

# Preserva a transparência original e remove apenas um fundo sólido caso a imagem
# tenha sido exportada com fundo opaco nas bordas.
alpha = image.getchannel("A")
corner = image.getpixel((0, 0))
if corner[3] > 0:
    rgb = image.convert("RGB")
    if max(corner[:3]) < 24:
        background = Image.new("RGB", image.size, (0, 0, 0))
        distance = ImageChops.difference(rgb, background).convert("L")
        alpha = distance.point(lambda value: 0 if value < 18 else min(255, value * 18))
    elif min(corner[:3]) > 232:
        background = Image.new("RGB", image.size, (255, 255, 255))
        distance = ImageChops.difference(rgb, background).convert("L")
        alpha = distance.point(lambda value: 0 if value < 18 else min(255, value * 18))
image.putalpha(alpha)

bbox = image.getchannel("A").getbbox()
if bbox is None:
    raise SystemExit("A logo não contém pixels visíveis após a preparação.")
left, top, right, bottom = bbox
padding = 18
cropped = image.crop((max(0, left - padding), max(0, top - padding), min(image.width, right + padding), min(image.height, bottom + padding)))

# O cabeçalho usa a marca completa, agora sem as margens vazias da arte original.
full_logo = ASSETS / "logo_refugio_da_lua.png"
cropped.save(full_logo, optimize=True)
cropped.save(PUBLIC / "logo-o-refugio2.png", optimize=True)

# Para instalação e favicon, usa somente o emblema circular superior.
emblem = image.crop((500, 170, 930, 520))
emblem = ImageOps.contain(emblem, (512, 512), method=Image.Resampling.LANCZOS)
square = Image.new("RGBA", (512, 512), (251, 247, 239, 255))
square.alpha_composite(emblem, ((512 - emblem.width) // 2, (512 - emblem.height) // 2))
for size, path in [(512, PUBLIC / "logo-512.png"), (192, PUBLIC / "logo-192.png"), (64, PUBLIC / "favicon.png")]:
    square.resize((size, size), Image.Resampling.LANCZOS).save(path, optimize=True)

print(f"Logo completa: {full_logo} ({cropped.width}x{cropped.height})")
print("Ícones: public/logo-512.png, public/logo-192.png e public/favicon.png")
