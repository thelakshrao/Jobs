"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IoSearchOutline,
  IoLocationOutline,
  IoPersonCircleOutline,
  IoBriefcaseOutline,
} from "react-icons/io5";

const locationSuggestions = [
  "Sonipat, Haryana",
  "Delhi, Delhi",
  "Noida, Uttar Pradesh",
  "Gurugram, Haryana",
  "Mumbai, Maharashtra",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Remote",
];

export default function SearchNavbar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [locationFocused, setLocationFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const locationRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      setSearchOpen(e.detail);
    };
    window.addEventListener("searchToggle", handler);
    return () => window.removeEventListener("searchToggle", handler);
  }, []);

  useEffect(() => {
    if (location.trim().length > 0) {
      setFilteredSuggestions(
        locationSuggestions.filter((s) =>
          s.toLowerCase().includes(location.toLowerCase()),
        ),
      );
    } else if (locationFocused) {
      setFilteredSuggestions(locationSuggestions);
    } else {
      setFilteredSuggestions([]);
    }
  }, [location, locationFocused]);

  useEffect(() => {
    const handler = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target))
        setLocationFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (location) params.set("location", location);
    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <header
        className="hidden md:flex fixed z-50 items-center gap-3 px-3"
        style={{
          top: "16px",
          left: "100px",
          right: "16px",
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
            backgroundColor: "#F0F2F5",
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
              className="w-full bg-transparent outline-none text-sm"
              style={{ color: "#0A0E17", height: "38px" }}
            />
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
                className="w-full bg-transparent outline-none text-sm"
                style={{ color: "#0A0E17", height: "38px" }}
              />
            </div>
            {locationFocused && filteredSuggestions.length > 0 && (
              <div
                className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#fff",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  minWidth: "260px",
                  zIndex: 100,
                }}
              >
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left"
                    style={{ color: "#0A0E17" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#F7F8FA")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    onMouseDown={() => {
                      setLocation(s);
                      setLocationFocused(false);
                    }}
                  >
                    <IoLocationOutline size={14} color="#94a3b8" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center justify-center text-sm font-semibold text-white px-4 cursor-pointer"
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
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{ color: "#0A0E17" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EAF1FC";
              e.currentTarget.style.color = "#004AAC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#0A0E17";
            }}
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ color: "#0A0E17", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EAF1FC";
              e.currentTarget.style.color = "#004AAC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#0A0E17";
            }}
          >
            <IoBriefcaseOutline size={15} /> Employers / Post Job
          </Link>
        </div>
      </header>

      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: searchOpen ? "120px" : "0px",
          opacity: searchOpen ? 1 : 0,
        }}
      >
        <div
          className="px-3 pt-2 pb-3 flex flex-col gap-2"
          ref={mobileSearchRef}
        >
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
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "#0A0E17" }}
            />
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
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "#0A0E17" }}
              />
              {locationFocused && filteredSuggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "#fff",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    zIndex: 100,
                  }}
                >
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left"
                      style={{ color: "#0A0E17" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#F7F8FA")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      onMouseDown={() => {
                        setLocation(s);
                        setLocationFocused(false);
                      }}
                    >
                      <IoLocationOutline size={14} color="#94a3b8" /> {s}
                    </button>
                  ))}
                </div>
              )}
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
