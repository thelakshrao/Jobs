"use client";
import { useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  MIN_SECTIONS,
  MAX_SECTIONS,
  MAX_TITLE_LENGTH,
  MAX_BODY_LENGTH,
  newSection,
} from "@/lib/jobSections";

function applyFormatting(currentValue, type) {
  const lines = currentValue ? currentValue.split("\n") : [];
  let newText = currentValue || "";
  if (type === "numbered") {
    const nextNum = lines.filter((l) => /^\d+\./.test(l)).length + 1;
    newText = currentValue ? currentValue + `\n${nextNum}. ` : `${nextNum}. `;
  } else if (type === "bullet") {
    newText = currentValue ? currentValue + "\n• " : "• ";
  } else if (type === "newline") {
    newText = currentValue ? currentValue + "\n" : "\n";
  }
  return newText;
}

function FormattingToolbar({ value, onFormat }) {
  const lineCount = value ? value.split("\n").length : 0;
  return (
    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
      <button
        type="button"
        onClick={() => onFormat("numbered")}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
      >
        1. Numbered
      </button>
      <button
        type="button"
        onClick={() => onFormat("bullet")}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
      >
        • Bullet
      </button>
      <button
        type="button"
        onClick={() => onFormat("newline")}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
      >
        ↵ New Line
      </button>
      <span className="text-xs text-slate-400 ml-auto">
        {lineCount} {lineCount === 1 ? "line" : "lines"}
      </span>
    </div>
  );
}

function SectionCard({
  section,
  index,
  canRemove,
  onUpdateTitle,
  onUpdateBody,
  onRemove,
  onFormat,
}) {
  const titleChars = (section.title || "").length;
  const bodyChars = (section.body || "").length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Section {index + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(section.id)}
          disabled={!canRemove}
          title={
            canRemove
              ? "Remove section"
              : `At least ${MIN_SECTIONS} sections required`
          }
          className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 disabled:hover:bg-transparent"
        >
          <Trash2 size={14} />
          <span>Remove</span>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700">
            Title <span className="text-red-400">*</span>
          </label>
          <span
            className={`text-[11px] font-medium ${
              titleChars > MAX_TITLE_LENGTH
                ? "text-red-500 font-bold"
                : "text-slate-400"
            }`}
          >
            {titleChars}/{MAX_TITLE_LENGTH}
          </span>
        </div>
        <input
          type="text"
          value={section.title || ""}
          maxLength={MAX_TITLE_LENGTH}
          onChange={(e) => onUpdateTitle(section.id, e.target.value)}
          placeholder="Section title"
          className="w-full px-4 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/40 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700">
            Details <span className="text-red-400">*</span>
          </label>
          <span
            className={`text-[11px] font-medium ${
              bodyChars > MAX_BODY_LENGTH
                ? "text-red-500 font-bold"
                : "text-slate-400"
            }`}
          >
            {bodyChars}/{MAX_BODY_LENGTH}
          </span>
        </div>
        <FormattingToolbar
          value={section.body}
          onFormat={(type) => onFormat(section.id, type)}
        />
        <textarea
          rows={6}
          value={section.body || ""}
          maxLength={MAX_BODY_LENGTH}
          onChange={(e) => onUpdateBody(section.id, e.target.value)}
          placeholder="Write the details..."
          className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/40 focus:border-transparent transition-all font-mono leading-relaxed"
          style={{ resize: "vertical", minHeight: "140px" }}
        />
      </div>
    </div>
  );
}

export default function DetailSectionsEditor({ sections = [], onChange }) {
  const canAdd = sections.length < MAX_SECTIONS;
  const canRemove = sections.length > MIN_SECTIONS;

  const handleUpdateTitle = useCallback(
    (id, title) => {
      onChange(
        sections.map((s) => (s.id === id ? { ...s, title } : s)),
      );
    },
    [sections, onChange],
  );

  const handleUpdateBody = useCallback(
    (id, body) => {
      onChange(
        sections.map((s) => (s.id === id ? { ...s, body } : s)),
      );
    },
    [sections, onChange],
  );

  const handleFormat = useCallback(
    (id, type) => {
      onChange(
        sections.map((s) => {
          if (s.id !== id) return s;
          return {
            ...s,
            body: applyFormatting(s.body || "", type),
          };
        }),
      );
    },
    [sections, onChange],
  );

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([...sections, newSection()]);
  };

  const handleRemove = (id) => {
    if (!canRemove) return;
    onChange(sections.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Detail Sections</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add between {MIN_SECTIONS} and {MAX_SECTIONS} sections to define
            the role.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {sections.length} of {MAX_SECTIONS}
        </span>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            canRemove={canRemove}
            onUpdateTitle={handleUpdateTitle}
            onUpdateBody={handleUpdateBody}
            onRemove={handleRemove}
            onFormat={handleFormat}
          />
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-slate-300 hover:border-[#003882] hover:bg-blue-50/50 rounded-2xl text-xs font-bold text-slate-700 hover:text-[#003882] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-700"
        >
          <Plus size={15} />
          <span>Add Section</span>
          <span className="text-slate-400 font-normal">
            ({sections.length}/{MAX_SECTIONS})
          </span>
        </button>
      </div>
    </div>
  );
}
