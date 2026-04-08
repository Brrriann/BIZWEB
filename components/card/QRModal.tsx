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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-gray-900">QR 코드</h2>
        <canvas ref={canvasRef} />
        <button onClick={download} className="text-sm text-blue-600 font-medium">PNG 저장</button>
        <button onClick={onClose} className="text-sm text-gray-400">닫기</button>
      </div>
    </div>
  )
}
