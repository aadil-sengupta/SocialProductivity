#!/bin/bash

# Thumbnail Generator for Seika Wallpapers
# This script generates thumbnails for all wallpaper images and saves them to wallpaper-thumbnails directory

# Set script directory and paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Script Directory: $SCRIPT_DIR"
WALLPAPER_DIR="$SCRIPT_DIR/public/wallpapers"
THUMBNAIL_DIR="$SCRIPT_DIR/public/wallpaper-thumbnails"

# Thumbnail dimensions (width x height)
THUMBNAIL_SIZE="300x200"
THUMBNAIL_QUALITY=85

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🖼️  Seika Wallpaper Thumbnail Generator${NC}"
echo "============================================"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ Error: ImageMagick is not installed!${NC}"
    echo -e "${YELLOW}Please install ImageMagick:${NC}"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  CentOS/RHEL: sudo yum install imagemagick"
    exit 1
fi

# Determine which ImageMagick command to use
if command -v magick &> /dev/null; then
    MAGICK_CMD="magick"
else
    MAGICK_CMD="convert"
fi

# Check if wallpaper directory exists
if [ ! -d "$WALLPAPER_DIR" ]; then
    echo -e "${RED}❌ Error: Wallpaper directory not found: $WALLPAPER_DIR${NC}"
    exit 1
fi

# Create thumbnail directory if it doesn't exist
if [ ! -d "$THUMBNAIL_DIR" ]; then
    echo -e "${YELLOW}📁 Creating thumbnail directory...${NC}"
    mkdir -p "$THUMBNAIL_DIR"
fi

# Count total images
total_images=$(find "$WALLPAPER_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" -o -iname "*.webp" \) | wc -l | tr -d ' ')

if [ "$total_images" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No image files found in $WALLPAPER_DIR${NC}"
    exit 0
fi

echo -e "${BLUE}📊 Found $total_images image(s) to process${NC}"
echo -e "${BLUE}📏 Thumbnail size: $THUMBNAIL_SIZE${NC}"
echo -e "${BLUE}🎯 Quality: $THUMBNAIL_QUALITY%${NC}"
echo ""

# Initialize counters
processed=0
skipped=0
errors=0

# Process each image file
for image_path in "$WALLPAPER_DIR"/*; do
    # Skip if not a file
    [ ! -f "$image_path" ] && continue
    
    # Get filename and extension
    filename=$(basename "$image_path")
    name="${filename%.*}"
    extension="${filename##*.}"
    
    # Skip non-image files (convert to lowercase for comparison)
    extension_lower=$(echo "${extension}" | tr '[:upper:]' '[:lower:]')
    case "${extension_lower}" in
        jpg|jpeg|png|gif|bmp|webp) ;;
        *) continue ;;
    esac
    
    # Skip .DS_Store and other hidden files
    [[ "$filename" == .* ]] && continue
    
    # Define thumbnail path
    thumbnail_path="$THUMBNAIL_DIR/${name}.jpg"
    
    # Check if thumbnail already exists and is newer than source
    if [ -f "$thumbnail_path" ] && [ "$thumbnail_path" -nt "$image_path" ]; then
        echo -e "${YELLOW}⏭️  Skipping $filename (thumbnail up to date)${NC}"
        ((skipped++))
        continue
    fi
    
    echo -e "${BLUE}🔄 Processing: $filename${NC}"
    
    # Generate thumbnail using ImageMagick
    if [ "$MAGICK_CMD" = "magick" ]; then
        # ImageMagick 7.x syntax
        if magick "$image_path" -resize "$THUMBNAIL_SIZE^" -gravity center -extent "$THUMBNAIL_SIZE" -quality "$THUMBNAIL_QUALITY" "$thumbnail_path" 2>/dev/null; then
            echo -e "${GREEN}✅ Generated: ${name}_thumb.jpg${NC}"
            ((processed++))
        else
            echo -e "${RED}❌ Failed to process: $filename${NC}"
            ((errors++))
        fi
    else
        # ImageMagick 6.x syntax
        if convert "$image_path" -resize "$THUMBNAIL_SIZE^" -gravity center -extent "$THUMBNAIL_SIZE" -quality "$THUMBNAIL_QUALITY" "$thumbnail_path" 2>/dev/null; then
            echo -e "${GREEN}✅ Generated: ${name}_thumb.jpg${NC}"
            ((processed++))
        else
            echo -e "${RED}❌ Failed to process: $filename${NC}"
            ((errors++))
        fi
    fi
done

echo ""
echo "============================================"
echo -e "${GREEN}🎉 Thumbnail generation complete!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   • Processed: $processed images"
echo -e "   • Skipped: $skipped images"
echo -e "   • Errors: $errors images"
echo -e "   • Thumbnails saved to: $THUMBNAIL_DIR"

# List generated thumbnails
if [ "$processed" -gt 0 ]; then
    echo ""
    echo -e "${BLUE}📋 Generated thumbnails:${NC}"
    ls -la "$THUMBNAIL_DIR"/*.jpg 2>/dev/null | while read -r line; do
        echo "   $line"
    done
fi