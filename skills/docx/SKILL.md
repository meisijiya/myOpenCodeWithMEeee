---
name: docx
description: "Use this skill any time a .docx file is involved in any way — as input, output, or both. This includes: creating documents, reports, or letters; reading, parsing, or extracting text from any .docx file; editing, modifying, or updating existing documents; combining or splitting document files; working with templates, styles, or formatting. Trigger whenever the user mentions 'document', 'Word', or references a .docx filename. If a .docx file needs to be opened, created, or touched, use this skill."
source: "anthropics/skills"
importedBy: "ohMeisijiyaCode v2.3"
---

# DOCX Skill

## Quick Reference

| Task | Guide |
|------|-------|
| Read/extract text | `python -m markitdown document.docx` |
| Edit existing | Read [editing.md](editing.md) |
| Create from scratch | Use `python-docx` |

---

## Reading Content

```bash
# Text extraction (requires markitdown)
python -m markitdown document.docx

# With images extracted
python -c "from markitdown import MarkItDown; md = MarkItDown(); print(md.convert('document.docx').text_content)"
```

---

## Editing Workflow

1. Read the existing document
2. Identify sections to modify
3. Use `python-docx` to make changes
4. Save and verify

---

## Creating from Scratch

```python
from docx import Document

doc = Document()
doc.add_heading('Title', 0)
doc.add_paragraph('Hello, World!')
doc.save('output.docx')
```

---

## Dependencies

```bash
# Install markitdown for text extraction
pip install markitdown[docx]

# Install python-docx for creating/editing
pip install python-docx
```

---

## QA (Required)

After processing, verify:
1. Text extraction is complete
2. Formatting is preserved (if applicable)
3. Images are properly extracted (if any)
4. Tables are correctly formatted

If issues found, try alternative extraction methods or report to OneTwo.
