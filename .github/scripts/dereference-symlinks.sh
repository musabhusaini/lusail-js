#!/bin/bash

# Dereferences all symlinks in the given directory.
dir="${1:-*}"
for file in $dir; do
  if [ -L "$file" ]; then
    # Check if the symlink is pointing to a file or directory.
    if [ -d "$file" ]; then
      # Get the target directory and remove the symlink.
      target_dir="$(readlink -f "$file")"
      rm "$file"

      # Copy the target directory to the original location.
      cp -r "$target_dir" "$file"
    elif [ -f "$file" ]; then
      # Get the target file and remove the symlink.
      target_file="$(readlink -f "$file")"
      rm "$file"

      # Copy the target file to the original location.
      cp "$target_file" "$file"
    fi
  fi
done
