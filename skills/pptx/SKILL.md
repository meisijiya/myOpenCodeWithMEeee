---
name: pptx
description: "Use this skill any time a .pptx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx file; editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates, layouts, speaker notes, or comments. Trigger whenever the user mentions 'deck', 'slides', 'presentation', or references a .pptx filename. If a .pptx file needs to be opened, created, or touched, use this skill."
source: "anthropics/skills"
importedBy: "ohMeisijiyaCode v2.3"
---

# PPTX Skill

## Quick Reference

| Task | Guide |
|------|-------|
| Read/analyze content | `python -m markitdown presentation.pptx` |
| Visual overview | `python scripts/thumbnail.py presentation.pptx` |
| Edit or create from template | Read [editing.md](editing.md) |
| Create from scratch | Read [pptxgenjs.md](pptxgenjs.md) |

---

## Reading Content

```bash
# Text extraction
python -m markitdown presentation.pptx

# Visual overview
python scripts/thumbnail.py presentation.pptx

# Raw XML
python scripts/office/unpack.py presentation.pptx unpacked/
```

---

## Dependencies

```bash
# Install markitdown for text extraction
pip install "markitdown[pptx]"

# Install Pillow for thumbnail grids
pip install Pillow

# Install pptxgenjs for creating from scratch
npm install -g pptxgenjs

# Install LibreOffice for PDF conversion (Ubuntu/Debian)
sudo apt install libreoffice

# Install Poppler for PDF to images (Ubuntu/Debian)
sudo apt install poppler-utils
```

---

## Converting to Images

Convert presentations to individual slide images for visual inspection:

```bash
# Convert to PDF first
python scripts/office/soffice.py --headless --convert-to pdf output.pptx

# Convert PDF to images
pdftoppm -jpeg -r 150 output.pdf slide

# This creates slide-01.jpg, slide-02.jpg, etc.

# Re-render specific slides after fixes
pdftoppm -jpeg -r 150 -f N -l N output.pdf slide-fixed
```

---

## Visual Inspection

Use mmx for image recognition (if model doesn't have vision):

```bash
# Inspect each slide
mmx vision describe slide-01.jpg
mmx vision describe slide-02.jpg
```

---

## QA (Required)

**Assume there are problems. Your job is to find them.**

### Content QA

```bash
python -m markitdown output.pptx
```

Check for missing content, typos, wrong order.

### Visual QA

Convert slides to images, then inspect for:
- Overlapping elements
- Text overflow or cut off
- Low-contrast text
- Uneven gaps
- Missing margins

If issues found, fix and re-verify.
