"use client";

import { useState } from "react";
import MakerView from "@/components/finance/MakerView";
import CheckerView from "@/components/finance/CheckerView";
import { Banknote, FileCheck, ShieldCheck } from "lucide-react";

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState<"maker" | "checker">("maker");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 p-6 rounded-3xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.8)] backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] bg-clip-text text-transparent flex items-center">
            <Banknote className="w-8 h-8 mr-3 text-[#5b2c6f]" />
            Finance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage payment initiations and verifications securely.</p>
        </div>
      </div>

      <div className="flex space-x-4 bg-white/50 p-2 rounded-2xl backdrop-blur-sm w-fit shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),_0_4px_15px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab("maker")}
          className={`clickable flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activeTab === "maker"
              ? "bg-gradient-to-r from-[#5b2c6f] to-[#5b2c6f]/80 text-white shadow-lg"
              : "text-gray-600 hover:bg-white/60 hover:text-[#5b2c6f]"
          }`}
        >
          <FileCheck className="w-5 h-5 mr-2" />
          Maker (Initiate)
        </button>
        <button
          onClick={() => setActiveTab("checker")}
          className={`clickable flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activeTab === "checker"
              ? "bg-gradient-to-r from-[#2e86c1] to-[#2e86c1]/80 text-white shadow-lg"
              : "text-gray-600 hover:bg-white/60 hover:text-[#2e86c1]"
          }`}
        >
          <ShieldCheck className="w-5 h-5 mr-2" />
          Checker (Verify)
        </button>
      </div>

      <div className="mt-8 transition-all duration-500">
        {activeTab === "maker" ? <MakerView /> : <CheckerView />}
      </div>
    </div>
  );
}
