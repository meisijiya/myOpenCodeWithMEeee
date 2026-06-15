---
name: xlsx
description: "Use this skill any time a .xlsx file is involved in any way — as input, output, or both. This includes: creating spreadsheets, data tables, or reports; reading, parsing, or extracting data from any .xlsx file; editing, modifying, or updating existing spreadsheets; combining or splitting spreadsheet files; working with formulas, charts, or formatting. Trigger whenever the user mentions 'spreadsheet', 'Excel', or references a .xlsx filename. If a .xlsx file needs to be opened, created, or touched, use this skill."
source: "anthropics/skills"
importedBy: "ohMeisijiyaCode v2.3"
---

# XLSX Skill

## Quick Reference

| Task | Guide |
|------|-------|
| Read/extract data | `python -m markitdown spreadsheet.xlsx` |
| Edit existing | Use `openpyxl` |
| Create from scratch | Use `openpyxl` or `pandas` |

---

## Reading Content

```bash
# Text extraction (requires markitdown)
python -m markitdown spreadsheet.xlsx

# With pandas for structured data
python -c "import pandas as pd; df = pd.read_excel('spreadsheet.xlsx'); print(df.to_string())"
```

---

## Editing Workflow

1. Read the existing spreadsheet
2. Identify sheets/cells to modify
3. Use `openpyxl` to make changes
4. Save and verify

---

## Creating from Scratch

```python
import openpyxl

wb = openpyxl.Workbook()
ws = wb.active
ws['A1'] = 'Name'
ws['B1'] = 'Age'
ws['A2'] = 'Alice'
ws['B2'] = 30
wb.save('output.xlsx')
```

---

## Dependencies

```bash
# Install markitdown for text extraction
pip install markitdown[xlsx]

# Install openpyxl for creating/editing
pip install openpyxl

# Install pandas for data analysis
pip install pandas
```

---

## QA (Required)

After processing, verify:
1. Data extraction is complete
2. Formulas are preserved (if applicable)
3. Charts are properly extracted (if any)
4. Formatting is maintained

If issues found, try alternative extraction methods or report to OneTwo.
