import { GraduationCap, Printer } from "lucide-react";
import { Payment, Student, InstituteSettings } from "@/types";
import { Modal, Btn } from "@/components/shared";
import { FMT, handlePrint } from "@/lib/utils";
import { resolveUploadUrl } from "@/lib/uploads";

export interface FeeReceiptModalProps {
  receipt: Payment;
  student: Student | undefined;
  settings: InstituteSettings;
  onClose: () => void;
}

export function FeeReceiptModal({ receipt, student, settings, onClose }: FeeReceiptModalProps) {
  const logoUrl = resolveUploadUrl(settings.logoUrl);
  const showLogo = settings.receipt.showLogo?.toLowerCase() !== "no";
  return (
    <Modal title="Fee Receipt" onClose={onClose}>
      <div className="border border-border rounded-xl p-6 bg-muted/10">
        <div className="text-center mb-4 pb-4 border-b border-border">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2 overflow-hidden">
            {showLogo && logoUrl ? (
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <GraduationCap size={18} className="text-white" />
            )}
          </div>
          <h2 className="text-base font-bold text-foreground">{settings.name}</h2>
          {settings.address && (
            <p className="text-xs text-muted-foreground">{settings.address}</p>
          )}
          {(settings.phone || settings.email) && (
            <p className="text-xs text-muted-foreground">
              {[settings.phone, settings.email].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Fee Receipt</h3>
          <div className="text-right">
            <p className="font-mono text-xs font-bold text-primary">{receipt.receipt}</p>
            <p className="text-xs text-muted-foreground">Date: {receipt.date}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div>
            <span className="text-muted-foreground">Student:</span>{" "}
            <span className="font-semibold">{receipt.student}</span>
          </div>
          <div>
            <span className="text-muted-foreground">ID:</span>{" "}
            <span className="font-mono font-semibold">{receipt.studentId}</span>
          </div>
          {student && (
            <>
              <div>
                <span className="text-muted-foreground">Course:</span>{" "}
                <span className="font-semibold">{student.course}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Batch:</span>{" "}
                <span className="font-semibold">{student.batch}</span>
              </div>
            </>
          )}
        </div>
        <table className="w-full text-xs border border-border rounded-lg overflow-hidden mb-3">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-2.5 border-b border-border">Description</th>
              <th className="text-right p-2.5 border-b border-border">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2.5 border-b border-border/50">Course Fee Payment</td>
              <td className="text-right p-2.5 border-b border-border/50 font-semibold">
                {FMT.format(receipt.amount)}
              </td>
            </tr>
            <tr className="bg-muted/10 font-bold">
              <td className="p-2.5">Total Paid</td>
              <td className="text-right p-2.5">{FMT.format(receipt.amount)}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-center text-muted-foreground">
          Mode: {receipt.mode}
          {settings.receipt.footerText ? ` · ${settings.receipt.footerText}` : " · Thank you for your payment!"}
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Btn variant="secondary" onClick={onClose}>
          Close
        </Btn>
        <Btn onClick={handlePrint}>
          <Printer size={14} /> Print Receipt
        </Btn>
      </div>
    </Modal>
  );
}
