#!/usr/bin/env python3
"""
Header Cleanup Script
=====================
Removes duplicate headers from markdown files that were formatted multiple times.
"""

import os
import re
from pathlib import Path

def clean_headers(content):
    """Remove duplicate headers and clean up markdown structure."""

    # Remove duplicate metadata headers (Chapter info, Generated date, Component)
    # Keep only the first occurrence
    lines = content.split('\n')
    cleaned_lines = []
    seen_chapter_info = False
    seen_generated = False
    seen_component = False
    seen_first_h1 = False
    first_h1_title = None
    consecutive_hr = 0
    consecutive_empty = 0

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip duplicate "# Book Chapter - Chapter X" lines
        if re.match(r'^#\s*Book Chapter\s*-\s*Chapter\s*\d+', stripped):
            i += 1
            continue

        # Skip duplicate "# Generated:" lines
        if re.match(r'^#\s*Generated:', stripped, re.IGNORECASE):
            i += 1
            continue

        # Skip duplicate "# ===" separator lines
        if re.match(r'^#\s*=+\s*$', stripped):
            i += 1
            continue

        # Skip duplicate "# Chapter X:" lines after the first real title
        if seen_first_h1 and re.match(r'^#\s*Chapter\s*\d+:', stripped):
            i += 1
            continue

        # Handle H1 titles - only keep the first one
        if stripped.startswith('# ') and not stripped.startswith('## '):
            # Check if this is a real title (not metadata)
            if not re.match(r'^#\s*(Book Chapter|Generated|=+|Chapter\s*\d+:)', stripped):
                if seen_first_h1:
                    # This is a duplicate H1 - skip it
                    i += 1
                    continue
                else:
                    seen_first_h1 = True
                    first_h1_title = stripped

        # Handle Chapter info line
        if stripped.startswith('**Chapter') and ':' in stripped:
            if seen_chapter_info:
                i += 1
                continue
            seen_chapter_info = True

        # Handle Generated line
        if stripped.startswith('**Generated:'):
            if seen_generated:
                i += 1
                continue
            seen_generated = True

        # Handle Component line
        if stripped.startswith('**Component:'):
            if seen_component:
                i += 1
                continue
            seen_component = True

        # Limit consecutive horizontal rules to 1
        if stripped == '---':
            consecutive_hr += 1
            consecutive_empty = 0
            if consecutive_hr > 1:
                i += 1
                continue
        elif stripped == '':
            consecutive_empty += 1
            # Limit consecutive empty lines to 1
            if consecutive_empty > 1:
                i += 1
                continue
        else:
            consecutive_hr = 0
            consecutive_empty = 0

        cleaned_lines.append(line)
        i += 1

    # Final pass: collapse multiple blank lines
    result = '\n'.join(cleaned_lines)
    # Replace 3+ newlines with 2 newlines
    while '\n\n\n' in result:
        result = result.replace('\n\n\n', '\n\n')

    return result


def process_file(filepath):
    """Process a single markdown file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_size = len(content)
        cleaned = clean_headers(content)
        new_size = len(cleaned)

        if original_size != new_size:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(cleaned)

            diff = original_size - new_size
            print(f"  Cleaned {filepath.name}: -{diff} bytes")
            return True
        else:
            print(f"  Skipped {filepath.name}: no changes needed")
            return False

    except Exception as e:
        print(f"  Error processing {filepath.name}: {e}")
        return False


def main():
    """Main function to process all markdown files."""
    output_dir = Path('/mnt/d/dev2/training-builder/output')

    print("=" * 70)
    print("HEADER CLEANUP SCRIPT")
    print("=" * 70)
    print()

    total_files = 0
    cleaned_files = 0

    # Process each chapter directory
    for chapter_dir in sorted(output_dir.glob('chapter-*')):
        if not chapter_dir.is_dir():
            continue

        print(f"\nProcessing {chapter_dir.name}:")

        # Process each .md file
        for md_file in sorted(chapter_dir.glob('*.md')):
            total_files += 1
            if process_file(md_file):
                cleaned_files += 1

    print()
    print("=" * 70)
    print(f"Complete: {cleaned_files}/{total_files} files cleaned")
    print("=" * 70)


if __name__ == '__main__':
    main()
