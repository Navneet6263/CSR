'use client';

import { Download, Maximize2 } from 'lucide-react';
import { useRef } from 'react';
import { API_BASE_URL } from '@/lib/api';
import type { ReviewerDocument as DocItem } from '@/types/reviewer';

export function DocViewer({ doc }: { doc: DocItem }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const url = doc.url ? new URL(doc.url, API_BASE_URL).toString() : '';
  const fullscreen = () => frame.current?.requestFullscreen?.();
  return <div className="glass flex h-full min-h-[600px] flex-col">
    <div className="flex items-center gap-2 border-b border-border p-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-mono uppercase tracking-wider text-fg-subtle">Now Viewing</div>
        <div className="truncate text-sm font-semibold">{doc.label}</div>
      </div>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
        <button aria-label="Download" onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')}
          className="rounded-md p-1.5 text-fg-muted transition hover:bg-bg-elev hover:text-fg">
          <Download className="h-4 w-4" />
        </button>
        <button aria-label="Fullscreen" onClick={fullscreen}
          className="rounded-md p-1.5 text-fg-muted transition hover:bg-bg-elev hover:text-fg">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-hidden bg-surface/20 p-4">
      {url ? <iframe ref={frame} src={url} title={doc.label}
        className="h-full min-h-[540px] w-full rounded-lg border border-border bg-white" />
        : <div className="grid h-full min-h-[540px] place-items-center text-sm text-fg-subtle">Document unavailable.</div>}
    </div>
  </div>;
}
