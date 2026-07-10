"use client";

import { IoChevronDownOutline } from "react-icons/io5";
import { BLUE } from "./shared";

// ---- Country / phone code list (same countries as before) ----
export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
];

// ---- Country phone code -> currency ----
// `rate` = how many units of that currency equal 1 Indian Rupee (approx, for
// generating sensible pay bands). These are rough — update periodically or
// swap in a live FX API if you want exact numbers.
export const CURRENCY_BY_PHONE_CODE = {
  "+91": { code: "INR", symbol: "₹", rate: 1 },
  "+971": { code: "AED", symbol: "AED ", rate: 0.044 },
  "+966": { code: "SAR", symbol: "SAR ", rate: 0.045 },
  "+974": { code: "QAR", symbol: "QAR ", rate: 0.044 },
  "+965": { code: "KWD", symbol: "KWD ", rate: 0.0037 },
  "+968": { code: "OMR", symbol: "OMR ", rate: 0.0046 },
  "+973": { code: "BHD", symbol: "BHD ", rate: 0.0045 },
  "+1": { code: "USD", symbol: "$", rate: 0.012 },
  "+44": { code: "GBP", symbol: "£", rate: 0.0094 },
  "+61": { code: "AUD", symbol: "A$", rate: 0.018 },
  "+64": { code: "NZD", symbol: "NZ$", rate: 0.019 },
  "+49": { code: "EUR", symbol: "€", rate: 0.011 },
  "+33": { code: "EUR", symbol: "€", rate: 0.011 },
  "+39": { code: "EUR", symbol: "€", rate: 0.011 },
  "+34": { code: "EUR", symbol: "€", rate: 0.011 },
  "+31": { code: "EUR", symbol: "€", rate: 0.011 },
  "+41": { code: "CHF", symbol: "CHF ", rate: 0.011 },
  "+46": { code: "SEK", symbol: "SEK ", rate: 0.13 },
  "+47": { code: "NOK", symbol: "NOK ", rate: 0.13 },
  "+45": { code: "DKK", symbol: "DKK ", rate: 0.082 },
  "+353": { code: "EUR", symbol: "€", rate: 0.011 },
  "+65": { code: "SGD", symbol: "S$", rate: 0.016 },
  "+60": { code: "MYR", symbol: "RM", rate: 0.056 },
  "+62": { code: "IDR", symbol: "Rp", rate: 190 },
  "+63": { code: "PHP", symbol: "₱", rate: 0.68 },
  "+66": { code: "THB", symbol: "฿", rate: 0.42 },
  "+84": { code: "VND", symbol: "₫", rate: 300 },
  "+92": { code: "PKR", symbol: "PKR ", rate: 3.4 },
  "+880": { code: "BDT", symbol: "৳", rate: 1.3 },
  "+94": { code: "LKR", symbol: "LKR ", rate: 3.6 },
  "+977": { code: "NPR", symbol: "NPR ", rate: 1.6 },
  "+27": { code: "ZAR", symbol: "R", rate: 0.22 },
  "+234": { code: "NGN", symbol: "₦", rate: 18 },
  "+254": { code: "KES", symbol: "KES ", rate: 1.5 },
  "+20": { code: "EGP", symbol: "EGP ", rate: 0.6 },
  "+86": { code: "CNY", symbol: "¥", rate: 0.087 },
  "+81": { code: "JPY", symbol: "¥", rate: 1.8 },
  "+82": { code: "KRW", symbol: "₩", rate: 16 },
  "+852": { code: "HKD", symbol: "HK$", rate: 0.094 },
  "+90": { code: "TRY", symbol: "₺", rate: 0.42 },
  "+7": { code: "RUB", symbol: "₽", rate: 1.1 },
  "+55": { code: "BRL", symbol: "R$", rate: 0.066 },
  "+52": { code: "MXN", symbol: "MX$", rate: 0.22 },
};

export function getCurrencyForCountryCode(countryCode) {
  return CURRENCY_BY_PHONE_CODE[countryCode] || CURRENCY_BY_PHONE_CODE["+91"];
}

function niceRound(n) {
  if (!n || n <= 0) return 0;
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  const normalized = n / magnitude;
  let rounded;
  if (normalized < 1.5) rounded = 1;
  else if (normalized < 3.5) rounded = 2.5;
  else if (normalized < 7.5) rounded = 5;
  else rounded = 10;
  return Math.round(rounded * magnitude);
}

const BASE_INR_THRESHOLDS = [10000, 15000, 25000, 40000];

export function getSalaryOptions(countryCode) {
  const currency = getCurrencyForCountryCode(countryCode);
  const [t1, t2, t3, t4] = BASE_INR_THRESHOLDS.map((v) =>
    niceRound(v * currency.rate),
  );
  const fmt = (n) => n.toLocaleString();
  return {
    currencyCode: currency.code,
    options: [
      `Below ${currency.symbol}${fmt(t1)}/mo`,
      `${currency.symbol}${fmt(t1)}–${fmt(t2)}/mo`,
      `${currency.symbol}${fmt(t2)}–${fmt(t3)}/mo`,
      `${currency.symbol}${fmt(t3)}–${fmt(t4)}/mo`,
      `${currency.symbol}${fmt(t4)}+/mo`,
      "Open to discuss",
    ],
  };
}

export function parsePhone(fullPhone) {
  if (!fullPhone) return { countryCode: "+91", number: "" };
  const trimmed = fullPhone.trim();
  const sorted = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length,
  );
  for (const c of sorted) {
    if (trimmed.startsWith(c.code)) {
      return { countryCode: c.code, number: trimmed.slice(c.code.length).trim() };
    }
  }
  return { countryCode: "+91", number: trimmed };
}

export function PhoneInput({
  countryCode,
  onCountryCodeChange,
  value,
  onChange,
  fullWidth,
}) {
  return (
    <div
      className="flex items-stretch w-full overflow-hidden"
      style={{
        border: "1.5px solid #e2e8f0",
        borderRadius: fullWidth ? 16 : 12,
        backgroundColor: fullWidth ? "#f8fafc" : "white",
      }}
    >
      <div className="relative flex items-center shrink-0">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className="h-full appearance-none outline-none text-sm font-semibold pl-3 pr-7"
          style={{
            border: "none",
            borderRight: "1.5px solid #e2e8f0",
            color: "#0f172a",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code + c.country} value={c.code}>
              {c.flag} {c.code} {c.country}
            </option>
          ))}
        </select>
        <IoChevronDownOutline
          size={12}
          style={{
            position: "absolute",
            right: 8,
            color: "#94a3b8",
            pointerEvents: "none",
          }}
        />
      </div>
      <input
        type="tel"
        value={value}
        onChange={onChange}
        placeholder="Enter your mobile number"
        className={`flex-1 min-w-0 outline-none text-sm ${fullWidth ? "px-4 py-3" : "px-3 py-2.5"}`}
        style={{
          border: "none",
          color: "#0f172a",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}