import { getPublicStates } from "@/lib/settings";
import dynamic from "next/dynamic";

const USMap = dynamic(() => import("./USMap").then((m) => m.USMap));
import { Shell, SectionHeading } from "./sections";
import { inline } from "./RichText";

/** Server wrapper: passes only public, non-sensitive state information to the map. */
export function USMapSection({ heading, intro, eyebrow, tone = "pale", id, after }: { heading?: string; intro?: string; eyebrow?: string; tone?: "light" | "pale" | "dark"; id?: string; after?: string }) {
  const states = getPublicStates();
  return (
    <Shell tone={tone} id={id}>
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} />
      <USMap states={states} />
      {after && <p className="mt-6 max-w-3xl text-[0.95rem] muted">{inline(after)}</p>}
    </Shell>
  );
}
