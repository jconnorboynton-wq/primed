import type { Metadata } from "next";
import Link from "next/link";
import { isOwner } from "@/lib/auth";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Owner admin | Primed Real Estate", robots: { index: false, follow: false } };

const NAV = [
  ["/admin", "Dashboard"],
  ["/admin/leads", "Lead inbox"],
  ["/admin/estimator", "Estimator"],
  ["/admin/states", "States"],
  ["/admin/content", "Page content"],
  ["/admin/resources", "Articles"],
  ["/admin/team", "Team"],
  ["/admin/settings", "Settings"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const owner = await isOwner();
  return (
    <div className="tone-light min-h-[70vh]">
      {owner && (
        <div className="sticky top-[76px] z-30 border-b border-line bg-black backdrop-blur">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-1 px-4 py-2 sm:px-6">
            <span className="mr-3 text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-fg-muted">Owner admin</span>
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full px-3 py-2 text-[0.92rem] text-fg-2 hover:bg-black hover:text-fg">{label}</Link>
            ))}
            <form action={logout} className="ml-auto"><button className="rounded-md px-3 py-2 text-[0.95rem] underline">Sign out</button></form>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
