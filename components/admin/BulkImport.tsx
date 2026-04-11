'use client'
// components/admin/BulkImport.tsx

import { useRef, useState } from 'react'

interface PreviewRow {
  [key: string]: string
}

interface ImportResult {
  created: number
  updated: number
  skipped: number
  errors: { row: number; reason: string }[]
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes }
    else if (char === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += char }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): { headers: string[]; rows: PreviewRow[] } {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseCSVLine(lines[0]).map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]))
  })
  return { headers, rows }
}

const surfaceStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '1rem',
  padding: '1.25rem',
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
}

export default function BulkImport() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [duplicate, setDuplicate] = useState<'skip' | 'overwrite'>('skip')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setResult(null)
    setUploadError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { headers: h, rows } = parseCSV(text)
      setHeaders(h)
      setTotalRows(rows.length)
      setPreview(rows.slice(0, 5))
    }
    reader.readAsText(file, 'utf-8')
  }

  async function handleUpload() {
    if (!selectedFile) return
    setLoading(true)
    setUploadError('')
    setResult(null)

    try {
      const fd = new FormData()
      fd.append('file', selectedFile)
      fd.append('duplicate', duplicate)

      const res = await fetch('/api/admin/cards/bulk', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || '업로드 실패')
      } else {
        setResult(data as ImportResult)
      }
    } catch {
      setUploadError('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setSelectedFile(null)
    setHeaders([])
    setPreview([])
    setTotalRows(0)
    setResult(null)
    setUploadError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={surfaceStyle} className="mb-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          CSV 일괄 업로드
        </span>
        <a
          href="/card-template.csv"
          download
          className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          템플릿 다운로드
        </a>
      </div>

      {/* File input */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="text-sm"
          style={{ color: 'var(--text-primary)' }}
        />
        {selectedFile && (
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2"
            style={{ color: 'var(--text-muted)' }}
          >
            초기화
          </button>
        )}
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="mb-4 overflow-x-auto">
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            미리보기 (총 {totalRows}행 중 최대 5행 표시)
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {headers.map(h => (
                  <th
                    key={h}
                    className="text-left px-2 py-1 font-semibold"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, ri) => (
                <tr key={ri}>
                  {headers.map(h => (
                    <td
                      key={h}
                      className="px-2 py-1"
                      style={{
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        maxWidth: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Duplicate handling */}
      {selectedFile && (
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>중복 처리:</span>
          <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <input
              type="radio"
              name="duplicate"
              value="skip"
              checked={duplicate === 'skip'}
              onChange={() => setDuplicate('skip')}
              style={inputStyle}
            />
            건너뜀
          </label>
          <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <input
              type="radio"
              name="duplicate"
              value="overwrite"
              checked={duplicate === 'overwrite'}
              onChange={() => setDuplicate('overwrite')}
            />
            덮어쓰기
          </label>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !result && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="rounded-full px-5 py-2 text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--accent)', color: '#000' }}
        >
          {loading ? '업로드 중...' : `업로드 (${totalRows}행)`}
        </button>
      )}

      {/* Upload error */}
      {uploadError && (
        <p className="text-sm mt-3 px-1" style={{ color: '#f3727f' }}>{uploadError}</p>
      )}

      {/* Result */}
      {result && (
        <div
          className="mt-4 rounded-xl p-4"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <p className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>업로드 결과</p>
          <div className="flex flex-wrap gap-4 text-sm mb-3">
            <span style={{ color: '#16a34a' }}>생성: <strong>{result.created}건</strong></span>
            <span style={{ color: 'var(--accent)' }}>업데이트: <strong>{result.updated}건</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>건너뜀: <strong>{result.skipped}건</strong></span>
            {result.errors.length > 0 && (
              <span style={{ color: '#f3727f' }}>오류: <strong>{result.errors.length}건</strong></span>
            )}
          </div>
          {result.errors.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#f3727f' }}>오류 목록</p>
              <ul className="text-xs space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i} style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: '#f3727f' }}>행 {e.row}:</span> {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-xs px-3 py-1 rounded-full"
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            다시 업로드
          </button>
        </div>
      )}
    </div>
  )
}
