import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/PageRenderer";
import { getPage, pageMetadata } from "@/content/loader";

export function generateMetadata() {
  return pageMetadata(getPage("how-it-works"));
}

export default function Page() {
  const page = getPage("how-it-works");
  if (page.published === false) notFound();
  return <PageRenderer page={page} />;
}
