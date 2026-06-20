import { Printer } from "lucide-react";
import { FacultyMember } from "@/types";
import { Modal, Btn } from "@/components/shared";
import { FMT, handlePrint } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export interface SalarySlipModalProps {
  member: FacultyMember;
  onClose: () => void;
}

export function SalarySlipModal({ member: f, onClose }: SalarySlipModalProps) {
  const instituteName = useAppStore((s) => s.settings.name);
  const month = new Date().toLocaleString("default", { month: "long", year: "numeric" });
  return (
    <Modal title="Salary Slip" onClose={onClose}>
      <div className="border border-border rounded-xl p-6 bg-muted/10">
        <div className="text-center mb-4 pb-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">{instituteName || "Institute"}</h2>
          <p className="text-xs text-muted-foreground">Salary Slip – {month}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div>
            <span className="text-muted-foreground">Name:</span> <span className="font-semibold">{f.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">ID:</span>{" "}
            <span className="font-mono font-semibold">{f.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Designation:</span>{" "}
            <span className="font-semibold">{f.subject.split(" ")[0]} Trainer</span>
          </div>
          <div>
            <span className="text-muted-foreground">Attendance:</span>{" "}
            <span className="font-semibold">{f.attendance}%</span>
          </div>
        </div>
        <table className="w-full text-xs border border-border rounded-lg overflow-hidden mb-3">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-2.5 border-b border-border">Component</th>
              <th className="text-right p-2.5 border-b border-border">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2.5 border-b border-border/50">Basic Salary</td>
              <td className="text-right p-2.5 border-b border-border/50">
                {FMT.format(Math.round(f.salary * 0.6))}
              </td>
            </tr>
            <tr>
              <td className="p-2.5 border-b border-border/50">HRA</td>
              <td className="text-right p-2.5 border-b border-border/50">
                {FMT.format(Math.round(f.salary * 0.3))}
              </td>
            </tr>
            <tr>
              <td className="p-2.5 border-b border-border/50">Conveyance</td>
              <td className="text-right p-2.5 border-b border-border/50">
                {FMT.format(Math.round(f.salary * 0.1))}
              </td>
            </tr>
            <tr className="font-bold bg-muted/10">
              <td className="p-2.5">Net Pay</td>
              <td className="text-right p-2.5 text-emerald-700">{FMT.format(f.salary)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Btn variant="secondary" onClick={onClose}>
          Close
        </Btn>
        <Btn onClick={handlePrint}>
          <Printer size={14} /> Print Slip
        </Btn>
      </div>
    </Modal>
  );
}
