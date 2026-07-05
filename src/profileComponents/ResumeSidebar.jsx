"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  IoCloudUploadOutline,
  IoEllipsisVertical,
  IoOpenOutline,
  IoTrashOutline,
  IoDocumentOutline,
} from "react-icons/io5";
import { BLUE, BLUE_BG } from "./shared";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const RESUME_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadResumeToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", RESUME_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: "POST", body: fd },
  );
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return { url: data.secure_url, name: file.name, size: file.size };
}

function formatSize(bytes) {
  if (!bytes) return "";
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeSidebar() {
  const [uid, setUid] = useState(null);
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) return;
      setUid(fu.uid);
      const snap = await getDoc(doc(db, "users", fu.uid));
      if (snap.exists() && snap.data().resume) {
        setResume(snap.data().resume);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const result = await uploadResumeToCloudinary(file);
      setResume(result);
      if (uid) {
        await setDoc(
          doc(db, "users", uid),
          { resume: result },
          { merge: true },
        );
      }
    } catch {
      setError("Upload failed — please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setResume(null);
    setMenuOpen(false);
    if (uid) {
      await setDoc(doc(db, "users", uid), { resume: null }, { merge: true });
    }
  };

  return (
    <div className="w-full sm:max-w-75 mb-10 md:mb-0">
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={{
          border: "1.5px solid #f1f5f9",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">
          Resume
        </h3>

        <div
          className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl mb-3"
          style={{ backgroundColor: "#f8fafc", border: "1.5px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: resume ? "#fee2e2" : "#f1f5f9" }}
            >
              {resume ? (
                <span
                  className="text-[10px] sm:text-xs font-bold"
                  style={{ color: "#ef4444" }}
                >
                  PDF
                </span>
              ) : (
                <IoDocumentOutline size={16} color="#94a3b8" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                {resume ? resume.name : "No resume uploaded"}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400">
                {resume ? formatSize(resume.size) : "Upload a PDF, max 5 MB"}
              </p>
            </div>
          </div>

          {resume && (
            <div className="relative shrink-0 ml-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                style={{ color: "#94a3b8" }}
              >
                <IoEllipsisVertical size={16} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-7 z-20 rounded-xl overflow-hidden flex flex-col"
                  style={{
                    backgroundColor: "#fff",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    minWidth: 148,
                  }}
                >
                  <a
                    href={resume.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold"
                    style={{ color: "#0f172a" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <IoOpenOutline size={14} /> View Resume
                  </a>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold w-full text-left cursor-pointer"
                    style={{ color: "#ef4444" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fff5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <IoTrashOutline size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "#ef4444" }}
          >
            ⚠ {error}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          style={{
            border: `1.5px solid ${uploading ? "#e2e8f0" : BLUE}`,
            color: uploading ? "#94a3b8" : BLUE,
            backgroundColor: "white",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!uploading) e.currentTarget.style.backgroundColor = BLUE_BG;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
          }}
        >
          <IoCloudUploadOutline size={16} />
          {uploading
            ? "Uploading…"
            : resume
              ? "Replace Resume"
              : "Upload Resume"}
        </button>
      </div>
    </div>
  );
}
