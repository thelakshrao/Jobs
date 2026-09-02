"use client";

import React, { useState } from "react";
import PolicyPanel from "@/components/Policypanel";
import policyContent from "@/components/Policycontent";

const BRAND_BLUE = "#004AAC";

const DashPolicyStrip = () => {
  const [activePanel, setActivePanel] = useState(null);

  return (
    <>
      <div
        className="w-full flex items-center justify-center sm:justify-end gap-5 px-4 sm:px-6 py-2 mb-24 md:mb-0"
        style={{ backgroundColor: BRAND_BLUE }}
      >
        <button
          type="button"
          onClick={() => setActivePanel("privacy")}
          className="text-white/85 hover:text-white text-xs sm:text-sm font-medium transition-colors"
        >
          Privacy Policy
        </button>
        <span className="text-white/30 text-xs">|</span>
        <button
          type="button"
          onClick={() => setActivePanel("terms")}
          className="text-white/85 hover:text-white text-xs sm:text-sm font-medium transition-colors"
        >
          Terms of Service
        </button>
      </div>

      <PolicyPanel
        content={activePanel ? policyContent[activePanel] : null}
        onClose={() => setActivePanel(null)}
      />
    </>
  );
};

export default DashPolicyStrip;
