import React, { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Wallet, UserPlus, Award, FileText, Bell, Trash2 } from "lucide-react";
import { Notif } from "@/types";
import { Btn, Card, ConfirmDialog, EmptyState } from "@/components/shared";
import { API_ENABLED } from "@/api/config";
import { notificationsService, feesService } from "@/api/services";
import { ApiError } from "@/api/client";

export interface NotificationsPageProps {
  items: Notif[];
  setItems: Dispatch<SetStateAction<Notif[]>>;
}

export function NotificationsPage({ items, setItems }: NotificationsPageProps) {
  const [deleteTarget, setDeleteTarget] = useState<Notif | null>(null);
  const unread = items.filter(n => !n.read).length;

  const markRead = async (id: number) => {
    try {
      if (API_ENABLED) await notificationsService.markRead(id);
      setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      if (API_ENABLED) await notificationsService.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to mark all as read");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (API_ENABLED) await notificationsService.remove(deleteTarget.id);
      setItems(prev => prev.filter(n => n.id !== deleteTarget.id));
      toast.success("Notification deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete notification");
    }
  };

  const sendReminder = async () => {
    try {
      if (API_ENABLED) await feesService.sendReminders();
      toast.success("Reminder sent!", {
        description: "All fee-due students have been notified.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send reminders");
    }
  };

  const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
    fee: { icon: Wallet, color: "bg-red-100 text-red-600" },
    admission: { icon: UserPlus, color: "bg-blue-100 text-blue-600" },
    completion: { icon: Award, color: "bg-emerald-100 text-emerald-600" },
    exam: { icon: FileText, color: "bg-violet-100 text-violet-600" },
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unread} unread notification{unread !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm" onClick={markAllRead}>
            Mark all read
          </Btn>
          <Btn size="sm" onClick={sendReminder}>
            <Bell size={13} /> Send Reminder
          </Btn>
        </div>
      </div>
      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up. New alerts will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.admission;
            const Icon = cfg.icon;
            return (
              <Card key={n.id} className={`p-4 transition-all ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                      {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(n)}
                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors bg-transparent border-0 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Notification"
          message={`Remove "${deleteTarget.title}"?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default NotificationsPage;
