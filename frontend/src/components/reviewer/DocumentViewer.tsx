'use client';

import { Download, FileText, Maximize2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useRef, useState } from 'react';
import { API_BASE_URL } from '@/lib/api/client';
import type { ReviewerDocument } from '@/types/reviewer';

export function DocumentViewer({ doc }: { doc: ReviewerDocument | null }) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const url = doc?.url ? new URL(doc.url, API_BASE_URL).toString() : '';
  const controls = [
    { Icon: ZoomOut, label: 'Zoom out', action: () => setZoom((value) => Math.max(50, value - 10)) },
    { Icon: ZoomIn, label: 'Zoom in', action: () => setZoom((value) => Math.min(200, value + 10)) },
    { Icon: RotateCw, label: 'Rotate', action: () => setRotation((value) => (value + 90) % 360) },
  ];

  return <div className="glass flex h-full flex-col overflow-hidden rounded-2xl border border-white bg-white/50 shadow-sm">
    <div className="flex items-center justify-between border-b border-white/60 bg-white/40 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{doc?.label ?? 'Select a document'}</span>
      </div>
      <div className="flex items-center gap-1">
        {controls.map(({ Icon, label, action }) => <button key={label} aria-label={label} onClick={action}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground">
          <Icon className="h-4 w-4" />
        </button>)}
        <button aria-label="Fullscreen" onClick={() => frame.current?.requestFullscreen?.()}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground">
          <Maximize2 className="h-4 w-4" />
        </button>
        <button aria-label="Download" onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground">
          <Download className="h-4 w-4" />
        </button>
        <span className="ml-2 rounded-md bg-white/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{zoom}%</span>
      </div>
    </div>
    <div className="relative flex-1 overflow-auto bg-gradient-to-br from-slate-100/60 to-indigo-50/40 p-8">
      {url ? <div className="mx-auto h-full rounded-lg bg-white shadow-sm transition-transform"
        style={{ width: `${zoom}%`, minHeight: 600, transform: `rotate(${rotation}deg)` }}>
        <iframe ref={frame} src={url} className="h-full min-h-[600px] w-full rounded-lg border-0" title={doc?.label} />
      </div> : <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-muted-foreground">
        {doc ? 'The student has not uploaded this document.' : 'Select a document from the checklist to begin review'}
      </div>}
    </div>
  </div>;
}
