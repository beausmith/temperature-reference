#!/usr/bin/env bash
# Regenerates PWA icons and iOS launch (splash) images from public/app-icon.png
# using macOS `sips` only — no external downloads. Re-run after changing the icon.
set -euo pipefail

cd "$(dirname "$0")/.."

SRC="public/app-icon.png"        # 512x512 master icon (orange gradient + °C)
BG="FFFFFF"                       # splash / maskable background (matches manifest background_color)

echo "Generating icons…"
# Standard "any" icons — straight resizes of the master artwork
sips -z 192 192 "$SRC" --out public/icons/icon-192.png >/dev/null
sips -z 512 512 "$SRC" --out public/icons/icon-512.png >/dev/null
# Apple touch icon (iOS home screen) — 180px is the modern size
sips -z 180 180 "$SRC" --out public/icons/apple-touch-icon-180.png >/dev/null
# Maskable icon — icon at 80% on a full-bleed white background so the glyph
# stays inside Android's central safe zone when masked to a circle/squircle
sips -z 410 410 "$SRC" --out /tmp/_mask.png >/dev/null
sips --padToHeightWidth 512 512 --padColor "$BG" /tmp/_mask.png --out public/icons/icon-maskable-512.png >/dev/null
rm -f /tmp/_mask.png

echo "Generating iOS splash screens…"
# device-width device-height ratio  (portrait, CSS px + DPR — used for media queries too)
DEVICES=(
  "320 568 2"    # iPhone SE (1st gen)
  "375 667 2"    # iPhone 8 / SE 2-3
  "414 736 3"    # iPhone 8 Plus
  "375 812 3"    # iPhone X / XS / 11 Pro
  "360 780 3"    # iPhone 12 mini / 13 mini
  "414 896 2"    # iPhone XR / 11
  "414 896 3"    # iPhone XS Max / 11 Pro Max
  "390 844 3"    # iPhone 12 / 13 / 14
  "393 852 3"    # iPhone 14 Pro / 15 / 15 Pro / 16
  "428 926 3"    # iPhone 12-13 Pro Max / 14 Plus
  "430 932 3"    # iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus
  "402 874 3"    # iPhone 16 Pro
  "440 956 3"    # iPhone 16 Pro Max
  "768 1024 2"   # iPad mini / 9.7"
  "834 1194 2"   # iPad Pro 11"
  "1024 1366 2"  # iPad Pro 12.9"
)

for d in "${DEVICES[@]}"; do
  read -r dw dh r <<<"$d"
  w=$((dw * r)); h=$((dh * r))
  # Logo ~34% of the short edge, centered on a white canvas
  icon=$(( w * 34 / 100 ))
  sips -z "$icon" "$icon" "$SRC" --out /tmp/_splash.png >/dev/null
  sips --padToHeightWidth "$h" "$w" --padColor "$BG" /tmp/_splash.png \
    --out "public/splashscreens/splash-${w}x${h}.png" >/dev/null
done
rm -f /tmp/_splash.png

echo "Done. Generated $(ls public/splashscreens/splash-*.png | wc -l | tr -d ' ') splash images and 4 icons."
