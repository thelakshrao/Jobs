"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IoSearchOutline,
  IoLocationOutline,
  IoPersonCircleOutline,
  IoBriefcaseOutline,
  IoCloseCircle,
} from "react-icons/io5";

export default function SearchNavbar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [locationFocused, setLocationFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const locationRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => setSearchOpen(e.detail);
    window.addEventListener("searchToggle", handler);
    return () => window.removeEventListener("searchToggle", handler);
  }, []);

  const fetchSuggestions = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=7&addressdetails=1&featuretype=city`,
          { headers: { "Accept-Language": "en" } },
        );
        const data = await res.json();
        const formatted = data.map((item) => {
          const a = item.address;
          const parts = [
            a.city || a.town || a.village || a.county || a.state_district,
            a.state,
            a.country,
          ].filter(Boolean);
          return { label: parts.join(", "), raw: item.display_name };
        });
        const unique = [
          ...new Map(formatted.map((s) => [s.label, s])).values(),
        ];
        setSuggestions(unique.slice(0, 7));
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    fetchSuggestions(location);
  }, [location, fetchSuggestions]);

  useEffect(() => {
    if (!locationFocused) setSuggestions([]);
  }, [locationFocused]);

  useEffect(() => {
    const handler = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target))
        setLocationFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = () => {
    window.dispatchEvent(
      new CustomEvent("jobSearch", { detail: { title: keyword, location } }),
    );
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (location) params.set("location", location);
    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const selectSuggestion = (label) => {
    setLocation(label);
    setLocationFocused(false);
    setSuggestions([]);
  };

  const SuggestionDropdown = ({ isMobile }) =>
    suggestions.length > 0 && locationFocused ? (
      <div
        className={`absolute top-full left-0 mt-2 bg-white rounded-2xl overflow-hidden z-100 ${isMobile ? "right-0" : "min-w-70"}`}
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}
      >
        {suggestionsLoading ? (
          <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            Searching…
          </div>
        ) : (
          suggestions.map((s) => (
            <button
              key={s.label}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-800 hover:bg-slate-50 transition-colors"
              onMouseDown={() => selectSuggestion(s.label)}
            >
              <IoLocationOutline
                size={14}
                className="text-slate-400 shrink-0"
              />
              <span className="truncate">{s.label}</span>
            </button>
          ))
        )}
      </div>
    ) : null;

  return (
    <>
      <header
        className="hidden md:flex sticky z-50 items-center gap-3 px-3"
        style={{
          top: "16px",
          height: "56px",
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="flex items-center overflow-visible"
          style={{
            flex: "3 1 0",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            height: "38px",
          }}
        >
          <div
            className="flex items-center flex-1 px-3 gap-2"
            style={{ minWidth: 0 }}
          >
            <IoSearchOutline
              size={16}
              color="#94a3b8"
              style={{ flexShrink: 0 }}
            />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              style={{ height: "38px" }}
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <IoCloseCircle size={16} />
              </button>
            )}
          </div>

          <div
            style={{
              width: "1px",
              height: "18px",
              backgroundColor: "#D1D5DB",
              flexShrink: 0,
            }}
          />

          <div
            className="relative flex-1"
            ref={locationRef}
            style={{ minWidth: 0 }}
          >
            <div className="flex items-center px-3 gap-2">
              <IoLocationOutline
                size={16}
                color="#94a3b8"
                style={{ flexShrink: 0 }}
              />
              <input
                type="text"
                placeholder='City, state, or "remote"'
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setLocationFocused(true)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
                style={{ height: "38px" }}
              />
              {location && (
                <button
                  onClick={() => {
                    setLocation("");
                    setSuggestions([]);
                  }}
                  className="text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <IoCloseCircle size={16} />
                </button>
              )}
            </div>
            <SuggestionDropdown />
          </div>

          <button
            onClick={handleSearch}
            className="flex items-center justify-center text-sm font-semibold text-white px-4 cursor-pointer transition-colors"
            style={{
              backgroundColor: "#004AAC",
              height: "38px",
              borderRadius: "0 12px 12px 0",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#003785")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#004AAC")
            }
          >
            Find jobs
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <Link
            href="/dashboard/profile"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-700 transition-all hover:bg-[#EAF1FC] hover:text-[#004AAC]"
          >
            <IoPersonCircleOutline size={24} />
          </Link>
          <div
            style={{
              width: "1px",
              height: "18px",
              backgroundColor: "#e2e8f0",
              margin: "0 4px",
            }}
          />
          <Link
            href="/employer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 transition-all hover:bg-[#EAF1FC] hover:text-[#004AAC]"
            style={{ whiteSpace: "nowrap" }}
          >
            <IoBriefcaseOutline size={15} /> Employers / Post Job
          </Link>
        </div>
      </header>

      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: searchOpen ? "160px" : "0px",
          opacity: searchOpen ? 1 : 0,
        }}
      >
        <div className="px-3 pt-2 pb-3 flex flex-col gap-2">
          <div
            className="flex items-center gap-2 rounded-2xl px-3"
            style={{
              backgroundColor: "#ffffff",
              height: "44px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <IoSearchOutline size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
            {keyword && (
              <button onClick={() => setKeyword("")} className="text-slate-300">
                <IoCloseCircle size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div
              className="flex items-center gap-2 rounded-2xl px-3 flex-1 relative"
              ref={locationRef}
              style={{
                backgroundColor: "#ffffff",
                height: "44px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <IoLocationOutline size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="City or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setLocationFocused(true)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
              {location && (
                <button
                  onClick={() => {
                    setLocation("");
                    setSuggestions([]);
                  }}
                  className="text-slate-300"
                >
                  <IoCloseCircle size={16} />
                </button>
              )}
              <SuggestionDropdown isMobile />
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center justify-center text-sm font-semibold text-white px-5 rounded-2xl"
              style={{
                backgroundColor: "#004AAC",
                height: "44px",
                whiteSpace: "nowrap",
              }}
            >
              Find jobs
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
