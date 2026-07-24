"use client";

import { useState } from "react";
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoBriefcaseOutline,
  IoConstructOutline,
  IoDocumentTextOutline,
  IoHandLeftOutline,
  IoMailOpenOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { BLUE, BLUE_BG } from "./shared";

const QUESTIONS = [
  {
    id: "roleType",
    step: 1,
    title: "What kind of work are you looking for?",
    subtitle: "This helps us build the right profile for you",
    type: "cards",
    options: [
      {
        id: "corporate",
        icon: <IoBriefcaseOutline size={26} color={BLUE} />,
        title: "Corporate, Tech & Office",
        desc: "Software, Accounts, Management, Marketing, Teaching, HR…",
      },
      {
        id: "trades",
        icon: <IoConstructOutline size={26} color={BLUE} />,
        title: "Skilled Trades & Field Work",
        desc: "Driver, Cook, Hotel Staff, Security, Construction, Delivery…",
      },
    ],
  },
  {
    id: "portfolio",
    step: 2,
    title: "Does your work need certificates or a portfolio?",
    subtitle: "E.g. degree certificates, project links, detailed job history",
    type: "yesno",
    options: [
      { id: "yes", label: "Yes, I have certificates / portfolio to show" },
      { id: "no", label: "No, my skills and practical work speak for me" },
    ],
  },
  {
    id: "applyStyle",
    step: 3,
    title: "How do you usually apply for jobs?",
    subtitle: "Pick whichever feels more like you",
    type: "cards",
    options: [
      {
        id: "resume",
        icon: <IoDocumentTextOutline size={26} color={BLUE} />,
        title: "I send a resume / CV",
        desc: "I write about my skills and send a written application",
      },
      {
        id: "practical",
        icon: <IoHandLeftOutline size={26} color={BLUE} />,
        title: "I talk directly or show my work",
        desc: "I show photos, do a trial, or speak to the employer directly",
      },
    ],
  },
  {
    id: "hasResume",
    step: 4,
    title: "Do you have a resume ready to upload?",
    subtitle: "A PDF or Word file you already use for applications",
    type: "yesno",
    options: [
      { id: "yes", label: "Yes, I have a resume file ready" },
      { id: "no", label: "No / Not sure — I'll sort it later" },
    ],
  },
];

function isDetailedProfile(answers) {
  const { portfolio, applyStyle, hasResume } = answers;
  const score =
    (portfolio === "yes" ? 1 : 0) +
    (applyStyle === "resume" ? 1 : 0) +
    (hasResume === "yes" ? 1 : 0);
  return score >= 2;
}

export default function OnboardingModal({ onSelect }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const q = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;

  const handleAnswer = (optId) => {
    setSelected(optId);
  };

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      const profileType = isDetailedProfile(newAnswers) ? "graduate" : "simple";
      onSelect(profileType);
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(step - 1);
    setSelected(answers[QUESTIONS[step - 1].id] || null);
    const prev = { ...answers };
    delete prev[q.id];
    setAnswers(prev);
  };

  const pct = (step / totalSteps) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="bg-white rounded-3xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 520, boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
      >
        <div className="w-full h-1.5" style={{ backgroundColor: "#f1f5f9" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: BLUE }}
          />
        </div>

        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold" style={{ color: "#94a3b8" }}>
              Step {step + 1} of {totalSteps}
            </span>
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 20 : 6,
                    height: 6,
                    backgroundColor: i <= step ? BLUE : "#e2e8f0",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2
              className="text-lg sm:text-xl font-extrabold"
              style={{ color: "#0f172a" }}
            >
              {q.title}
            </h2>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {q.subtitle}
            </p>
          </div>

          {q.type === "cards" ? (
            <div className="flex flex-col sm:flex-row gap-3">
              {q.options.map((opt) => {
                const active = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt.id)}
                    className="flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all cursor-pointer"
                    style={{
                      border: `2px solid ${active ? BLUE : "#f1f5f9"}`,
                      backgroundColor: active ? BLUE_BG : "#fafafa",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: active ? "#dbeafe" : BLUE_BG }}
                    >
                      {opt.icon}
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#0f172a" }}
                    >
                      {opt.title}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#64748b" }}
                    >
                      {opt.desc}
                    </p>
                    {active && <IoCheckmarkCircle size={18} color={BLUE} />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {q.options.map((opt) => {
                const active = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt.id)}
                    className="w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all cursor-pointer"
                    style={{
                      border: `2px solid ${active ? BLUE : "#f1f5f9"}`,
                      backgroundColor: active ? BLUE_BG : "#fafafa",
                    }}
                  >
                    <span
                      className="text-sm font-semibold text-left"
                      style={{ color: "#0f172a" }}
                    >
                      {opt.label}
                    </span>
                    {active && <IoCheckmarkCircle size={20} color={BLUE} />}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
              >
                <IoArrowBackOutline size={15} /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!selected}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
              style={{
                backgroundColor: selected ? BLUE : "#e2e8f0",
                color: selected ? "white" : "#94a3b8",
                cursor: selected ? "pointer" : "not-allowed",
              }}
            >
              {step === totalSteps - 1 ? "Build My Profile" : "Next"}
              <IoArrowForwardOutline size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
