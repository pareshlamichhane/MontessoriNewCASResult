document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    const className = params.get("class") || "UKG";
    const term = params.get("term") || "First";
    const year = params.get("year") || "2083";

    const filename = `${className}_${year}_${term}_Result.json`;

    fetch(`exports/${encodeURIComponent(filename)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error("JSON root must be an array of students.");
            }

            renderCASAll(data);
        })
        .catch(error => {
            console.error(error);

            document.getElementById("resultContainer").innerHTML = `
                <div class="empty-state">
                    <h2>Unable to load result data</h2>
                    <p>${escapeHtml(error.message)}</p>
                    <p>Expected file: <strong>exports/${escapeHtml(filename)}</strong></p>
                    <p>Try: <strong>index.html?class=UKG&term=First&year=2083</strong></p>
                </div>
            `;
        });
});

// Mapping rule for grade marks
const MARK_MAP = {
    "ap": "A+",
    "a": "A",
    "bp": "B+",
    "b": "B",
    "cp": "C+",
    "c": "C",
    "dp": "D+",
    "d": "D"
};

// Map grade letters to fixed auto-generated remarks
const REMARK_MAP = {
    "A+": "Outstanding Progress",
    "A": "Excellent Progress",
    "B+": "Very Good Progress",
    "B": "Satisfactory Progress",
    "C+": "Developing with Guidance",
    "C": "Developing with Guidance",
    "D+": "Requires Guidance",
    "D": "Requires Guidance"
};

/**
 * Standardizes letter marks (e.g., "ap" -> "A+").
 * If the mark is missing or empty, defaults to lowest grade ("D").
 */
function normalizeMark(val) {
    if (!val || String(val).trim() === "") {
        return "D"; // Default lowest grade if missing
    }
    const key = String(val).trim().toLowerCase();
    return MARK_MAP[key] || String(val);
}

/**
 * Automatically calculates subject/competency remark based on grade.
 * Uses lowest grade remark fallback if grade is missing or unrecognized.
 */
function getRemarkByGrade(gradeVal) {
    const normalized = normalizeMark(gradeVal);
    return REMARK_MAP[normalized] || "Requires Guidance";
}

// Formats attendance to always include '%' symbol
function formatAttendance(val) {
    if (val === undefined || val === null) return "";
    const str = String(val).trim();
    if (str === "") return "";
    return str.endsWith("%") ? str : `${str}%`;
}

// Formats teacher comment box to display ✍︎ symbol when empty
function formatComment(val) {
    if (!val || String(val).trim() === "" || String(val).trim() === "[emptyblock]") {
        return "✍︎";
    }
    return String(val);
}

function renderCASAll(students) {
    const container = document.getElementById("resultContainer");
    container.innerHTML = "";

    students.forEach((student, index) => {
        container.insertAdjacentHTML("beforeend", renderStudent(student, index));
    });
}

function renderStudent(student, studentIndex) {
    const school = student.school || {};
    const info = student.studentInfo || {};
    const summary = student.summary || {};

    const schoolName = school.name || "Narayani Kids Zone Montessori Pre School";
    const location = school.location || "Bharatpur-21, Chitwan";
    const contact = school.contact || "";
    const session = info.academic_year || "2083 B.S.";
    const title = info.exam_title || "First Terminal Examination";

    const learningAreas = Array.isArray(student.learningAreas)
        ? student.learningAreas
        : [];

    const development = Array.isArray(student.development)
        ? student.development
        : [];

    const gradingScale = Array.isArray(student.gradingScale)
        ? student.gradingScale
        : [];

    const learningRows = renderLearningRows(learningAreas);
    const developmentRows = renderDevelopmentRows(development);
    const gradingRows = renderGradingRows(gradingScale);
    const summaryRows = renderSummary(summary);

    const teacherComment = formatComment(student.remarks);

    return `
        <article class="report-page">

            <header class="report-header">
                <div class="school-name">${escapeHtml(schoolName)}</div>

                ${location ? `
                    <div class="school-meta">${escapeHtml(location)}</div>
                ` : ""}

                ${contact ? `
                    <div class="school-meta">${escapeHtml(contact)}</div>
                ` : ""}

                <div class="report-session">
                    Academic Session ${escapeHtml(session)}
                </div>

                <div class="report-title">
                    ${escapeHtml(title)}
                </div>
            </header>

            <table class="info-table">
                <tbody>
                    <tr>
                        <td class="info-label name-label">Student's Name</td>
                        <td class="info-value name-value" colspan="3">${escapeHtml(student.name || "")}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Class</td>
                        <td class="info-value">${escapeHtml(student.grade || "")}</td>
                        <td class="info-label">Roll No.</td>
                        <td class="info-value">${escapeHtml(student.roll || "")}</td>
                    </tr>
                </tbody>
            </table>

            <div class="section-heading">Learning Area Assessment</div>

            <table class="assessment-table">
                <thead>
                    <tr>
                        <th class="sn">S.N.</th>
                        <th class="area">Learning Area</th>
                        <th class="competency">Competency</th>
                        <th class="grade">Grade</th>
                        <th class="remark">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${learningRows}
                </tbody>
            </table>

            ${development.length ? `
                <div class="section-heading">Social & Personal Development</div>
                <table class="assessment-table">
                    <thead>
                        <tr>
                            <th class="sn">S.N.</th>
                            <th class="area">Development Area</th>
                            <th class="competency">Competency / Behaviour</th>
                            <th class="grade">Grade</th>
                            <th class="remark">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${developmentRows}
                    </tbody>
                </table>
            ` : ""}

            ${(gradingScale.length || Object.keys(summary).length) ? `
                <div class="bottom-summary-grid">

                    ${gradingScale.length ? `
                        <div class="summary-panel grading-panel">
                            <div class="section-heading">Grading Scale</div>
                            <table class="scale-table">
                                <thead>
                                    <tr>
                                        <th>Grade</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${gradingRows}
                                </tbody>
                            </table>
                        </div>
                    ` : ""}

                    ${Object.keys(summary).length ? `
                        <div class="summary-panel overall-panel">
                            <div class="section-heading">Overall Performance</div>
                            <table class="summary-table">
                                <tbody>
                                    ${summaryRows}
                                </tbody>
                            </table>
                        </div>
                    ` : ""}

                </div>
            ` : ""}

            <div class="section-heading comment-heading">Class Teacher's Comment</div>
            <div class="comment-box">
                ${escapeHtml(teacherComment)}
            </div>

            <table class="signature-table">
                <tbody>
                    <tr>
                        <td>
                            <div class="signature-line"></div>
                            <div class="signature-name">Parent's Signature</div>
                        </td>
                        <td>
                            <div class="signature-line"></div>
                            <div class="signature-name">Class Teacher</div>
                        </td>
                        <td>
                            <div class="signature-line"></div>
                            <div class="signature-name">Principal</div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </article>
    `;
}

function renderLearningRows(learningAreas) {
    let rows = "";
    let areaNumber = 0;

    learningAreas.forEach(area => {
        const competencies = Array.isArray(area.competencies)
            ? area.competencies
            : [];

        if (!competencies.length) {
            return;
        }

        areaNumber++;

        competencies.forEach((item, index) => {
            const grade = normalizeMark(item.grade);
            const remark = getRemarkByGrade(item.grade);

            rows += `
                <tr>
                    ${index === 0 ? `
                        <td class="sn" rowspan="${competencies.length}">
                            ${areaNumber}
                        </td>
                        <td class="area" rowspan="${competencies.length}">
                            ${escapeHtml(area.area || "")}
                        </td>
                    ` : ""}

                    <td class="competency">
                        ${escapeHtml(item.name || "")}
                    </td>

                    <td class="grade ${gradeClass(grade)}">
                        ${escapeHtml(grade)}
                    </td>

                    <td class="remark">
                        ${escapeHtml(remark)}
                    </td>
                </tr>
            `;
        });
    });

    return rows || `
        <tr>
            <td colspan="5" style="text-align:center;padding:12px;">
                No learning area assessment data available.
            </td>
        </tr>
    `;
}

function renderDevelopmentRows(development) {
    return development.map((item, index) => {
        const grade = normalizeMark(item.grade);
        const remark = getRemarkByGrade(item.grade);

        return `
            <tr>
                <td class="sn">${index + 1}</td>
                <td class="area">${escapeHtml(item.area || "")}</td>
                <td class="competency">${escapeHtml(item.name || item.competency || item.area || "")}</td>
                <td class="grade ${gradeClass(grade)}">
                    ${escapeHtml(grade)}
                </td>
                <td class="remark">${escapeHtml(remark)}</td>
            </tr>
        `;
    }).join("");
}

function renderGradingRows(gradingScale) {
    return gradingScale.map(item => `
        <tr>
            <td>${escapeHtml(item.grade || "")}</td>
            <td>${escapeHtml(item.description || "")}</td>
        </tr>
    `).join("");
}

function renderSummary(summary) {
    return Object.entries(summary).map(([key, value]) => {
        let displayValue = String(value ?? "");

        if (key.toLowerCase().includes("grade") || key.toLowerCase().includes("mark")) {
            displayValue = normalizeMark(displayValue);
        } else if (key.toLowerCase().includes("attendance")) {
            displayValue = formatAttendance(displayValue);
        }

        return `
            <tr>
                <th>${escapeHtml(formatLabel(key))}</th>
                <td class="${key.toLowerCase().includes("grade") ? "overall-grade" : ""}">
                    ${escapeHtml(displayValue)}
                </td>
            </tr>
        `;
    }).join("");
}

function formatLabel(key) {
    return String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, char => char.toUpperCase());
}

function gradeClass(grade) {
    return `grade-${String(grade).toLowerCase().replace("+", "-plus")}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}