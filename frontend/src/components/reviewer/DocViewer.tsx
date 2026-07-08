"use client";
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2 } from "lucide-react";
import { useState } from "react";
import type { DocItem } from "@/lib/mock-data";

export function DocViewer({ doc }: { doc: DocItem }) {
  const [zoom, setZoom] = useState(100);
  const [rot, setRot] = useState(0);
  return (
    <div className="glass flex flex-col h-full min-h-[600px]">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono uppercase tracking-wider text-fg-subtle">Now Viewing</div>
          <div className="font-semibold text-sm truncate">{doc.label}</div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          <IconBtn onClick={() => setZoom(Math.max(50, zoom - 10))} label="Zoom out"><ZoomOut className="w-4 h-4" /></IconBtn>
          <div className="px-2 text-xs font-mono tabular-nums text-fg-muted min-w-[3.5rem] text-center">{zoom}%</div>
          <IconBtn onClick={() => setZoom(Math.min(200, zoom + 10))} label="Zoom in"><ZoomIn className="w-4 h-4" /></IconBtn>
          <div className="w-px h-5 bg-border mx-1" />
          <IconBtn onClick={() => setRot(rot + 90)} label="Rotate"><RotateCw className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={() => {}} label="Download"><Download className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={() => {}} label="Fullscreen"><Maximize2 className="w-4 h-4" /></IconBtn>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-[radial-gradient(oklch(1_0_0/0.04)_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="mx-auto transition-transform origin-top" style={{ transform: `scale(${zoom / 100}) rotate(${rot}deg)`, width: "min(720px,100%)" }}>
          <MockDoc label={doc.label} verifies={doc.verifies} />
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return <button aria-label={label} onClick={onClick} className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-bg-elev transition">{children}</button>;
}

function MockDoc({ label, verifies }: { label: string; verifies: string }) {
  return (
    <div className="bg-[oklch(0.96_0.01_240)] text-[oklch(0.2_0.02_240)] rounded-lg p-8 shadow-2xl aspect-[1/1.3] flex flex-col font-sans">
      <div className="flex items-start justify-between border-b-2 border-black/70 pb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-black/50">Government of India</div>
          <div className="font-bold text-lg leading-tight">{label}</div>
        </div>
        <div className="w-14 h-14 rounded bg-[oklch(0.85_0.08_45)] grid place-items-center text-[10px] font-bold text-black/60">EMBLEM</div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-6 flex-1">
        <div className="col-span-2 space-y-3 text-sm">
          {["Name", "Date of Birth", "Address", "Reference No", "Issued On"].map((f) => (
            <div key={f}>
              <div className="text-[10px] uppercase tracking-wide text-black/50">{f}</div>
              <div className="h-3 mt-1 bg-black/10 rounded w-[85%]" />
              <div className="h-3 mt-1 bg-black/10 rounded w-[65%]" />
            </div>
          ))}
        </div>
        <div className="border-2 border-dashed border-black/30 rounded grid place-items-center text-[10px] text-black/40 font-mono">PHOTO</div>
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="text-[10px] text-black/40">Verifies: {verifies}</div>
        <div className="w-20 h-10 border border-black/30 rounded text-[9px] text-black/40 grid place-items-center font-mono">SIGN + QR</div>
      </div>
    </div>
  );
}
