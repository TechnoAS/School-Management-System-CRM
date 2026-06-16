import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Bell, Download, Wallet, Printer } from "lucide-react";
import { Payment, Student } from "@/types";
import { TODAY, handleExport, FMT } from "@/lib/utils";
import {
  SectionHeader,
  Tabs,
  Card,
  FormField,
  Btn,
  AvatarChip as Avatar,
  inputCls,
  selectCls,
} from "@/components/shared";
import { FeeReceiptModal } from "./FeeReceiptModal";

export interface FeesPageProps {
  students: Student[];
  setStudents: Dispatch<SetStateAction<Student[]>>;
  payments: Payment[];
  addPayment: (payment: Payment) => void;
}

export function FeesPage({ students, setStudents, payments, addPayment }: FeesPageProps) {
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

  const handleCollect = () => {
    const student = students.find(s => s.id === cf.studentId);
    if (!student) {
      toast.error("Please select a student");
      return;
    }
    const amount = parseInt(cf.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const due = student.feesTotal - student.feesPaid;
    if (amount > due) {
      toast.error(`Amount exceeds due balance of ${FMT.format(due)}`);
      return;
    }

    const newPayment: Payment = {
      receipt: `RCP-${Date.now()}`,
      student: student.name,
      studentId: student.id,
      amount,
      mode: cf.mode,
      date: cf.date,
      remarks: cf.remarks || undefined,
    };
    setStudents(prev =>
      prev.map(s => (s.id === student.id ? { ...s, feesPaid: s.feesPaid + amount } : s))
    );
    addPayment(newPayment);
    toast.success(`Fee collected from ${student.name}`, {
      description: `${FMT.format(amount)} via ${cf.mode}`,
    });
    setReceiptModal(newPayment);
    setCollectForm({ studentId: "", amount: "", mode: "Cash", date: TODAY, remarks: "" });
  };

  const openCollectForStudent = (studentId: string) => {
    setCollectForm(p => ({ ...p, studentId }));
    setTab("collection");
    toast.info("Student pre-selected in collect form.");
  };

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
          <p className="text-xs text-muted-foreground mt-0.5">This academic year</p>
        </Card>
      </div>

      <Tabs
        tabs={[
          { id: "collection", label: "Collect Fee" },
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
            <h3 className="text-sm font-semibold mb-4 text-foreground">Installment Tracker</h3>
            <div className="space-y-3">
              {students.slice(0, 5).map(s => {
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

      {tab === "due" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Students with Due Fees</h3>
            <div className="flex gap-2">
              <Btn
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.success("Reminders sent!", {
                    description: `${dueStudents.length} students notified via SMS.`,
                  })
                }
              >
                <Bell size={13} /> Send Reminders
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => handleExport("Due List")}>
                <Download size={13} /> Export
              </Btn>
            </div>
          </div>
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
                        <Btn
                          size="sm"
                          variant="ghost"
                          onClick={() => toast.success(`Reminder sent to ${s.name}`)}
                        >
                          <Bell size={11} />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "history" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Payment History ({payments.length} transactions)
            </h3>
            <Btn variant="secondary" size="sm" onClick={() => handleExport("Payment History")}>
              <Download size={13} /> Export
            </Btn>
          </div>
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
        </Card>
      )}

      {receiptModal && (
        <FeeReceiptModal
          receipt={receiptModal}
          student={students.find(s => s.id === receiptModal.studentId)}
          onClose={() => setReceiptModal(null)}
        />
      )}
    </div>
  );
}

export default FeesPage;
