// components/admin/QRDownload.tsx
'use client'
import { useRef, useEffect } from 'react'
import QRCode from 'qrcode'

export function QRDownload({ slug }: { slug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`

  useEffect(() => {
    if (canvasRef.current) QRCode.toCanvas(canvasRef.current, url, { width: 160 })
  }, [url])

  function download() {
    const a = document.createElement('a')
    a.href = canvasRef.current!.toDataURL()
    a.download = `${slug}-qr.png`
    a.click()
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <canvas ref={canvasRef} className="rounded-lg" />
      <button type="button" onClick={download}
        className="text-sm text-blue-600 font-medium hover:underline">
        PNG 다운로드
      </button>
    </div>
  )
}
