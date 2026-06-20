import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Bell, Download, Wallet, Printer, ListOrdered } from "lucide-react";
import { Payment, Student, InstituteSettings, FeeReminder } from "@/types";
import { TODAY, handleExport, FMT } from "@/lib/utils";
import { nextReceiptNumber } from "@/lib/receipt";
import {
  SectionHeader,
  Tabs,
  Card,
  FormField,
  Btn,
  AvatarChip as Avatar,
  inputCls,
  selectCls,
  EmptyState,
} from "@/components/shared";
import { FeeReceiptModal } from "./FeeReceiptModal";
import { API_ENABLED } from "@/api/config";
import { feesService } from "@/api/services/fees.service";
import { ApiError } from "@/api/client";
import { feeCollectFormSchema } from "@/lib/validation/fees";
import { validateForm } from "@/lib/validation/formErrors";

export interface FeesPageProps {
  students: Student[];
  setStudents: Dispatch<SetStateAction<Student[]>>;
  payments: Payment[];
  addPayment: (payment: Payment) => void;
  settings: InstituteSettings;
  feeReminders: FeeReminder[];
  queueFeeReminders: (reminders: FeeReminder[]) => void;
}

export function FeesPage({
  students,
  setStudents,
  payments,
  addPayment,
  settings,
  feeReminders,
  queueFeeReminders,
}: FeesPageProps) {
  const [tab, setTab] = useState("collection");
  const [receiptModal, setReceiptModal] = useState<Payment | null>(null);
  const [collectForm, setCollectForm] = useState({
    studentId: "",
    amount: "",
    mode: "Cash",
    date: TODAY,
    remarks: "",
  });
  const cf = collectForm;
  const setCF = (k: string) => (v: string) => setCollectForm(p => ({ ...p, [k]: v }));

  const dueStudents = students.filter(s => s.feesPaid < s.feesTotal);
  const totalDue = dueStudents.reduce((sum, s) => sum + (s.feesTotal - s.feesPaid), 0);
  const totalPaid = students.reduce((sum, s) => sum + s.feesPaid, 0);
  const collRate = Math.round((totalPaid / (totalPaid + totalDue || 1)) * 100);
  const pendingReminders = feeReminders.filter(r => r.status === "pending");

  const queueRemindersForDue = () => {
    const queued: FeeReminder[] = dueStudents.map((s, i) => ({
      id: `REM-${s.id}-${Date.now()}-${i}`,
      studentId: s.id,
      studentName: s.name,
      amount: s.feesTotal - s.feesPaid,
      queuedAt: new Date().toISOString(),
      status: "pending" as const,
    }));
    queueFeeReminders(queued);
    toast.success("Reminders queued!", {
      description: `${queued.length} students added to the reminder queue.`,
    });
  };

  const handleCollect = async () => {
    const checked = validateForm(feeCollectFormSchema, {
      studentId: cf.studentId,
      amount: cf.amount,
      mode: cf.mode,
      date: cf.date,
      remarks: cf.remarks,
    });
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }

    const student = students.find(s => s.id === checked.data.studentId);
    if (!student) {
      toast.error("Please select a student");
      return;
    }
    const amount = checked.data.amount;
    const due = student.feesTotal - student.feesPaid;
    if (amount > due) {
      toast.error(`Amount exceeds due balance of ${FMT.format(due)}`);
      return;
    }

    try {
      let newPayment: Payment;
      if (API_ENABLED) {
        newPayment = await feesService.collect({
          studentId: student.id,
          amount,
          mode: checked.data.mode,
          payDate: checked.data.date,
          remarks: checked.data.remarks || undefined,
        });
        setStudents(prev =>
          prev.map(s => (s.id === student.id ? { ...s, feesPaid: s.feesPaid + amount } : s))
        );
      } else {
        const receipt = nextReceiptNumber(
          settings.receipt.prefix,
          settings.receipt.startingNumber,
          payments
        );
        newPayment = {
          receipt,
          student: student.name,
          studentId: student.id,
          amount,
          mode: checked.data.mode,
          date: checked.data.date,
          remarks: checked.data.remarks || undefined,
        };
        setStudents(prev =>
          prev.map(s => (s.id === student.id ? { ...s, feesPaid: s.feesPaid + amount } : s))
        );
      }
      addPayment(newPayment);
      toast.success(`Fee collected from ${student.name}`, {
        description: `${FMT.format(amount)} via ${cf.mode} · Receipt ${newPayment.receipt}`,
      });
      setReceiptModal(newPayment);
      setCollectForm({ studentId: "", amount: "", mode: "Cash", date: TODAY, remarks: "" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to collect fee");
    }
  };

  const openCollectForStudent = (studentId: string) => {
    setCollectForm(p => ({ ...p, studentId }));
    setTab("collection");
    toast.info("Student pre-selected in collect form.");
  };

  const installmentStudents = [...students].sort(
    (a, b) => a.feesPaid / a.feesTotal - b.feesPaid / b.feesTotal
  );

  return (
    <div>
      <SectionHeader title="Fee Management" subtitle="Track collections, dues, and payment history" />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Total Collected
          </p>
          <p className="text-2xl font-bold text-emerald-700">{FMT.format(totalPaid)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">From {students.length} students</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Total Due
          </p>
          <p className="text-2xl font-bold text-red-600">{FMT.format(totalDue)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">From {dueStudents.length} students</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Collection Rate
          </p>
          <p className="text-2xl font-bold text-primary">{collRate}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pendingReminders.length} reminder(s) queued
          </p>
        </Card>
      </div>

      <Tabs
        tabs={[
          { id: "collection", label: "Collect Fee" },
          { id: "installments", label: "Installments" },
          { id: "due", label: "Due List" },
          { id: "history", label: "Payment History" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "collection" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Collect Fee</h3>
            <div className="space-y-3">
              <FormField label="Student">
                <select
                  className={selectCls}
                  value={cf.studentId}
                  onChange={e => setCF("studentId")(e.target.value)}
                >
                  <option value="">Select student</option>
                  {students.map(s => {
                    const due = s.feesTotal - s.feesPaid;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                        {due > 0 ? ` — Due: ${FMT.format(due)}` : " — Cleared"}
                      </option>
                    );
                  })}
                </select>
              </FormField>
              <FormField label="Amount (₹)">
                <input
                  className={inputCls}
                  type="number"
                  value={cf.amount}
                  onChange={e => setCF("amount")(e.target.value)}
                  placeholder="Enter amount"
                />
              </FormField>
              <FormField label="Payment Mode">
                <select
                  className={selectCls}
                  value={cf.mode}
                  onChange={e => setCF("mode")(e.target.value)}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                </select>
              </FormField>
              <FormField label="Date">
                <input
                  className={inputCls}
                  type="date"
                  value={cf.date}
                  onChange={e => setCF("date")(e.target.value)}
                />
              </FormField>
              <FormField label="Remarks">
                <input
                  className={inputCls}
                  value={cf.remarks}
                  onChange={e => setCF("remarks")(e.target.value)}
                  placeholder="Optional note"
                />
              </FormField>
              <div className="flex gap-2 pt-1">
                <Btn className="flex-1 justify-center" onClick={handleCollect}>
                  <Wallet className="w-4 h-4 mr-2" /> Collect
                </Btn>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Quick Installment Preview</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {installmentStudents.slice(0, 5).map(s => {
                const due = s.feesTotal - s.feesPaid;
                const pct = Math.round((s.feesPaid / s.feesTotal) * 100);
                return (
                  <div key={s.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={s.name} size="sm" src={s.photo} />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{s.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{s.id}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold ${due > 0 ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {due > 0 ? `Due: ${FMT.format(due)}` : "Cleared ✓"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pct}% paid</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === "installments" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Installment Tracker — All Students
            </h3>
            <Btn variant="secondary" size="sm" onClick={() => setTab("installments")}>
              <ListOrdered size={13} /> {installmentStudents.length} students
            </Btn>
          </div>
          {installmentStudents.length === 0 ? (
            <EmptyState icon={Wallet} title="No students" description="Enroll students to track installments." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {installmentStudents.map(s => {
                const due = s.feesTotal - s.feesPaid;
                const pct = s.feesTotal > 0 ? Math.round((s.feesPaid / s.feesTotal) * 100) : 0;
                return (
                  <div key={s.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={s.name} size="sm" src={s.photo} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.course}</p>
                        </div>
                      </div>
                      {due > 0 ? (
                        <Btn size="sm" variant="secondary" onClick={() => openCollectForStudent(s.id)}>
                          Collect
                        </Btn>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600">Cleared</span>
                      )}
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{FMT.format(s.feesPaid)} paid</span>
                      <span>{due > 0 ? `${FMT.format(due)} due` : "100%"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {tab === "due" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Students with Due Fees</h3>
            <div className="flex gap-2">
              <Btn variant="secondary" size="sm" onClick={queueRemindersForDue}>
                <Bell size={13} /> Queue Reminders
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleExport(
                    "Due List",
                    dueStudents.map(s => ({
                      "Student ID": s.id,
                      Name: s.name,
                      Course: s.course,
                      "Total Fees": s.feesTotal,
                      Paid: s.feesPaid,
                      Due: s.feesTotal - s.feesPaid,
                    }))
                  )
                }
              >
                <Download size={13} /> Export
              </Btn>
            </div>
          </div>
          {dueStudents.length === 0 ? (
            <EmptyState icon={Wallet} title="All fees cleared" description="No outstanding dues." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    {["Student", "Course", "Total Fees", "Paid", "Due", "Action"].map(h => (
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
                  {dueStudents.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`border-t border-border/50 hover:bg-muted/20 ${i % 2 !== 0 ? "bg-muted/5" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={s.name} size="sm" src={s.photo} />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{s.name}</p>
                            <p className="text-xs font-mono text-muted-foreground">{s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{s.course}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {FMT.format(s.feesTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                        {FMT.format(s.feesPaid)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600">
                        {FMT.format(s.feesTotal - s.feesPaid)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Btn size="sm" variant="secondary" onClick={() => openCollectForStudent(s.id)}>
                            <Wallet size={11} /> Collect
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "history" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Payment History ({payments.length} transactions)
            </h3>
            <Btn
              variant="secondary"
              size="sm"
              onClick={() =>
                handleExport(
                  "Payment History",
                  payments.map(p => ({
                    Receipt: p.receipt,
                    Student: p.student,
                    "Student ID": p.studentId,
                    Amount: p.amount,
                    Mode: p.mode,
                    Date: p.date,
                  }))
                )
              }
            >
              <Download size={13} /> Export
            </Btn>
          </div>
          {payments.length === 0 ? (
            <EmptyState icon={Wallet} title="No payments yet" description="Collected fees appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    {["Receipt No.", "Student", "Amount", "Mode", "Date", "Action"].map(h => (
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
                  {payments.map((p, i) => (
                    <tr
                      key={p.receipt}
                      className={`border-t border-border/50 hover:bg-muted/20 ${i % 2 !== 0 ? "bg-muted/5" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                        {p.receipt}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{p.student}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700">
                        {FMT.format(p.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.mode}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.date}</td>
                      <td className="px-4 py-3">
                        <Btn size="sm" variant="secondary" onClick={() => setReceiptModal(p)}>
                          <Printer size={11} /> Receipt
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {receiptModal && (
        <FeeReceiptModal
          receipt={receiptModal}
          student={students.find(s => s.id === receiptModal.studentId)}
          settings={settings}
          onClose={() => setReceiptModal(null)}
        />
      )}
    </div>
  );
}

export default FeesPage;
