import Image from "next/image";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Shell, SectionHeading } from "./sections";

/**
 * Future team module. Renders NOTHING unless the owner enables it in /admin/team AND at least one
 * profile is published. No placeholders, no "coming soon".
 */
export function TeamSection({ heading = "The people behind Primed" }: { heading?: string }) {
  if (!getSettings().teamEnabled) return null;
  const people = db()
    .prepare("SELECT id, name, role, bio, photo_path, alt FROM team_members WHERE published = 1 ORDER BY display_order, name")
    .all() as { id: string; name: string; role: string | null; bio: string | null; photo_path: string | null; alt: string | null }[];
  if (!people.length) return null;
  return (
    <Shell tone="pale">
      <SectionHeading heading={heading} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <li key={p.id} className="card overflow-hidden">
            {p.photo_path && (
              <div className="relative aspect-[4/5] w-full bg-surface-3">
                <Image src={p.photo_path} alt={p.alt || p.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-[1.2rem] font-bold">{p.name}</h3>
              {p.role && <p className="text-[0.95rem] font-semibold text-fg-muted">{p.role}</p>}
              {p.bio && <p className="mt-3 text-[0.98rem]">{p.bio}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
