"use client";
import Image from "next/image";

const BRAND = "#003882";

/**
 * Shared banner for admin pages — subtle full-width background photo, brand gradient, copy on the left.
 * Reused across dashboard, jobs, employers, staff, etc. so every page shares one
 * consistent "feel" instead of each page inventing its own header.
 *
 * Props:
 *  - eyebrow:   small pill label above the title (e.g. today's date, a count)
 *  - title:     main heading
 *  - subtitle:  one-line description under the title
 *  - image:     imported image (from src/images) shown faintly in the background
 *  - imageAlt:  alt text for the image
 *  - right:     optional node rendered on the far right (e.g. a "+ Add Staff" button)
 */
export default function AdminPageBanner({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt = "",
  right,
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-6 sm:mb-8 shadow-sm">
      {/* Subtle full-width background photo */}
      {image && (
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          priority
        />
      )}

      {/* Brand gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, #003882 0%, #0a4ea8 48%, #1f6fd1 100%)",
        }}
      />

      {/* Soft radial circle decorations */}
      <div
        className="absolute -right-10 -top-16 w-72 h-72 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
      />
      <div
        className="absolute left-1/3 bottom-[-4rem] w-48 h-48 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
      />

      {/* Content */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 px-5 sm:px-8 py-6 sm:py-7 min-h-[132px] sm:min-h-[152px]">
        <div className="min-w-0 flex flex-col justify-center">
          {eyebrow && (
            <span className="inline-block w-fit text-[11px] font-bold uppercase tracking-wider text-blue-100/80 bg-white/10 px-2.5 py-1 rounded-full mb-3">
              {eyebrow}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-blue-100/90 mt-1.5 font-medium max-w-md">
              {subtitle}
            </p>
          )}
        </div>

        {right && (
          <div className="shrink-0 flex items-center">
            {right}
          </div>
        )}
      </div>
    </div>
  );
}
