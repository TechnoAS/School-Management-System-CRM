import { getKPIs, getEnrollmentTrend, getFeeTrend, getTodayClasses, getCourseEnrollment, getStudentsReport, getAdmissionsReport, getFeesReport, getAttendanceReportAll, getFacultyReport, } from './dashboard.service.js';
import { NotFoundError } from '../../shared/errors/app-error.js';
export async function stats(_req, res, next) {
    try {
        const kpis = await getKPIs();
        res.status(200).json({
            success: true,
            data: kpis,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function enrollmentTrend(_req, res, next) {
    try {
        const trend = await getEnrollmentTrend();
        res.status(200).json({
            success: true,
            data: trend,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function feeTrend(_req, res, next) {
    try {
        const trend = await getFeeTrend();
        res.status(200).json({
            success: true,
            data: trend,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function todayClasses(_req, res, next) {
    try {
        const classes = await getTodayClasses();
        res.status(200).json({
            success: true,
            data: classes,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function courseEnrollment(_req, res, next) {
    try {
        const data = await getCourseEnrollment();
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
}
// --- Report Handlers ---
export async function reportStudents(_req, res, next) {
    try {
        const data = await getStudentsReport();
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function reportAdmissions(_req, res, next) {
    try {
        const data = await getAdmissionsReport();
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function reportFees(_req, res, next) {
    try {
        const data = await getFeesReport();
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function reportFeesDue(_req, res, next) {
    try {
        const data = await getFeesReport();
        const filtered = data.filter((row) => row.feesDue > 0);
        res.status(200).json({
            success: true,
            data: filtered,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function reportAttendance(_req, res, next) {
    try {
        const data = await getAttendanceReportAll();
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function reportFaculty(_req, res, next) {
    try {
        const data = await getFacultyReport();
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
}
// --- CSV Export Helper ---
function jsonToCSV(data) {
    if (data.length === 0)
        return '';
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const valueRows = data.map((row) => headers
        .map((header) => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        const stringified = typeof val === 'object' ? JSON.stringify(val) : String(val);
        const escaped = stringified.replace(/"/g, '""');
        return `"${escaped}"`;
    })
        .join(','));
    return [headerRow, ...valueRows].join('\r\n');
}
export async function exportCSV(req, res, next) {
    try {
        const { type } = req.params;
        let data = [];
        switch (type) {
            case 'students':
                data = await getStudentsReport();
                break;
            case 'faculty':
                data = await getFacultyReport();
                break;
            case 'fees':
                data = await getFeesReport();
                break;
            case 'admissions':
                data = await getAdmissionsReport();
                break;
            default:
                throw new NotFoundError(`Export type "${type}" not supported`);
        }
        const csvContent = jsonToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=report-${type}-${Date.now()}.csv`);
        res.status(200).send(csvContent);
    }
    catch (error) {
        next(error);
    }
}
