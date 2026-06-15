---
name: pdf
description: "Use this skill any time a .pdf file is involved in any way — as input, output, or both. This includes: reading, parsing, extracting text, tables, or images from any .pdf file; creating PDFs from other formats; converting PDFs to images for visual inspection; merging or splitting PDF files. Trigger whenever the user mentions 'PDF' or references a .pdf filename. If a .pdf file needs to be opened, created, or touched, use this skill."
source: "anthropics/skills"
importedBy: "ohMeisijiyaCode v2.3"
---

# PDF Skill

## Quick Reference

| Task | Guide |
|------|-------|
| Read/extract text | `python -m markitdown document.pdf` |
| Visual inspection | Convert to images → inspect |
| Extract images | `python -c "from markitdown import MarkItDown; md = MarkItDown(); print(md.convert('document.pdf').text_content)"` |
| Merge/split | Use `pdftk` or `qpdf` |

---

## Reading Content

```bash
# Text extraction (requires markitdown)
python -m markitdown document.pdf

# Visual overview (requires poppler)
pdftoppm -jpeg -r 150 document.pdf page

# Extract specific pages
pdftoppm -jpeg -r 150 -f 1 -l 5 document.pdf page
```

---

## Dependencies

```bash
# Install markitdown for text extraction
pip install markitdown

# Install poppler for PDF to images (Ubuntu/Debian)
sudo apt install poppler-utils

# Install poppler for PDF to images (macOS)
brew install poppler
```

---

## Visual Inspection

Convert PDF pages to images for visual inspection:

```bash
# Convert all pages
pdftoppm -jpeg -r 150 document.pdf page

# Convert specific pages
pdftoppm -jpeg -r 150 -f N -l N document.pdf page-fixed

# Use mmx for image recognition (if model doesn't have vision)
mmx vision describe page-01.jpg
```

---

## Creating PDFs

```bash
# From HTML
wkhtmltopdf input.html output.pdf

# From images
img2pdf image1.jpg image2.jpg -o output.pdf

# From DOCX
libreoffice --headless --convert-to pdf input.docx
```

---

## Merging and Splitting

```bash
# Merge PDFs
pdfunite file1.pdf file2.pdf merged.pdf

# Split PDF
pdfseparate input.pdf page-%d.pdf

# Extract specific pages
pdfseparate -f 1 -l 5 input.pdf pages-1-5.pdf
```

---

## QA (Required)

**Assume there are problems. Your job is to find them.**

After extracting content, verify:
1. Text extraction is complete (no missing pages)
2. Images are properly extracted
3. Tables are correctly formatted
4. Special characters are preserved

If issues found, try alternative extraction methods or report to OneTwo.
