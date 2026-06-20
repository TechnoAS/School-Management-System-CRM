import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Plus,
  Phone,
  Mail,
  Star,
  Eye,
  Edit2,
  Download,
  Printer,
  Trash2,
} from "lucide-react";
import { FacultyMember, Course, AttnStatus } from "@/types";
import {
  SectionHeader,
  Btn,
  Card,
  AvatarChip as Avatar,
  StatusBadge as Badge,
  ConfirmDialog,
} from "@/components/shared";
import { genId, handleExport, TODAY, FMT } from "@/lib/utils";
import { resolveUploadUrl } from "@/lib/uploads";
import { FacultyFormModal } from "./FacultyFormModal";
import { FacultyProfileModal, FacultyTodayBadge } from "./FacultyProfileModal";
import { SalarySlipModal } from "./SalarySlipModal";
import { FacultyAttendanceModal } from "./FacultyAttendanceModal";
import { API_ENABLED } from "@/api/config";
import { facultyService } from "@/api/services/faculty.service";
import { ApiError } from "@/api/client";

const FACULTY_BASE_DAYS = 24;

export interface FacultyPageProps {
  faculty: FacultyMember[];
  setFaculty: Dispatch<SetStateAction<FacultyMember[]>>;
  courses: Course[];
}

export function FacultyPage({ faculty, setFaculty, courses }: FacultyPageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [profileTarget, setProfileTarget] = useState<FacultyMember | null>(null);
  const [editTarget, setEditTarget] = useState<FacultyMember | null>(null);
  const [slipTarget, setSlipTarget] = useState<FacultyMember | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacultyMember | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (API_ENABLED) await facultyService.remove(deleteTarget.id);
      setFaculty(prev => prev.filter(f => f.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} removed from faculty`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete faculty");
    }
  };

  const handleMarkAttendance = (marks: Record<string, AttnStatus>, date: string) => {
    setFaculty(prev =>
      prev.map(f => {
        const status = marks[f.id] ?? "present";
        const stamped = { ...f, todayStatus: status, todayDate: date };
        if (status === "leave") return stamped; // excused — does not affect the ratio
        const present = Math.round((f.attendance / 100) * FACULTY_BASE_DAYS);
        const newPresent = present + (status === "present" ? 1 : 0);
        const newTotal = FACULTY_BASE_DAYS + 1;
        return { ...stamped, attendance: Math.round((newPresent / newTotal) * 100) };
      })
    );
    const present = Object.values(marks).filter(s => s === "present").length;
    toast.success("Faculty attendance recorded", {
      description: `${present}/${faculty.length} present on ${date}`,
    });
    setShowAttendance(false);
  };

  const handleAdd = async (data: Omit<FacultyMember, "id" | "attendance">) => {
    const id = genId("FAC", faculty);
    try {
      if (API_ENABLED) {
        const member = await facultyService.create(data, id);
        setFaculty(prev => [{ ...member, attendance: 100 }, ...prev]);
      } else {
        setFaculty(prev => [{ id, attendance: 100, ...data }, ...prev]);
      }
      toast.success(`${data.name} added to faculty!`);
      setShowAdd(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add faculty");
    }
  };

  const handleEdit = async (data: Omit<FacultyMember, "id" | "attendance">) => {
    if (!editTarget) return;
    try {
      if (API_ENABLED) {
        const member = await facultyService.update(editTarget.id, data);
        setFaculty(prev =>
          prev.map(f => (f.id === editTarget.id ? { ...f, ...member } : f))
        );
      } else {
        setFaculty(prev => prev.map(f => (f.id === editTarget.id ? { ...f, ...data } : f)));
      }
      toast.success("Faculty record updated.");
      setEditTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update faculty");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Faculty Management"
        subtitle={
          faculty.some(f => f.todayDate === TODAY)
            ? `${faculty.length} faculty · ${
                faculty.filter(f => f.todayDate === TODAY && f.todayStatus === "present").length
              } available today`
            : `${faculty.length} faculty members · attendance not marked today`
        }
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={() => setShowAttendance(true)}>
              <ClipboardCheck size={14} /> Mark Attendance
            </Btn>
            <Btn onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Faculty
            </Btn>
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
        {faculty.map(f => (
          <Card key={f.id} className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <Avatar
                name={f.name}
                size="lg"
                src={f.photo ? resolveUploadUrl(f.photo) : undefined}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{f.name}</h3>
                <p className="text-xs text-muted-foreground">{f.subject}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{f.id}</p>
              </div>
            </div>
            <div className="mb-3">
              <FacultyTodayBadge member={f} />
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={11} /> {f.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail size={11} /> {f.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star size={11} /> {f.experience} · {f.qualification}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Salary</p>
                <p className="text-xs font-bold text-foreground">
                  ₹{(f.salary / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Attend.</p>
                <p
                  className={`text-xs font-bold ${
                    f.attendance >= 95
                      ? "text-emerald-600"
                      : f.attendance >= 85
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {f.attendance}%
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Batches</p>
                <p className="text-xs font-bold text-foreground">2</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Btn
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setProfileTarget(f)}
              >
                <Eye size={11} /> Profile
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setEditTarget(f)}
              >
                <Edit2 size={11} /> Edit
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(f)}
              >
                <Trash2 size={11} />
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Salary Records –{" "}
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <Btn variant="secondary" size="sm" onClick={() =>
              handleExport(
                "Salary Records",
                faculty.map(f => ({
                  "Faculty ID": f.id,
                  Name: f.name,
                  Subject: f.subject,
                  Attendance: `${f.attendance}%`,
                  "Monthly Salary": f.salary,
                  Status: "Paid",
                }))
              )
            }>
            <Download size={13} /> Export
          </Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                {[
                  "Faculty ID",
                  "Name",
                  "Designation",
                  "Attendance",
                  "Monthly Salary",
                  "Status",
                  "Action",
                ].map(h => (
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
              {faculty.map((f, i) => (
                <tr
                  key={f.id}
                  className={`border-t border-border/50 hover:bg-muted/20 ${
                    i % 2 !== 0 ? "bg-muted/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={f.name}
                        size="sm"
                        src={f.photo ? resolveUploadUrl(f.photo) : undefined}
                      />
                      <span className="text-sm font-semibold text-foreground">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {f.subject.split(" ")[0]} Trainer
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${f.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{f.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">
                    {FMT.format(f.salary)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status="Paid" />
                  </td>
                  <td className="px-4 py-3">
                    <Btn size="sm" variant="secondary" onClick={() => setSlipTarget(f)}>
                      <Printer size={11} /> Slip
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <FacultyFormModal
          title="Add New Faculty"
          courses={courses}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editTarget && (
        <FacultyFormModal
          title="Edit Faculty"
          initial={editTarget}
          courses={courses}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {profileTarget && (
        <FacultyProfileModal
          member={profileTarget}
          onEdit={() => {
            setEditTarget(profileTarget);
            setProfileTarget(null);
          }}
          onUpdate={updated => {
            setProfileTarget(updated);
            setFaculty(prev => prev.map(item => (item.id === updated.id ? updated : item)));
          }}
          onClose={() => setProfileTarget(null)}
        />
      )}
      {slipTarget && <SalarySlipModal member={slipTarget} onClose={() => setSlipTarget(null)} />}
      {showAttendance && (
        <FacultyAttendanceModal
          faculty={faculty}
          onSave={handleMarkAttendance}
          onClose={() => setShowAttendance(false)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Remove Faculty"
          message={`Remove ${deleteTarget.name} from the faculty list?`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default FacultyPage;
