import { STATUS_LABELS, type LeadStatus } from "@/lib/leads";

/** Small display helpers shared by the lead inbox, lead detail and dashboard. */
export function todayLocal() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}

export function ago(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "urgent_review" ? "border-err/60 bg-err-soft text-err"
    : status === "new" ? "border-white/40 bg-black text-fg"
    : status === "closed" || status === "under_contract" ? "border-ok/50 bg-ok-soft text-ok"
    : status === "not_a_fit" || status === "spam" ? "border-line text-fg-muted"
    : "border-line-strong text-fg-2";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.75rem] font-semibold ${tone}`}>{STATUS_LABELS[status as LeadStatus] ?? status}</span>;
}

export function FollowUp({ date }: { date: unknown }) {
  if (!date) return null;
  const d = String(date);
  const today = todayLocal();
  const cls = d < today ? "text-err" : d === today ? "text-warn" : "text-fg-muted";
  return <span className={`text-[0.8rem] font-semibold ${cls}`}>Follow up {d < today ? "overdue" : d === today ? "today" : d}</span>;
}

