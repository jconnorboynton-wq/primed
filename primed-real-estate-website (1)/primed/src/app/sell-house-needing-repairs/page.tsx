import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/PageRenderer";
import { getPage, pageMetadata } from "@/content/loader";

export function generateMetadata() {
  return pageMetadata(getPage("repairs"));
}

export default function Page() {
  const page = getPage("repairs");
  if (page.published === false) notFound();
  return <PageRenderer page={page} />;
}
