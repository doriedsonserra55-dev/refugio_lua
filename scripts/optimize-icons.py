from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/refugio-icon.png")
TARGETS = {
    Path("assets/images/icon.png"): 1024,
    Path("assets/images/splash-icon.png"): 1024,
    Path("assets/images/android-icon-foreground.png"): 1024,
    Path("assets/images/favicon.png"): 512,
}


def create_optimized_icon(source: Image.Image, size: int, destination: Path) -> None:
    resized = source.resize((size, size), Image.Resampling.LANCZOS).convert("RGB")
    optimized = resized.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
    optimized.save(destination, optimize=True, compress_level=9)


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Ícone-fonte não encontrado: {SOURCE}")

    with Image.open(SOURCE) as source:
        for destination, size in TARGETS.items():
            create_optimized_icon(source, size, destination)
            print(f"{destination}: {destination.stat().st_size} bytes")


if __name__ == "__main__":
    main()
