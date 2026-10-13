import Image from "next/image";
import Link from "next/link";

/**
 * The supplied Primed Real Estate logo with its black background removed (see scripts/cutout-logo.py).
 * The artwork itself is unchanged: not redrawn or recolored. The transparent PNG/WebP sits directly
 * on the site's dark surfaces. Source path is configurable in /admin/settings.
 */
export function Logo({ src, alt, height = 64, href = "/", priority = false, className = "" }: { src: string; alt: string; height?: number; href?: string | null; priority?: boolean; className?: string }) {
  // Native proportions of the cutout: 789 x 587.
  const width = Math.round((height * 789) / 587);
  const img = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      style={{ width, height, objectFit: "contain" }}
      className={`logo-art ${className}`}
    />
  );
  if (!href) return img;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={`${alt} home`}>
      {img}
    </Link>
  );
}
