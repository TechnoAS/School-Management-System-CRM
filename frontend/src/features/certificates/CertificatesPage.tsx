import { useState } from "react";
import { toast } from "sonner";
import { Award, Eye, Printer, GraduationCap } from "lucide-react";
import { Student, Certificate, InstituteSettings, Course, AttendanceRecord, ExamMarkRecord } from "@/types";
import { TODAY, handlePrint } from "@/lib/utils";
import { checkCertificateEligibility } from "@/lib/certificateEligibility";
import {
  SectionHeader,
  Btn,
  Card,
  AvatarChip as Avatar,
  GradeChip,
  Modal,
  FormField,
  selectCls,
  inputCls,
} from "@/components/shared";
import { API_ENABLED } from "@/api/config";
import { certificatesService, studentToCertPayload } from "@/api/services/certificates.service";
import { ApiError } from "@/api/client";

export interface CertificatesPageProps {
  students: Student[];
  courses: Course[];
  certificates: Certificate[];
  addCertificate: (certificate: Certificate) => void;
  settings: InstituteSettings;
  attendanceRecords: AttendanceRecord[];
  examMarks: ExamMarkRecord[];
}

export function CertificatesPage({
  students,
  courses,
  certificates,
  addCertificate,
  settings,
  attendanceRecords,
  examMarks,
}: CertificatesPageProps) {
  const [showIssue, setShowIssue] = useState(false);
  const [showPreview, setShowPreview] = useState<Certificate | null>(null);
  const [issueForm, setIssueForm] = useState({
    studentId: "",
    grade: "A",
    authorisedBy: settings.certificate.authorisedBy,
    issueDate: TODAY,
  });
  const upIF = (k: string) => (v: string) => setIssueForm(p => ({ ...p, [k]: v }));

  const selectedStudent = students.find(s => s.id === issueForm.studentId);
  const eligibility = selectedStudent
    ? checkCertificateEligibility(selectedStudent, certificates, attendanceRecords, examMarks)
    : null;

  const handleIssue = async () => {
    const student = selectedStudent;
    if (!student) {
      toast.error("Please select a student");
      return;
    }
    const check = checkCertificateEligibility(student, certificates, attendanceRecords, examMarks);
    if (!check.eligible) {
      toast.error("Student is not eligible for a certificate", {
        description: check.reasons.join(" · "),
      });
      return;
    }
    try {
      let newCert: Certificate;
      if (API_ENABLED) {
        const payload = studentToCertPayload(
          student,
          courses,
          issueForm.grade,
          issueForm.authorisedBy,
          issueForm.issueDate
        );
        newCert = await certificatesService.issue(payload);
      } else {
        const year = new Date().getFullYear();
        const seq = String(certificates.length + 1).padStart(3, "0");
        newCert = {
          certNo: `CERT-${year}-${seq}`,
          studentId: student.id,
          studentName: student.name,
          course: student.course,
          issueDate: issueForm.issueDate,
          grade: issueForm.grade,
          authorisedBy: issueForm.authorisedBy,
        };
      }
      addCertificate(newCert);
      toast.success(`Certificate issued to ${student.name}!`);
      setIssueForm({
        studentId: "",
        grade: "A",
        authorisedBy: settings.certificate.authorisedBy,
        issueDate: TODAY,
      });
      setShowIssue(false);
      setShowPreview(newCert);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to issue certificate");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Certificate Management"
        subtitle="Issue and print course completion certificates"
        action={
          <Btn onClick={() => setShowIssue(true)}>
            <Award size={14} /> Issue Certificate
          </Btn>
        }
      />
      <Card className="mb-4">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Issued Certificates ({certificates.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                {["Certificate No.", "Student", "Course", "Issue Date", "Grade", "Action"].map(h => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certificates.map((c, i) => (
                <tr
                  key={c.certNo}
                  className={`border-t border-border/50 hover:bg-muted/20 ${
                    i % 2 !== 0 ? "bg-muted/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{c.certNo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.studentName} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.studentName}</p>
                        <p className="text-xs font-mono text-muted-foreground">{c.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.course}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.issueDate}</td>
                  <td className="px-4 py-3">
                    <GradeChip grade={c.grade} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Btn size="sm" variant="secondary" onClick={() => setShowPreview(c)}>
                        <Eye size={11} /> Preview
                      </Btn>
                      <Btn size="sm" variant="secondary" onClick={handlePrint}>
                        <Printer size={11} /> Print
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showIssue && (
        <Modal title="Issue Certificate" onClose={() => setShowIssue(false)}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Select Student">
              <select
                className={selectCls}
                value={issueForm.studentId}
                onChange={e => upIF("studentId")(e.target.value)}
              >
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Grade Awarded">
              <select
                className={selectCls}
                value={issueForm.grade}
                onChange={e => upIF("grade")(e.target.value)}
              >
                <option>A+</option>
                <option>A</option>
                <option>B+</option>
                <option>B</option>
                <option>C</option>
              </select>
            </FormField>
            <FormField label="Issue Date">
              <input
                className={inputCls}
                type="date"
                value={issueForm.issueDate}
                onChange={e => upIF("issueDate")(e.target.value)}
              />
            </FormField>
            <FormField label="Authorised By">
              <input
                className={inputCls}
                value={issueForm.authorisedBy}
                onChange={e => upIF("authorisedBy")(e.target.value)}
              />
            </FormField>
          </div>
          {eligibility && issueForm.studentId && (
            <div
              className={`mt-4 p-3 rounded-lg text-xs ${
                eligibility.eligible
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {eligibility.eligible ? (
                <p>✓ Student meets all eligibility requirements.</p>
              ) : (
                <ul className="list-disc pl-4 space-y-0.5">
                  {eligibility.reasons.map(r => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
            <Btn variant="secondary" onClick={() => setShowIssue(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleIssue}>
              <Award size={14} /> Issue & Preview
            </Btn>
          </div>
        </Modal>
      )}

      {showPreview && (
        <Modal title="Certificate Preview" onClose={() => setShowPreview(null)}>
          <div
            className="relative border-4 border-primary rounded-2xl p-8 text-center overflow-hidden"
            style={{ background: "linear-gradient(135deg,#f8f7f4,#eef2f8)" }}
          >
            <div className="absolute inset-2 border border-primary/15 rounded-xl pointer-events-none" />
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <GraduationCap size={24} className="text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
              {settings.name}
            </p>
            <h1 className="text-2xl font-bold text-primary mb-1">Certificate of Completion</h1>
            <p className="text-xs text-muted-foreground mb-5">This is to certify that</p>
            <h2 className="text-xl font-bold text-foreground mb-1">{showPreview.studentName}</h2>
            <p className="text-xs font-mono text-muted-foreground mb-1">
              Student ID: {showPreview.studentId}
            </p>
            <p className="text-sm text-muted-foreground mb-4">has successfully completed the course</p>
            <div className="inline-block px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold mb-4">
              {showPreview.course}
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              with Grade <strong className="text-foreground">{showPreview.grade}</strong> · Certificate
              No. <strong className="font-mono">{showPreview.certNo}</strong>
            </p>
            <div className="flex justify-around border-t border-primary/15 pt-4">
              <div>
                <p className="text-xs font-bold text-foreground">{showPreview.issueDate}</p>
                <p className="text-xs text-muted-foreground">Issue Date</p>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{showPreview.authorisedBy}</p>
                <p className="text-xs text-muted-foreground">Authorised</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Btn variant="secondary" onClick={() => setShowPreview(null)}>
              Close
            </Btn>
            <Btn onClick={handlePrint}>
              <Printer size={14} /> Print Certificate
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CertificatesPage;
