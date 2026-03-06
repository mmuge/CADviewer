import type { MeasureResult } from './useMeasure'

// ─────────────────────────────────────────────────────────────
// Copy to clipboard
// ─────────────────────────────────────────────────────────────
export async function copyText(results: MeasureResult[]): Promise<void> {
  const text = results
    .map((r, i) => `${i + 1}. [${r.mode.toUpperCase()}] ${r.label}`)
    .join('\n')
  await navigator.clipboard.writeText(text)
}

// ─────────────────────────────────────────────────────────────
// Download CSV
// ─────────────────────────────────────────────────────────────
export function exportCSV(results: MeasureResult[], filename = 'cad-measurements.csv'): void {
  const header = '#,Mode,Result,Unit,Points,Time'
  const rows = results.map((r, i) => {
    const pts = r.points
      .map(p => `(${p.x.toFixed(3)};${p.y.toFixed(3)};${p.z.toFixed(3)})`)
      .join(' | ')
    return [
      i + 1,
      r.mode,
      r.value.toFixed(6),
      r.unit,
      pts || '-',
      r.timestamp,
    ]
      .map(v => `"${v}"`)
      .join(',')
  })
  downloadBlob([header, ...rows].join('\n'), filename, 'text/csv;charset=utf-8;')
}

// ─────────────────────────────────────────────────────────────
// Download plain text
// ─────────────────────────────────────────────────────────────
export function exportText(results: MeasureResult[], dwgName = ''): void {
  const lines = [
    'CAD Viewer — Measurement Report',
    `File : ${dwgName || 'unknown'}`,
    `Date : ${new Date().toLocaleString()}`,
    `Count: ${results.length}`,
    '',
    ...results.map((r, i) => `${i + 1}.  [${r.mode.padEnd(10)}]  ${r.label}`),
  ]
  downloadBlob(lines.join('\n'), 'cad-measurements.txt', 'text/plain;charset=utf-8;')
}

// ─────────────────────────────────────────────────────────────
// Print to PDF (uses browser print dialog — works on iPhone)
// ─────────────────────────────────────────────────────────────
export function exportPDF(results: MeasureResult[], dwgName = ''): void {
  const rows = results
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><span class="badge badge-${r.mode}">${r.mode}</span></td>
        <td><b>${r.label}</b></td>
        <td>${r.timestamp}</td>
      </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>CAD Measurement Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #111; }
    h1   { color: #1B4F8A; margin-bottom: 4px; }
    .meta{ font-size: 13px; color: #555; margin-bottom: 24px; }
    table{ width:100%; border-collapse:collapse; }
    th   { background:#0D2F5C; color:#fff; padding:8px 12px; text-align:left; }
    td   { padding:7px 12px; border-bottom:1px solid #ddd; }
    tr:nth-child(even) td { background:#f5f7fa; }
    .badge{ padding:2px 8px; border-radius:20px; font-size:11px; font-weight:700; }
    .badge-distance  { background:#dbeafe; color:#1d4ed8; }
    .badge-area      { background:#dcfce7; color:#15803d; }
    .badge-coordinate{ background:#fef3c7; color:#b45309; }
    .badge-angle     { background:#ede9fe; color:#7c3aed; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>📐 CAD Measurement Report</h1>
  <div class="meta">
    <b>File:</b> ${dwgName || '—'} &nbsp;|&nbsp;
    <b>Date:</b> ${new Date().toLocaleString()} &nbsp;|&nbsp;
    <b>Measurements:</b> ${results.length}
  </div>
  <table>
    <thead><tr><th>#</th><th>Type</th><th>Result</th><th>Time</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument!
  doc.open()
  doc.write(html)
  doc.close()
  setTimeout(() => {
    iframe.contentWindow!.print()
    setTimeout(() => document.body.removeChild(iframe), 1500)
  }, 400)
}

// ─────────────────────────────────────────────────────────────
// Util
// ─────────────────────────────────────────────────────────────
function downloadBlob(content: string, filename: string, type: string): void {
  const blob = new Blob(['\uFEFF' + content], { type }) // BOM for Excel CSV
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
