#!/bin/bash

# Set the base directory to search in
BASE_DIR="${1:-.}"  # defaults to current directory if not provided

# Find and copy/rename each .env.kek to .env
find "$BASE_DIR" -type f -name ".env.kek" | while read -r file; do
    target_dir=$(dirname "$file")
    mkdir -p "/home/pmagnero/repo/envtranscendence/$target_dir"
    cp "$file" "/home/pmagnero/repo/envtranscendence/$target_dir/.env"
    echo "Copied: $file -> $target_dir/.env"
done