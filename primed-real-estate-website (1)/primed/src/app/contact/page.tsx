import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/PageRenderer";
import { getPage, pageMetadata } from "@/content/loader";

export function generateMetadata() {
  return pageMetadata(getPage("contact"));
}

export default function Page() {
  const page = getPage("contact");
  if (page.published === false) notFound();
  return <PageRenderer page={page} />;
}
