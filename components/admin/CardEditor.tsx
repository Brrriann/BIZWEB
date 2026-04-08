// components/admin/CardEditor.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
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

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
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

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={save} className="space-y-6">
      {/* 프로필 이미지 */}
      <div>
        <label className={labelClass}>프로필 사진</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden">
            {form.profile_image_url
              ? <Image src={form.profile_image_url} alt="" width={64} height={64} className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
            }
          </div>
          <label className="cursor-pointer text-sm text-blue-600 font-medium hover:underline">
            {uploadingProfile ? '업로드 중...' : '사진 변경'}
            <input type="file" accept="image/*" onChange={uploadProfile} disabled={uploadingProfile} className="hidden" />
          </label>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>이름 *</label><input required value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>직함</label><input value={form.title ?? ''} onChange={e => update('title', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>회사</label><input value={form.company ?? ''} onChange={e => update('company', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>전화번호</label><input value={form.phone ?? ''} onChange={e => update('phone', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>이메일</label><input type="email" value={form.email ?? ''} onChange={e => update('email', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>홈페이지</label><input value={form.website ?? ''} onChange={e => update('website', e.target.value)} className={inputClass} /></div>
      </div>
      <div><label className={labelClass}>주소</label><input value={form.address ?? ''} onChange={e => update('address', e.target.value)} className={inputClass} /></div>
      <div><label className={labelClass}>소개글</label><textarea value={form.bio ?? ''} onChange={e => update('bio', e.target.value)} rows={3} className={inputClass} /></div>

      {/* 테마 */}
      <ThemePicker value={form.theme_color} onChange={v => update('theme_color', v)} />

      {/* 활성 상태 */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="active" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} className="w-4 h-4" />
        <label htmlFor="active" className="text-sm text-gray-700">페이지 활성화</label>
      </div>

      {/* 저장 */}
      <button type="submit" disabled={saving}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {saving ? '저장 중...' : saved ? '✓ 저장됨' : '저장'}
      </button>

      <hr className="border-gray-100" />

      {/* SNS */}
      <SocialLinksEditor cardId={card.id} links={socialLinks} onUpdate={onRefresh} />

      <hr className="border-gray-100" />

      {/* 갤러리 */}
      <GalleryEditor cardId={card.id} images={galleryImages} onUpdate={onRefresh} />

      <hr className="border-gray-100" />

      {/* QR */}
      <div>
        <label className={labelClass}>QR 코드</label>
        <QRDownload slug={card.slug} />
      </div>
    </form>
  )
}
