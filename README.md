# Montessori CAS Result Sheet

## Files
- index.html
- style.css
- app.js
- exports/UKG_2083_First_Result.json

## Run
Because the app uses `fetch()` to load JSON, open it through a local web server rather than directly with `file://`.

Example with VS Code Live Server, or:
python -m http.server 8000

Then visit:
http://localhost:8000/index.html?class=UKG&term=First&year=2083

The renderer is data-driven. Student information, learning areas, competencies, grades, remarks, grading scale, summary and teacher comment are read from JSON.

## Latest layout updates
- Removed the Term cell because the examination title already identifies the term.
- Grading Scale heading is restricted to the grading-scale table width.
- Removed the footer.
- Each printed student report is constrained to one A4 portrait page.
- Removed explanatory text below signature labels.

## Layout update v3
- Student name occupies its own full-width information row.
- Class and Roll No. share the second information row.
- Academic Session was removed from the student information cells.
- Grading Scale and Overall Performance are now positioned side-by-side at the same vertical level.
- Additional spacing is provided between the assessment table and the bottom summary area.

## Layout update v4
- A4 report now uses approximately 1 inch margins on all four sides.
- Increased vertical spacing between the information, assessment, grading/overall, comment, and signature sections.
- The report remains constrained to one A4 page per student when printed.

## Layout update v5
- Reduced A4 outer margins from 1 inch to 0.5 inch.
- Increased vertical breathing room between major sections.
- Increased the Class Teacher's Comment area height and padding.
- Added extra separation between the teacher's comment and signatures.
