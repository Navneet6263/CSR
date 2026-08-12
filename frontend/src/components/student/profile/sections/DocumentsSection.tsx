'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, FolderUp, Loader2, Upload } from 'lucide-react';
import { SectionCard } from '../SectionCard';
import { DOC_LIST, type DocKey, type ProfileFormState } from '@/lib/profileForm';
import { studentApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Props {
  form: ProfileFormState;
  set: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void;
}

export function DocumentsSection({ form, set }: Props) {
  const [busy, setBusy] = useState<DocKey | null>(null); const [error, setError] = useState('');
  useEffect(() => {
    studentApi.getDocuments().then((response) => {
      const uploaded = { ...form.documents };
      for (const row of response.data ?? []) {
        const key = String(row.DocumentType ?? row.documentType) as DocKey;
        if (key in uploaded) uploaded[key] = true;
      }
      set('documents', uploaded);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load documents.'));
    // The profile section is mounted once per visit; current form state is the merge base.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function upload(key: DocKey, file?: File) {
    if (!file) return;
    setBusy(key); setError('');
    try {
      await studentApi.uploadDocument(key, file);
      set('documents', { ...form.documents, [key]: true });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Upload failed.'); }
    finally { setBusy(null); }
  }

  return <SectionCard icon={<FolderUp className="h-5 w-5"/>} title="Documents"
    description="Upload clear scans (PDF, JPEG or PNG). Each file must be under 5 MB.">
    {error && <p role="alert" className="mb-3 rounded-lg bg-destructive-soft p-3 text-xs text-destructive">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2">{DOC_LIST.map((document) => {
      const uploaded = form.documents[document.id]; const uploading = busy === document.id;
      return <label key={document.id} className={cn(
        'group flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md',
        uploaded ? 'border-success/50 bg-success-soft/60' : 'border-border bg-card hover:border-primary/40',
        busy && !uploading && 'pointer-events-none opacity-50',
      )}>
        <input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" disabled={busy !== null}
          onChange={(event) => { void upload(document.id, event.target.files?.[0]); event.target.value = ''; }}/>
        <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg',
          uploaded ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground')}>
          {uploading ? <Loader2 className="h-5 w-5 animate-spin"/> : uploaded ? <CheckCircle2 className="h-5 w-5"/> : <Upload className="h-5 w-5"/>}
        </div>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{document.name}</p>
          <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            document.required ? 'bg-destructive-soft text-destructive' : 'bg-muted text-muted-foreground')}>
            {document.required ? 'Required' : 'Optional'}</span></div>
          <p className="truncate text-[11px] text-muted-foreground">{document.hint}</p>
          <span className={cn('mt-2 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold',
            uploaded ? 'bg-card text-foreground' : 'bg-primary text-primary-foreground')}>
            {uploading ? 'Scanning securely…' : uploaded ? 'Uploaded — choose to replace' : 'Choose file'}</span>
        </div>
      </label>;
    })}</div>
  </SectionCard>;
}
