import { guard } from "@/components/admin/guard";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ActionForm } from "@/components/admin/ActionForm";
import { saveTeamMember, deleteTeamMember, setTeamEnabled } from "../actions";

type Member = { id: string; name: string; role: string | null; bio: string | null; photo_path: string | null; alt: string | null; display_order: number; published: number };

function MemberFields({ m }: { m?: Member }) {
  const k = m?.id ?? "new";
  return (
    <>
      {m && <input type="hidden" name="id" value={m.id} />}
      {m?.photo_path && <input type="hidden" name="existingPhoto" value={m.photo_path} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="field-label" htmlFor={`n-${k}`}>Name</label><input id={`n-${k}`} name="name" defaultValue={m?.name} className="field" required /></div>
        <div><label className="field-label" htmlFor={`r-${k}`}>Role</label><input id={`r-${k}`} name="role" defaultValue={m?.role ?? ""} className="field" /></div>
      </div>
      <div className="mt-4"><label className="field-label" htmlFor={`b-${k}`}>Biography</label><textarea id={`b-${k}`} name="bio" defaultValue={m?.bio ?? ""} rows={4} className="field" /></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div><label className="field-label" htmlFor={`p-${k}`}>Photo</label><input id={`p-${k}`} type="file" name="photo" accept="image/jpeg,image/png,image/webp,image/avif" className="field" />{m?.photo_path && <p className="field-hint">Current: {m.photo_path}</p>}</div>
        <div><label className="field-label" htmlFor={`a-${k}`}>Photo alt text</label><input id={`a-${k}`} name="alt" defaultValue={m?.alt ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor={`o-${k}`}>Display order</label><input id={`o-${k}`} name="displayOrder" type="number" defaultValue={m?.display_order ?? 0} className="field" /></div>
      </div>
      <label className="mt-4 flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={m?.published === 1} className="h-4 w-4 accent-black" /> Published</label>
    </>
  );
}

export default async function TeamAdmin() {
  await guard();
  const s = getSettings();
  const members = db().prepare("SELECT * FROM team_members ORDER BY display_order, name").all() as Member[];
  const published = members.filter((m) => m.published === 1).length;
  return (
    <div>
      <h1 className="text-[2rem] font-bold">Team</h1>
      <p className="mt-2 max-w-3xl text-fg-muted">The team section appears on the About page only when it's enabled and at least one profile is published. Until then the site shows no team section, placeholder or navigation link. Use real people and photos you have permission to publish.</p>
      <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <p><strong>Team section: {s.teamEnabled ? "enabled" : "disabled"}</strong> · {published} published profile{published === 1 ? "" : "s"}{s.teamEnabled && published === 0 ? " (still hidden until one is published)" : ""}</p>
        <form action={setTeamEnabled} className=""><input type="hidden" name="enabled" value={s.teamEnabled ? "false" : "true"} /><button className="btn btn-primary !min-h-11">{s.teamEnabled ? "Disable section" : "Enable section"}</button></form>
      </div>
      <h2 className="mt-8 text-[1.3rem] font-bold">Add a profile</h2>
      <ActionForm action={saveTeamMember} submitLabel="Add profile" className="card mt-3 p-6" encType="multipart/form-data"><MemberFields /></ActionForm>
      {members.length > 0 && <h2 className="mt-8 text-[1.3rem] font-bold">Profiles</h2>}
      {members.map((m) => (
        <div key={m.id} className="mt-3">
          <ActionForm action={saveTeamMember} submitLabel="Save profile" className="card p-6" encType="multipart/form-data"><MemberFields m={m} /></ActionForm>
          <form action={deleteTeamMember} className="mt-2"><input type="hidden" name="id" value={m.id} /><button className="text-[0.9rem] text-err underline">Delete {m.name}</button></form>
        </div>
      ))}
    </div>
  );
}
