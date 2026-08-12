export function saveBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function saveCsv(filename: string, rows: Array<Array<string | number>>) {
  const cell = (value: string | number) => {
    let content = String(value); if (/^[=+\-@]/.test(content)) content = `'${content}`;
    return `"${content.replace(/"/g, '""')}"`;
  };
  saveBlob(new Blob([`\uFEFF${rows.map((row) => row.map(cell).join(',')).join('\r\n')}`],
    { type: 'text/csv;charset=utf-8' }), filename);
}
