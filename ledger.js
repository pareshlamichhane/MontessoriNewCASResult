document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const className = params.get("class") || "LKG";
    const term = params.get("term") || "First";
    const year = params.get("year") || "2083";

    const filename = `${className}_${year}_${term}_Result.json`;

    fetch(`exports/${encodeURIComponent(filename)}`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${filename}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error("JSON data must be a non-empty array of students.");
            }
            renderLedger(data);
        })
        .catch(error => {
            console.error(error);
            document.getElementById("ledgerContainer").innerHTML = `
                <div class="empty-state">
                    <h2>Unable to load ledger data</h2>
                    <p>${escapeHtml(error.message)}</p>
                    <p>Expected file: <strong>exports/${escapeHtml(filename)}</strong></p>
                </div>
            `;
        });
});

const MARK_MAP = {
    "ap": "A+", "a": "A", "bp": "B+", "b": "B",
    "cp": "C+", "c": "C", "dp": "D+", "d": "D"
};

function normalizeMark(val) {
    if (!val || String(val).trim() === "") return "-";
    const key = String(val).trim().toLowerCase();
    return MARK_MAP[key] || String(val);
}

function renderLedger(students) {
    const container = document.getElementById("ledgerContainer");
    const meta = students[0];
    const school = meta.school || {};
    const info = meta.studentInfo || {};

    // 1. Build dynamic columns from learningAreas across all students
    const areaMap = new Map();
    students.forEach(student => {
        (student.learningAreas || []).forEach(areaObj => {
            const areaName = areaObj.area || "General";
            if (!areaMap.has(areaName)) {
                areaMap.set(areaName, new Set());
            }
            (areaObj.competencies || []).forEach(comp => {
                areaMap.get(areaName).add(comp.name);
            });
        });
    });

    // Calculate total columns span to let the main header span across full table width
    let totalColumns = 2 + 2; // Roll + Name + Overall Grade + Attendance
    areaMap.forEach((competenciesSet) => {
        totalColumns += competenciesSet.size;
    });

    // 2. Build Table Headers
    let headerRow1 = `<tr><th rowspan="2" class="roll-col">Roll</th><th rowspan="2" class="name-col">Student Name</th>`;
    let headerRow2 = `<tr>`;

    areaMap.forEach((competenciesSet, areaName) => {
        const compArray = Array.from(competenciesSet);
        headerRow1 += `<th colspan="${compArray.length}" class="area-header">${escapeHtml(areaName)}</th>`;
        compArray.forEach(compName => {
            headerRow2 += `<th class="comp-header"><div><span>${escapeHtml(compName)}</span></div></th>`;
        });
    });

    headerRow1 += `<th rowspan="2" class="summary-col">Overall Grade</th><th rowspan="2" class="summary-col">Attendance</th></tr>`;
    headerRow2 += `</tr>`;

    // 3. Build Table Body Rows
    let bodyRows = "";
    students.forEach((student) => {
        const studentMarks = {};
        (student.learningAreas || []).forEach(areaObj => {
            (areaObj.competencies || []).forEach(comp => {
                studentMarks[`${areaObj.area}_${comp.name}`] = normalizeMark(comp.grade);
            });
        });

        bodyRows += `
            <tr>
                <td class="text-center">${escapeHtml(student.roll || "")}</td>
                <td class="text-left student-name">${escapeHtml(student.name || "")}</td>
        `;

        areaMap.forEach((competenciesSet, areaName) => {
            competenciesSet.forEach(compName => {
                const markKey = `${areaName}_${compName}`;
                const grade = studentMarks[markKey] || "-";
                bodyRows += `<td class="text-center grade-cell">${escapeHtml(grade)}</td>`;
            });
        });

        const overall = normalizeMark(student.summary?.overallGrade);
        const attendance = student.summary?.attendance ? `${student.summary.attendance}%` : "-";

        bodyRows += `
                <td class="text-center overall-cell">${escapeHtml(overall)}</td>
                <td class="text-center">${escapeHtml(attendance)}</td>
            </tr>
        `;
    });

    // 4. Render Layout
// Output Ledger HTML
container.innerHTML = `
    <article class="ledger-page">
        <table class="ledger-table">
            <thead>
                <tr class="school-title-row">
                    <th colspan="${totalColumns}">
                        <div class="school-name-text">${escapeHtml(school.name || "Narayani Kids Zone Montessori Pre School")}</div>
                        <div class="school-location-text">${escapeHtml(school.location || "")}</div>
                    </th>
                </tr>
                <tr class="school-meta-row">
                    <th colspan="${totalColumns}">
                        <div class="register-title">Tabulation Register / Master Ledger Sheet</div>
                        <div class="ledger-meta-bar">
                            <span><strong>Class:</strong> ${escapeHtml(meta.grade || "")}</span> | 
                            <span><strong>Academic Session:</strong> ${escapeHtml(info.academic_year || "")}</span> | 
                            <span><strong>Exam:</strong> ${escapeHtml(info.exam_title || info.term || "")}</span>
                        </div>
                    </th>
                </tr>
                ${headerRow1}
                ${headerRow2}
            </thead>
            <tbody>
                ${bodyRows}
            </tbody>
        </table>

        <table class="ledger-signatures">
            <tr>
                <td><div class="sig-line"></div>Class Teacher</td>
                <td><div class="sig-line"></div>Principal</td>
            </tr>
        </table>
    </article>
`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
