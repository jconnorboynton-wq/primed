import { guard } from "@/components/admin/guard";
import { getSettings } from "@/lib/settings";
import { ActionForm } from "@/components/admin/ActionForm";
import { updateSettings, uploadPublicImage } from "../actions";

export default async function SettingsPage() {
  await guard();
  const s = getSettings();
  const F = ({ name, label, value, hint }: { name: string; label: string; value: string; hint?: string }) => (
    <div><label htmlFor={name} className="field-label">{label}</label><input id={name} name={name} defaultValue={value} className="field" />{hint && <p className="field-hint">{hint}</p>}</div>
  );
  return (
    <div>
      <h1 className="text-[2rem] font-bold">Business settings</h1>
      <p className="mt-2 text-fg-muted">Blank fields are simply not shown on the website. Only add real details.</p>
      <ActionForm action={updateSettings} className="card mt-6 grid gap-5 p-6">
        <h2 className="text-[1.2rem] font-bold">Contact details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <F name="phone" label="Public phone" value={s.phone} />
          <F name="email" label="Public email" value={s.email} />
          <F name="contactHours" label="Contact hours" value={s.contactHours} hint="e.g. Mon–Fri, 9am–5pm Pacific" />
          <div><label htmlFor="mailingAddress" className="field-label">Mailing address</label><textarea id="mailingAddress" name="mailingAddress" defaultValue={s.mailingAddress} className="field" rows={3} /><p className="field-hint">Only a real address you're comfortable publishing.</p></div>
        </div>
        <div><label htmlFor="socials" className="field-label">Social links</label><textarea id="socials" name="socials" rows={3} className="field" defaultValue={s.socials.map((x) => `${x.label} | ${x.url}`).join("\n")} /><p className="field-hint">One per line: Label | https://url</p></div>
        <h2 className="text-[1.2rem] font-bold">Brand</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <F name="logoPath" label="Logo file path" value={s.logoPath} hint="Default /brand/logo-cutout-720.webp (the supplied logo with its background removed). Upload a replacement below, then paste its /media/ path." />
          <F name="logoAlt" label="Logo alt text" value={s.logoAlt} />
        </div>
        <div><label htmlFor="roleStatement" className="field-label">Role statement (footer and disclosures)</label><textarea id="roleStatement" name="roleStatement" rows={4} className="field" defaultValue={s.roleStatement} /><p className="field-hint">Describe your actual business role. Have it reviewed before launch.</p></div>
        <h2 className="text-[1.2rem] font-bold">Navigation labels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(s.navLabels).map(([k, v]) => <F key={k} name={`nav_${k}`} label={k} value={v} />)}
        </div>
        <h2 className="text-[1.2rem] font-bold">Marketing programs</h2>
        <p className="text-[0.95rem] text-fg-muted">Optional consent checkboxes appear on forms only when a real program exists.</p>
        <label className="flex items-center gap-2"><input type="checkbox" name="marketingEmailProgram" defaultChecked={s.marketingEmailProgram} className="h-4 w-4 accent-black" /> I run an email marketing program</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="marketingSmsProgram" defaultChecked={s.marketingSmsProgram} className="h-4 w-4 accent-black" /> I run an SMS marketing program</label>
        <F name="smsProgramTerms" label="SMS program terms shown with the checkbox" value={s.smsProgramTerms} hint="e.g. message frequency, “Msg & data rates may apply,” Reply STOP to opt out, HELP for help." />
        <h2 className="text-[1.2rem] font-bold">Search</h2>
        <F name="searchConsoleVerification" label="Google Search Console verification code" value={s.searchConsoleVerification} hint="The content value of the HTML-tag verification method." />
      </ActionForm>
      <ActionForm action={uploadPublicImage} submitLabel="Upload image" className="card mt-6 grid gap-3 p-6">
        <h2 className="text-[1.2rem] font-bold">Upload a public image</h2>
        <p className="text-[0.95rem] text-fg-muted">For licensed property photos or a replacement logo file. JPG, PNG, WebP or AVIF, up to 5 MB. Only use images you have the right to publish, and never present stock houses as completed purchases.</p>
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" className="field" aria-label="Image file" />
      </ActionForm>
    </div>
  );
}
