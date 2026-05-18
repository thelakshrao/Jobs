import {
  IoCloudUploadOutline,
  IoDownloadOutline,
  IoEllipsisVertical,
} from "react-icons/io5";
import { BLUE, BLUE_BG } from "./shared";

export default function ResumeSidebar() {
  return (
    <div className="flex flex-col gap-4" style={{ width: "300px" }}>
      <div
        className="rounded-2xl p-5"
        style={{
          border: "1.5px solid #f1f5f9",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h3 className="text-base font-bold text-gray-900 mb-4">Resume</h3>
        <div
          className="flex items-center justify-between p-3 rounded-xl mb-3"
          style={{ backgroundColor: "#f8fafc", border: "1.5px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#fee2e2" }}
            >
              <span className="text-xs font-bold" style={{ color: "#ef4444" }}>
                PDF
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Resume.pdf</p>
              <p className="text-xs text-gray-400">Upload your resume</p>
            </div>
          </div>
          <button style={{ color: "#94a3b8" }}>
            <IoEllipsisVertical size={16} />
          </button>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            border: `1.5px solid ${BLUE}`,
            color: BLUE,
            backgroundColor: "white",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = BLUE_BG)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
        >
          <IoCloudUploadOutline size={16} /> Upload Resume
        </button>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          border: "1.5px solid #f1f5f9",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h3 className="text-base font-bold text-gray-900 mb-3">Quick Links</h3>
        <button
          className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all"
          style={{ backgroundColor: "#f8fafc" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = BLUE_BG)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#f8fafc")
          }
        >
          <div className="flex items-center gap-3">
            <IoDownloadOutline size={18} style={{ color: BLUE }} />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                Download Profile
              </p>
              <p className="text-xs text-gray-400">
                Download your profile as PDF
              </p>
            </div>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
