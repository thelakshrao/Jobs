"use client";

const STYLES = {
  detail: {
    block: "mb-6",
    titleTag: "h2",
    title: "text-base font-bold text-slate-900 mb-3",
    body: "text-sm text-slate-600 leading-relaxed whitespace-pre-line",
    defaultDescriptionTitle: "Full job description",
    defaultRequirementsTitle: "Requirements",
    defaultBenefitsTitle: "Benefits",
  },
  posted: {
    block: "mb-5",
    titleTag: "h4",
    title: "text-xs font-bold text-slate-500 uppercase tracking-widest mb-2",
    body: "text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line",
    defaultDescriptionTitle: "Description",
    defaultRequirementsTitle: "Requirements",
    defaultBenefitsTitle: "Benefits",
  },
  drawer: {
    block: "px-6 pb-5",
    titleTag: "p",
    title: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2",
    body: "text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed",
    defaultDescriptionTitle: "Description",
    defaultRequirementsTitle: "Requirements",
    defaultBenefitsTitle: "Benefits",
  },
};

export default function DetailSectionsView({
  job,
  variant = "detail",
  className = "",
}) {
  if (!job) return null;

  const style = STYLES[variant] || STYLES.detail;
  const TitleTag = style.titleTag || "h2";
  const sections = job.detailSections;

  // If poster-defined detailSections are present and non-empty, render them
  if (Array.isArray(sections) && sections.length > 0) {
    const validSections = sections.filter(
      (s) => s && (s.title?.trim() || s.body?.trim()),
    );
    if (validSections.length > 0) {
      const content = (
        <>
          {validSections.map((sec, idx) => (
            <div key={sec.id || `sec-${idx}`} className={style.block}>
              {sec.title && <TitleTag className={style.title}>{sec.title}</TitleTag>}
              {sec.body && <p className={style.body}>{sec.body}</p>}
            </div>
          ))}
        </>
      );
      return className ? <div className={className}>{content}</div> : content;
    }
  }

  // Fallback to legacy fields
  const hasLegacy = job.description || job.requirements || job.benefits;
  if (!hasLegacy) return null;

  const content = (
    <>
      {job.description && (
        <div className={style.block}>
          <TitleTag className={style.title}>{style.defaultDescriptionTitle}</TitleTag>
          <p className={style.body}>{job.description}</p>
        </div>
      )}
      {job.requirements && (
        <div className={style.block}>
          <TitleTag className={style.title}>{style.defaultRequirementsTitle}</TitleTag>
          <p className={style.body}>{job.requirements}</p>
        </div>
      )}
      {job.benefits && (
        <div className={style.block}>
          <TitleTag className={style.title}>{style.defaultBenefitsTitle}</TitleTag>
          <p className={style.body}>{job.benefits}</p>
        </div>
      )}
    </>
  );

  return className ? <div className={className}>{content}</div> : content;
}
