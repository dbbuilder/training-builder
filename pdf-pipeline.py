#!/usr/bin/env python3
"""
PDF Pipeline for Training Builder
==================================
Converts markdown files to PDFs with chapter-based page numbering and merged output.

Usage:
    # Using virtual environment
    ./pdf-venv/bin/python pdf-pipeline.py --all
    ./pdf-venv/bin/python pdf-pipeline.py --chapter 1
    ./pdf-venv/bin/python pdf-pipeline.py --chapter 1 --chapter 5

Features:
    - Creates paginated markdown versions for each .md file
    - Exports to PDF using pandoc
    - Archives paginated versions
    - Merges PDFs by chapter with cover pages
    - Page numbers formatted as <chapter>.<page>
"""

import os
import re
import subprocess
import argparse
from pathlib import Path
from datetime import datetime
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from io import BytesIO


# Configuration
OUTPUT_DIR = Path('/mnt/d/dev2/training-builder/output')
PDF_OUTPUT_DIR = OUTPUT_DIR / 'pdf'
COURSE_TITLE = "Full-Stack Web Development"


def extract_chapter_title(content):
    """Extract the main title from markdown content."""
    # Look for the first H1 heading
    match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return "Untitled Chapter"


def create_paginated_markdown(md_path, chapter_num):
    """
    Create a paginated version of the markdown file.
    Returns the path to the paginated file.
    """
    content = md_path.read_text(encoding='utf-8')

    # Get the chapter title from content
    chapter_title = extract_chapter_title(content)

    # Create paginated filename
    paginated_name = md_path.stem + '_paginated.md'
    paginated_path = md_path.parent / paginated_name

    # Add page break markers before major sections (H2 headings)
    # This helps pandoc create better page breaks
    paginated_content = content

    # Add metadata for pandoc at the start
    yaml_header = f"""---
title: "Chapter {chapter_num}: {chapter_title}"
documentclass: report
geometry: margin=1in
fontsize: 11pt
---

"""

    # Remove any existing YAML front matter
    if paginated_content.startswith('---'):
        end_idx = paginated_content.find('---', 3)
        if end_idx > 0:
            paginated_content = paginated_content[end_idx + 3:].lstrip()

    paginated_content = yaml_header + paginated_content

    # Write paginated version
    paginated_path.write_text(paginated_content, encoding='utf-8')

    return paginated_path, chapter_title


def convert_to_pdf(md_path, pdf_path, chapter_num):
    """
    Convert markdown to PDF using pandoc.
    """
    cmd = [
        'pandoc',
        str(md_path),
        '-o', str(pdf_path),
        '--pdf-engine=xelatex',
        '-V', 'geometry:margin=1in',
        '-V', 'fontsize=11pt',
        '--highlight-style=tango',
        '--toc',
        '--toc-depth=2',
        '-V', 'colorlinks=true',
        '-V', 'linkcolor=blue',
        '-V', 'urlcolor=blue',
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            # Try without xelatex if it fails
            cmd_basic = [
                'pandoc',
                str(md_path),
                '-o', str(pdf_path),
                '-V', 'geometry:margin=1in',
                '--highlight-style=tango',
            ]
            result = subprocess.run(cmd_basic, capture_output=True, text=True, timeout=120)
            if result.returncode != 0:
                print(f"    Warning: pandoc error for {md_path.name}: {result.stderr[:200]}")
                return False
        return True
    except subprocess.TimeoutExpired:
        print(f"    Warning: pandoc timeout for {md_path.name}")
        return False
    except Exception as e:
        print(f"    Error converting {md_path.name}: {e}")
        return False


def create_cover_page(chapter_num, chapter_title, output_path):
    """
    Create a cover page PDF for a chapter.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Background color (light blue header)
    c.setFillColorRGB(0.2, 0.4, 0.6)
    c.rect(0, height - 3*inch, width, 3*inch, fill=1)

    # Course title
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 1.5*inch, COURSE_TITLE)

    # Chapter number
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 2*inch, f"Chapter {chapter_num}")

    # Chapter title
    c.setFillColorRGB(0, 0, 0)
    c.setFont("Helvetica-Bold", 28)

    # Word wrap the title if it's too long
    if len(chapter_title) > 40:
        words = chapter_title.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            if len(' '.join(current_line)) > 35:
                lines.append(' '.join(current_line[:-1]))
                current_line = [word]
        if current_line:
            lines.append(' '.join(current_line))

        y_pos = height/2 + len(lines) * 20
        for line in lines:
            c.drawCentredString(width/2, y_pos, line)
            y_pos -= 40
    else:
        c.drawCentredString(width/2, height/2, chapter_title)

    # Date at bottom
    c.setFont("Helvetica", 10)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawCentredString(width/2, 1*inch, f"Generated: {datetime.now().strftime('%B %d, %Y')}")

    c.save()

    # Write to file
    with open(output_path, 'wb') as f:
        f.write(buffer.getvalue())

    return output_path


def add_page_numbers(pdf_path, chapter_num, output_path):
    """
    Add chapter.page format page numbers to a PDF.
    """
    reader = PdfReader(str(pdf_path))
    writer = PdfWriter()

    width, height = letter

    for page_num, page in enumerate(reader.pages, 1):
        # Create a new PDF with the page number
        packet = BytesIO()
        c = canvas.Canvas(packet, pagesize=letter)

        # Add page number at bottom center
        page_label = f"{chapter_num}.{page_num}"
        c.setFont("Helvetica", 9)
        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.drawCentredString(width/2, 0.5*inch, page_label)

        c.save()
        packet.seek(0)

        # Merge the page number with the original page
        number_page = PdfReader(packet).pages[0]
        page.merge_page(number_page)
        writer.add_page(page)

    # Write the numbered PDF
    with open(output_path, 'wb') as f:
        writer.write(f)

    return len(reader.pages)


def merge_chapter_pdfs(chapter_num, pdf_files, chapter_title, output_path):
    """
    Merge multiple PDFs for a chapter with a cover page.
    """
    writer = PdfWriter()

    # Create and add cover page
    cover_path = output_path.parent / f"chapter-{chapter_num:02d}_cover.pdf"
    create_cover_page(chapter_num, chapter_title, cover_path)

    cover_reader = PdfReader(str(cover_path))
    for page in cover_reader.pages:
        writer.add_page(page)

    # Add numbered content pages
    for pdf_path in pdf_files:
        if pdf_path.exists():
            reader = PdfReader(str(pdf_path))
            for page in reader.pages:
                writer.add_page(page)

    # Write merged PDF
    with open(output_path, 'wb') as f:
        writer.write(f)

    # Cleanup cover
    if cover_path.exists():
        cover_path.unlink()

    return output_path


def process_chapter(chapter_dir, chapter_num):
    """
    Process a single chapter directory.
    Returns list of generated PDF paths.
    """
    print(f"\n  Processing {chapter_dir.name}:")

    # Define file processing order
    file_order = ['book-chapter', 'exercises', 'instructor-keys', 'quiz', 'qa', 'topics', 'powerpoint']

    # Create PDF subdirectory for this chapter
    chapter_pdf_dir = PDF_OUTPUT_DIR / chapter_dir.name
    chapter_pdf_dir.mkdir(parents=True, exist_ok=True)

    # Create archive for paginated files
    archive_dir = chapter_dir / 'paginated-archive'
    archive_dir.mkdir(exist_ok=True)

    pdf_files = []
    chapter_title = None

    # Process each markdown file
    for file_stem in file_order:
        md_file = chapter_dir / f"{file_stem}.md"
        if not md_file.exists():
            continue

        print(f"    Converting {md_file.name}...")

        # Create paginated version
        paginated_path, title = create_paginated_markdown(md_file, chapter_num)

        # Store chapter title from book-chapter.md
        if file_stem == 'book-chapter' and not chapter_title:
            chapter_title = title

        # Convert to PDF
        pdf_path = chapter_pdf_dir / f"{file_stem}.pdf"
        if convert_to_pdf(paginated_path, pdf_path, chapter_num):
            # Add page numbers
            numbered_path = chapter_pdf_dir / f"{file_stem}_numbered.pdf"
            page_count = add_page_numbers(pdf_path, chapter_num, numbered_path)

            # Replace original with numbered version
            numbered_path.rename(pdf_path)

            pdf_files.append(pdf_path)
            print(f"      Created {pdf_path.name} ({page_count} pages)")

        # Archive paginated markdown
        archive_path = archive_dir / paginated_path.name
        if paginated_path.exists():
            paginated_path.rename(archive_path)

    # Use default title if none found
    if not chapter_title:
        chapter_title = f"Chapter {chapter_num}"

    # Merge all PDFs into single chapter PDF
    if pdf_files:
        merged_path = chapter_pdf_dir / f"chapter-{chapter_num:02d}_complete.pdf"
        merge_chapter_pdfs(chapter_num, pdf_files, chapter_title, merged_path)
        print(f"    Merged: {merged_path.name}")
        return merged_path, chapter_title

    return None, chapter_title


def create_course_book(chapter_pdfs, output_path):
    """
    Merge all chapter PDFs into a complete course book.
    """
    writer = PdfWriter()

    # Create course cover page
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Full page background
    c.setFillColorRGB(0.15, 0.3, 0.5)
    c.rect(0, 0, width, height, fill=1)

    # Main title
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 3*inch, COURSE_TITLE)

    # Subtitle
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height - 3.8*inch, "Complete Course Materials")

    # Chapter count
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height/2, f"{len(chapter_pdfs)} Chapters")

    # Date
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, 1.5*inch, f"Generated: {datetime.now().strftime('%B %d, %Y')}")

    c.save()
    buffer.seek(0)

    # Add cover to writer
    cover_reader = PdfReader(buffer)
    for page in cover_reader.pages:
        writer.add_page(page)

    # Add all chapter PDFs
    for chapter_path, chapter_title in chapter_pdfs:
        if chapter_path and chapter_path.exists():
            reader = PdfReader(str(chapter_path))
            for page in reader.pages:
                writer.add_page(page)

    # Write complete course book
    with open(output_path, 'wb') as f:
        writer.write(f)

    return output_path


def main():
    parser = argparse.ArgumentParser(
        description='Convert Training Builder markdown to PDFs with chapter page numbering'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Process all chapters'
    )
    parser.add_argument(
        '--chapter',
        type=int,
        action='append',
        help='Specific chapter number(s) to process'
    )
    parser.add_argument(
        '--merge-only',
        action='store_true',
        help='Only merge existing PDFs into course book'
    )

    args = parser.parse_args()

    print("=" * 70)
    print("PDF PIPELINE FOR TRAINING BUILDER")
    print("=" * 70)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    print(f"PDF output: {PDF_OUTPUT_DIR}")

    # Create PDF output directory
    PDF_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Determine which chapters to process
    if args.all:
        chapter_dirs = sorted(OUTPUT_DIR.glob('chapter-*'))
    elif args.chapter:
        chapter_dirs = [OUTPUT_DIR / f"chapter-{c:02d}" for c in args.chapter]
        chapter_dirs = [d for d in chapter_dirs if d.exists()]
    else:
        print("\nError: Please specify --all or --chapter N")
        return

    if not chapter_dirs:
        print("\nNo chapter directories found!")
        return

    print(f"\nProcessing {len(chapter_dirs)} chapter(s)")

    # Process each chapter
    chapter_pdfs = []
    for chapter_dir in chapter_dirs:
        if not chapter_dir.is_dir():
            continue

        # Extract chapter number
        match = re.search(r'chapter-(\d+)', chapter_dir.name)
        if not match:
            continue

        chapter_num = int(match.group(1))

        if args.merge_only:
            # Just collect existing PDFs
            merged_path = PDF_OUTPUT_DIR / chapter_dir.name / f"chapter-{chapter_num:02d}_complete.pdf"
            if merged_path.exists():
                # Get chapter title from book-chapter.md
                book_chapter = chapter_dir / 'book-chapter.md'
                if book_chapter.exists():
                    title = extract_chapter_title(book_chapter.read_text(encoding='utf-8'))
                else:
                    title = f"Chapter {chapter_num}"
                chapter_pdfs.append((merged_path, title))
        else:
            result = process_chapter(chapter_dir, chapter_num)
            if result[0]:
                chapter_pdfs.append(result)

    # Create complete course book
    if chapter_pdfs:
        print("\n" + "=" * 70)
        print("Creating Complete Course Book")
        print("=" * 70)

        # Generate filename with date, add time suffix if file exists or is locked
        base_name = f"course-complete_{datetime.now().strftime('%Y%m%d')}"
        course_book_path = PDF_OUTPUT_DIR / f"{base_name}.pdf"

        # Handle file conflicts by appending timestamp
        if course_book_path.exists():
            try:
                # Try to remove existing file
                course_book_path.unlink()
            except (PermissionError, OSError):
                # File is locked, create with timestamp suffix
                timestamp = datetime.now().strftime('%H%M%S')
                course_book_path = PDF_OUTPUT_DIR / f"{base_name}_{timestamp}.pdf"
                print(f"    Note: Previous file locked, creating: {course_book_path.name}")

        create_course_book(chapter_pdfs, course_book_path)

        # Get file size
        size_mb = course_book_path.stat().st_size / (1024 * 1024)
        print(f"\nCreated: {course_book_path.name} ({size_mb:.1f} MB)")

    print("\n" + "=" * 70)
    print("PDF PIPELINE COMPLETE")
    print("=" * 70)
    print(f"\nPDFs available at: {PDF_OUTPUT_DIR}")


if __name__ == '__main__':
    main()
