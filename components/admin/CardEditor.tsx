// components/admin/CardEditor.tsx
'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { ScanLine } from 'lucide-react'
import { ThemePicker } from './ThemePicker'
import { SocialLinksEditor } from './SocialLinksEditor'
import { GalleryEditor } from './GalleryEditor'
import { QRDownload } from './QRDownload'
import type { Card, SocialLink, GalleryImage } from '@/lib/types'

interface Props {
  card: Card
  socialLinks: SocialLink[]
  galleryImages: GalleryImage[]
  onRefresh: () => void
}

export function CardEditor({ card, socialLinks, galleryImages, onRefresh }: Props) {
  const [form, setForm] = useState({ ...card })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const scanInputRef = useRef<HTMLInputElement>(null)

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function scanBusinessCard(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setScanError('')
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/admin/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'OCR 실패')
      setForm(prev => ({
        ...prev,
        ...(data.name && { name: data.name }),
        ...(data.title && { title: data.title }),
        ...(data.company && { company: data.company }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email && { email: data.email }),
        ...(data.address && { address: data.address }),
      }))
      setSaved(false)
      if (data.website) {
        setScanError(`✓ 스캔 완료! 웹사이트: ${data.website} (서비스 링크에 직접 추가해주세요)`)
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'OCR 실패')
    } finally {
      setScanning(false)
      if (scanInputRef.current) scanInputRef.current.value = ''
    }
  }

  async function uploadProfile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingProfile(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const { url } = await res.json()
    update('profile_image_url', url)
    setUploadingProfile(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/admin/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true)
    setSaving(false)
    onRefresh()
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* 프로필 이미지 */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>프로필 사진</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--border)' }}>
            {form.profile_image_url
              ? <Image src={form.profile_image_url} alt="" width={64} height={64} className="object-cover w-full h-full" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
            }
          </div>
          <label className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--accent)' }}>
            {uploadingProfile ? '업로드 중...' : '사진 변경'}
            <input type="file" accept="image/*" onChange={uploadProfile} disabled={uploadingProfile} className="hidden" />
          </label>
        </div>
      </div>

      {/* 명함 OCR 스캔 */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>명함 스캔 (AI 자동 입력)</label>
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all hover:scale-[1.02]"
          style={{ backgroundColor: scanning ? 'var(--bg-elevated)' : 'var(--bg-surface)', border: '1px solid var(--border)', color: scanning ? 'var(--text-muted)' : 'var(--accent)' }}>
          <ScanLine size={16} strokeWidth={1.5} />
          {scanning ? '스캔 중...' : '명함 이미지 업로드'}
          <input ref={scanInputRef} type="file" accept="image/*" onChange={scanBusinessCard} disabled={scanning} className="hidden" />
        </label>
        {scanError && (
          <p className="mt-2 text-xs" style={{ color: scanError.startsWith('✓') ? 'var(--accent)' : '#f3727f' }}>{scanError}</p>
        )}
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: '이름 *', field: 'name', required: true },
          { label: '직함', field: 'title' },
          { label: '회사', field: 'company' },
          { label: '전화번호', field: 'phone' },
          { label: '이메일', field: 'email', type: 'email' },
        ].map(({ label, field, required, type }) => (
          <div key={field}>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
            <input
              type={type || 'text'}
              required={required}
              value={(form as unknown as Record<string, string>)[field] ?? ''}
              onChange={e => update(field, e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>주소</label>
        <input value={form.address ?? ''} onChange={e => update('address', e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2" style={inputStyle} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>소개글</label>
        <textarea value={form.bio ?? ''} onChange={e => update('bio', e.target.value)} rows={3}
          className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2" style={inputStyle} />
      </div>

      {/* 테마 */}
      <ThemePicker value={form.theme_color} onChange={v => update('theme_color', v)} />

      {/* 활성 상태 */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="active" checked={form.is_active} onChange={e => update('is_active', e.target.checked)}
          className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} />
        <label htmlFor="active" className="text-sm" style={{ color: 'var(--text-secondary)' }}>페이지 활성화</label>
      </div>

      {/* 저장 */}
      <button type="submit" disabled={saving}
        className="w-full rounded-full py-3 font-bold uppercase tracking-wider transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{ backgroundColor: 'var(--accent)', color: '#000', letterSpacing: '0.1em' }}>
        {saving ? '저장 중...' : saved ? '✓ 저장됨' : '저장'}
      </button>

      <hr style={{ borderColor: 'var(--border)' }} />

      {/* 서비스 링크 */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>섹션 타이틀</label>
        <input
          value={form.social_links_title ?? ''}
          onChange={e => update('social_links_title', e.target.value)}
          placeholder="Our Service"
          className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 mb-4"
          style={inputStyle}
        />
      </div>
      <SocialLinksEditor cardId={card.id} links={socialLinks} onUpdate={onRefresh} />

      <hr style={{ borderColor: 'var(--border)' }} />

      {/* 갤러리 */}
      <GalleryEditor cardId={card.id} images={galleryImages} onUpdate={onRefresh} />

      <hr style={{ borderColor: 'var(--border)' }} />

      {/* QR */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>QR 코드</label>
        <QRDownload slug={card.slug} />
      </div>
    </form>
  )
}
