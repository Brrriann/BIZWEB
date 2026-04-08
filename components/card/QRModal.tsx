// components/card/QRModal.tsx
'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props { url: string; onClose: () => void }

export function QRModal({ url, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 240, margin: 2 })
    }
  }, [url])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'var(--overlay)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-elevated)',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>QR 코드</h2>
        <canvas ref={canvasRef} className="rounded-lg" />
        <button
          onClick={download}
          className="text-sm font-bold rounded-full px-6 py-2 transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--accent)', color: '#000' }}
        >
          PNG 저장
        </button>
        <button onClick={onClose} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>닫기</button>
      </div>
    </div>
  )
}
