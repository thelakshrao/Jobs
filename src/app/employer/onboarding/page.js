"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import EmpNavbar from "@/employerComponets/EmpNavbar";

const COUNTRIES = [
  { code: "AF", dial: "+93", flag: "🇦🇫", name: "Afghanistan" },
  { code: "AL", dial: "+355", flag: "🇦🇱", name: "Albania" },
  { code: "DZ", dial: "+213", flag: "🇩🇿", name: "Algeria" },
  { code: "AD", dial: "+376", flag: "🇦🇩", name: "Andorra" },
  { code: "AO", dial: "+244", flag: "🇦🇴", name: "Angola" },
  { code: "AR", dial: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "AM", dial: "+374", flag: "🇦🇲", name: "Armenia" },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "AT", dial: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "AZ", dial: "+994", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "BH", dial: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "BD", dial: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "BY", dial: "+375", flag: "🇧🇾", name: "Belarus" },
  { code: "BE", dial: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "BG", dial: "+359", flag: "🇧🇬", name: "Bulgaria" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "CL", dial: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "CN", dial: "+86", flag: "🇨🇳", name: "China" },
  { code: "CO", dial: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "HR", dial: "+385", flag: "🇭🇷", name: "Croatia" },
  { code: "CZ", dial: "+420", flag: "🇨🇿", name: "Czech Republic" },
  { code: "DK", dial: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "EE", dial: "+372", flag: "🇪🇪", name: "Estonia" },
  { code: "ET", dial: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "FI", dial: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "GE", dial: "+995", flag: "🇬🇪", name: "Georgia" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "GH", dial: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "GR", dial: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "HU", dial: "+36", flag: "🇭🇺", name: "Hungary" },
  { code: "IS", dial: "+354", flag: "🇮🇸", name: "Iceland" },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "India" },
  { code: "ID", dial: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "IR", dial: "+98", flag: "🇮🇷", name: "Iran" },
  { code: "IQ", dial: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "IE", dial: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "IL", dial: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "JO", dial: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "KZ", dial: "+7", flag: "🇰🇿", name: "Kazakhstan" },
  { code: "KE", dial: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "LV", dial: "+371", flag: "🇱🇻", name: "Latvia" },
  { code: "LB", dial: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "LT", dial: "+370", flag: "🇱🇹", name: "Lithuania" },
  { code: "MY", dial: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "MX", dial: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "NP", dial: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "NL", dial: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "NZ", dial: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "NO", dial: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "PH", dial: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "PL", dial: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "RO", dial: "+40", flag: "🇷🇴", name: "Romania" },
  { code: "RU", dial: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "SG", dial: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "ZA", dial: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "LK", dial: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "SE", dial: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "TW", dial: "+886", flag: "🇹🇼", name: "Taiwan" },
  { code: "TH", dial: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "TN", dial: "+216", flag: "🇹🇳", name: "Tunisia" },
  { code: "TR", dial: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "UA", dial: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States" },
  { code: "UZ", dial: "+998", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "VN", dial: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "YE", dial: "+967", flag: "🇾🇪", name: "Yemen" },
  { code: "ZM", dial: "+260", flag: "🇿🇲", name: "Zambia" },
  { code: "ZW", dial: "+263", flag: "🇿🇼", name: "Zimbabwe" },
];

function PhoneInput({ value, onChange, dialCode, onDialChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const selected = COUNTRIES.find((c) => c.dial === dialCode) || COUNTRIES[35];

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search),
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="flex gap-0 rounded-lg border border-slate-300 overflow-visible focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400"
      ref={ref}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-3 border-r border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0 rounded-l-lg"
      >
        <span className="text-base leading-none">{selected?.flag}</span>
        <span className="text-slate-600">{selected?.dial}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-12 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onDialChange(c.dial);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left
                  ${c.dial === dialCode ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700"}`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-slate-400 text-xs">{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Phone number"
        className="flex-1 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white outline-none rounded-r-lg"
      />
    </div>
  );
}

function EmployerOnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSwitchMode = searchParams.get("mode") === "switch";

  const [loading, setLoading] = useState(true);
  const [prefilled, setPrefilled] = useState(false);
  const [form, setForm] = useState({
    company: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dialCode: "+91",
    dataConsent: false,
    termsConsent: false,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const empDoc = await getDoc(doc(db, "employers", currentUser.uid));

        if (empDoc.exists() && !isSwitchMode) {
          router.replace("/employer/dashboard");
          return;
        }

        if (empDoc.exists() && isSwitchMode) {
          const data = empDoc.data();
          setForm((f) => ({
            ...f,
            company: data.company || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || currentUser.email || "",
            phone: data.phone || "",
            dialCode: data.dialCode || "+91",
          }));
          setPrefilled(true);
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const firstName = data.firstName || data.name?.split(" ")[0] || "";
          const lastName =
            data.lastName || data.name?.split(" ").slice(1).join(" ") || "";
          const email = data.email || currentUser.email || "";
          const phone = data.phone || data.phoneNumber || data.mobile || "";
          const dialCode = data.dialCode || data.countryCode || "+91";
          setForm((f) => ({
            ...f,
            firstName,
            lastName,
            email,
            phone,
            dialCode,
          }));
          setPrefilled(true);
        } else {
          setForm((f) => ({ ...f, email: currentUser.email || "" }));
          setPrefilled(false);
        }
      } catch (err) {
        console.error("Error fetching data from Firestore:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isSwitchMode]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, "employers", user.uid), {
        company: form.company,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dialCode: form.dialCode,
        dataConsent: form.dataConsent,
        termsConsent: form.termsConsent,
        createdAt: new Date().toISOString(),
        uid: user.uid,
      });
      sessionStorage.removeItem("empLoggedOut");
      router.replace("/employer/dashboard");
    } catch (err) {
      console.error("Error saving employer data:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8eaed]">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <EmpNavbar />
      <div
        className="min-h-screen bg-[#e8eaed] flex flex-col items-center py-14 px-4 mt-20"
        style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
      >
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {isSwitchMode
              ? "Switch employer account"
              : "Create an employer account"}
          </h1>

          {prefilled && (
            <div className="mt-3 mb-1 flex items-center gap-2 text-sm text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {isSwitchMode
                ? "Your existing employer details are shown below. Update and continue."
                : "Your name, email & phone were imported from your applicant profile."}
            </div>
          )}

          <a
            href="/jobs"
            className="inline-flex items-center gap-1.5 mt-4 mb-7 text-slate-700 text-sm font-semibold hover:underline group"
          >
            I'm looking for a job
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="group-hover:translate-x-0.5 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => set("company")(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  First name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => set("firstName")(e.target.value)}
                    required
                    readOnly={prefilled && !isSwitchMode}
                    className={`w-full px-4 py-3 rounded-lg border text-sm text-slate-800 outline-none transition-all
                      ${
                        prefilled && !isSwitchMode
                          ? "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
                          : "border-slate-300 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                      }`}
                  />
                  {prefilled && !isSwitchMode && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Last name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => set("lastName")(e.target.value)}
                    required
                    readOnly={prefilled && !isSwitchMode}
                    className={`w-full px-4 py-3 rounded-lg border text-sm text-slate-800 outline-none transition-all
                      ${
                        prefilled && !isSwitchMode
                          ? "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
                          : "border-slate-300 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                      }`}
                  />
                  {prefilled && !isSwitchMode && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Work email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  required
                  readOnly={prefilled && !isSwitchMode}
                  className={`w-full px-4 py-3 rounded-lg border text-sm text-slate-800 outline-none transition-all
                    ${
                      prefilled && !isSwitchMode
                        ? "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
                        : "border-slate-300 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                    }`}
                />
                {prefilled && !isSwitchMode && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Phone number
              </label>
              <PhoneInput
                value={form.phone}
                onChange={set("phone")}
                dialCode={form.dialCode}
                onDialChange={set("dialCode")}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                For account management communication. Not visible to jobseekers.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mt-1">
              <div
                onClick={() =>
                  setForm((f) => ({ ...f, dataConsent: !f.dataConsent }))
                }
                className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors cursor-pointer
                  ${
                    form.dataConsent
                      ? "bg-slate-900 border-slate-900"
                      : "border-slate-400 bg-white"
                  }`}
              >
                {form.dataConsent && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-slate-600 leading-snug">
                By clicking this box, you agree to receive relevant applicant
                data from Jobs Abroad — including CVs, contact details, and
                match alerts — directly to your registered email and phone
                number.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() =>
                  setForm((f) => ({ ...f, termsConsent: !f.termsConsent }))
                }
                className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors cursor-pointer
                  ${
                    form.termsConsent
                      ? "bg-slate-900 border-slate-900"
                      : "border-slate-400 bg-white"
                  }`}
              >
                {form.termsConsent && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-slate-600 leading-snug">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={!form.termsConsent}
              className={`w-full py-3.5 rounded-lg text-sm font-semibold transition-all mt-2
                ${
                  form.termsConsent
                    ? "bg-slate-900 hover:bg-black text-white shadow-sm hover:shadow-md"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function EmployerOnboarding() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#e8eaed]">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EmployerOnboardingInner />
    </Suspense>
  );
}
