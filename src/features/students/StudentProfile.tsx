import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Printer,
  Download,
  Edit2,
} from "lucide-react";
import { Student } from "@/types";
import {
  Card,
  AvatarChip as Avatar,
  StatusBadge as Badge,
  Btn,
} from "@/components/shared";
import { FMT, handlePrint, handleExport } from "@/lib/utils";

export function StudentProfile({
  student: s,
  onBack,
  onEdit,
}: {
  student: Student;
  onBack: () => void;
  onEdit: (s: Student) => void;
}) {
  const due = s.feesTotal - s.feesPaid;
  const pct = Math.round((s.feesPaid / s.feesTotal) * 100);
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronRight size={14} className="rotate-180" /> Back to Students
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 flex flex-col items-center text-center">
          <Avatar name={s.name} size="lg" src={s.photo} />
          <h2 className="mt-3 text-base font-semibold text-foreground">{s.name}</h2>
          <p className="text-xs font-mono text-muted-foreground mt-0.5 mb-2">{s.id}</p>
          <Badge status={s.status} />
          <div className="w-full mt-4 pt-4 border-t border-border space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone size={11} /> {s.phone}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail size={11} /> {s.email}
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin size={11} className="mt-0.5 shrink-0" /> {s.address}
            </div>
          </div>
          <div className="w-full mt-4 pt-4 border-t border-border flex gap-2">
            <Btn size="sm" className="flex-1 justify-center" onClick={handlePrint}>
              <Printer size={12} /> ID Card
            </Btn>
            <Btn
              size="sm"
              variant="secondary"
              className="flex-1 justify-center"
              onClick={() => handleExport(s.name)}
            >
              <Download size={12} /> Export
            </Btn>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-end mb-4">
            <Btn size="sm" variant="secondary" onClick={() => onEdit(s)}>
              <Edit2 size={12} /> Edit Profile
            </Btn>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Course</p>
              <p className="text-sm font-semibold text-foreground">{s.course}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Batch</p>
              <p className="text-sm font-semibold text-foreground">{s.batch}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Date of Birth</p>
              <p className="text-sm font-semibold text-foreground">{s.dob}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Admission Date</p>
              <p className="text-sm font-semibold text-foreground">{s.admissionDate}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Guardian Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Guardian Name</p>
                <p className="text-sm font-semibold text-foreground">{s.guardian}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Guardian Phone</p>
                <p className="text-sm font-semibold text-foreground">{s.guardianPhone}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Fee Summary
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Total Fees</p>
                <p className="text-base font-bold text-foreground">{FMT.format(s.feesTotal)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-emerald-600 mb-1">Paid</p>
                <p className="text-base font-bold text-emerald-700">{FMT.format(s.feesPaid)}</p>
              </div>
              <div className={`rounded-xl p-3 ${due > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                <p className={`text-xs mb-1 ${due > 0 ? "text-red-500" : "text-emerald-600"}`}>
                  {due > 0 ? "Due" : "Cleared"}
                </p>
                <p className={`text-base font-bold ${due > 0 ? "text-red-700" : "text-emerald-700"}`}>
                  {FMT.format(due)}
                </p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Payment progress</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default StudentProfile;
