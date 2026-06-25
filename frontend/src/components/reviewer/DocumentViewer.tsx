// src/components/reviewer/DocumentViewer.tsx
import { useState } from "react";
import { Download, Maximize2, RotateCw, ZoomIn, ZoomOut, FileText } from "lucide-react";
import type { DocItem } from "./mockData";

interface Props { doc: DocItem | null; }

export function DocumentViewer({ doc }: Props) {
  const [zoom, setZoom] = useState(100);
  const [rotate, setRotate] = useState(0);

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl bg-white/50 border border-white shadow-sm">
      <div className="flex items-center justify-between border-b border-white/60 px-4 py-3 bg-white/40">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{doc?.type ?? "Select a document"}</span>
          {doc && (
            <span className="ml-2 font-mono text-[11px] text-muted-foreground">{doc.fileUrl}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[
            { Icon: ZoomOut, on: () => setZoom((z) => Math.max(50, z - 10)) },
            { Icon: ZoomIn, on: () => setZoom((z) => Math.min(200, z + 10)) },
            { Icon: RotateCw, on: () => setRotate((r) => (r + 90) % 360) },
            { Icon: Maximize2, on: () => setZoom(100) },
            { Icon: Download, on: () => {} },
          ].map(({ Icon, on }, i) => (
            <button
              key={i}
              onClick={on}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <span className="ml-2 rounded-md bg-white/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {zoom}%
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto bg-gradient-to-br from-slate-100/60 to-indigo-50/40 p-8">
        {doc ? (
            doc.url ? (
              doc.url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                <div 
                  className="mx-auto rounded-lg bg-white shadow-sm transition-transform"
                  style={{ width: `${(zoom / 100) * 100}%`, transform: `rotate(${rotate}deg)` }}
                >
                  <img 
                    src={doc.url} 
                    alt={doc.type} 
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div 
                  className="mx-auto h-full w-full rounded-lg bg-white shadow-sm transition-transform"
                  style={{ width: `${(zoom / 100) * 100}%`, height: '100%', minHeight: '600px', transform: `rotate(${rotate}deg)` }}
                >
                  <iframe 
                    src={doc.url} 
                    className="h-full w-full rounded-lg border-0"
                    title={doc.type}
                  />
                </div>
              )
            ) : (
              <div className="mx-auto w-full max-w-2xl rounded-lg bg-white shadow-sm" style={{ minHeight: "600px" }}>
                <div className="flex h-full min-h-[600px] flex-col items-center justify-center space-y-4 p-12 text-slate-400">
                  <FileText className="h-16 w-16 opacity-20" />
                  <p>No actual file uploaded for this document.</p>
                  <p className="text-xs">In production, the real student uploaded file will appear here.</p>
                </div>
              </div>
            )
        ) : (
          <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-muted-foreground">
            Select a document from the checklist to begin review
          </div>
        )}
      </div>
    </div>
  );
}