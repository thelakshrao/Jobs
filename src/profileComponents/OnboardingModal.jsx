import { useState } from "react";
import {
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { BLUE, BLUE_BG } from "./shared";

export default function OnboardingModal({ onSelect }) {
  const [hov, setHov] = useState(null);
  const cards = [
    {
      id: "school",
      icon: <IoSchoolOutline size={32} color={BLUE} />,
      title: "10th / 12th Pass",
      desc: "I have completed school education (Matriculation or Intermediate)",
    },
    {
      id: "graduate",
      icon: <IoBriefcaseOutline size={32} color={BLUE} />,
      title: "Graduate / Postgraduate",
      desc: "I have completed or am pursuing a bachelor's or master's degree",
    },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="bg-white rounded-3xl p-10 flex flex-col items-center gap-8"
        style={{ width: "520px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ backgroundColor: BLUE_BG }}
          >
            <IoPersonOutline size={24} color={BLUE} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            What's your education level?
          </h2>
          <p className="text-sm text-gray-400">
            This helps us personalise your profile experience
          </p>
        </div>
        <div className="flex gap-4 w-full">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl text-center transition-all"
              style={{
                border:
                  hov === c.id ? `2px solid ${BLUE}` : "2px solid #f1f5f9",
                backgroundColor: hov === c.id ? BLUE_BG : "#fafafa",
              }}
              onMouseEnter={() => setHov(c.id)}
              onMouseLeave={() => setHov(null)}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: BLUE_BG }}
              >
                {c.icon}
              </div>
              <p className="text-sm font-bold text-gray-900">{c.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
