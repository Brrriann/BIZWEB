// components/admin/CardEditor.tsx
'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { ScanLine } from 'lucide-react'
import { ThemePicker } from './ThemePicker'
import { SocialLinksEditor } from './SocialLinksEditor'
import { GalleryEditor } from './GalleryEditor'
import { QRDownload } from './QRDownload'
import { LanguageEditor } from './LanguageEditor'
import type { Card, SocialLink, GalleryImage, CardTranslation, ExtraContact } from '@/lib/types'

// Auto-format Korean phone number with hyphens
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.startsWith('02')) {
    if (d.length <= 2) return d
    if (d.length <= 6) return `${d.slice(0,2)}-${d.slice(2)}`
    if (d.length <= 9) return `${d.slice(0,2)}-${d.slice(2,5)}-${d.slice(5)}`
    return `${d.slice(0,2)}-${d.slice(2,6)}-${d.slice(6)}`
  }
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}-${d.slice(3)}`
  if (d.length <= 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`
}

const PHONE_TYPES = new Set(['mobile', 'office', 'fax'])

// SHA-256 hash using Web Crypto API — bcrypt is unavailable in the browser
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

interface Props {
  card: Card
  socialLinks: SocialLink[]
  galleryImages: GalleryImage[]
  onRefresh: () => void
  onDelete?: () => void
}

export function CardEditor({ card, socialLinks, galleryImages, onRefresh, onDelete }: Props) {
  const [form, setForm] = useState({ ...card, status_pin_input: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const scanInputRef = useRef<HTMLInputElement>(null)

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function updateLangs(supported: string[], translations: Record<string, CardTranslation>) {
    setForm(prev => ({ ...prev, supported_languages: supported, translations }))
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

    // Build the payload — exclude the ephemeral status_pin_input field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status_pin_input, ...rest } = form
    const payload: typeof rest & { status_pin?: string } = { ...rest }

    // If admin typed a new PIN, hash it with SHA-256 before saving
    if (status_pin_input.trim()) {
      payload.status_pin = await sha256(status_pin_input.trim())
    }

    await fetch(`/api/admin/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaved(true)
    setSaving(false)
    // Clear the PIN input after successful save
    setForm(prev => ({ ...prev, status_pin_input: '' }))
    onRefresh()
  }

  async function deleteCard() {
    setDeleting(true)
    await fetch(`/api/admin/cards/${card.id}`, { method: 'DELETE' })
    setDeleting(false)
    onDelete?.()
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
          { label: '전화번호', field: 'phone', phone: true },
          { label: '이메일', field: 'email', type: 'email' },
        ].map(({ label, field, required, type, phone }) => (
          <div key={field}>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
            <input
              type={type || 'text'}
              inputMode={phone ? 'numeric' : undefined}
              required={required}
              value={(form as unknown as Record<string, string>)[field] ?? ''}
              onChange={e => update(field, phone ? formatPhone(e.target.value) : e.target.value)}
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

      {/* 추가 연락처 */}
      <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>추가 연락처</label>
          <button
            type="button"
            onClick={() => {
              const contacts: ExtraContact[] = [...(form.extra_contacts ?? []), { type: 'office', value: '' }]
              setForm(prev => ({ ...prev, extra_contacts: contacts }))
              setSaved(false)
            }}
            className="text-xs font-bold rounded-full px-3 py-1 transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent)', border: '1px solid var(--border)' }}
          >+ 연락처 추가</button>
        </div>
        <div className="flex flex-col gap-2">
          {(form.extra_contacts ?? []).map((contact: ExtraContact, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={contact.type}
                onChange={e => {
                  const contacts = [...(form.extra_contacts ?? [])]
                  contacts[i] = { ...contacts[i], type: e.target.value as ExtraContact['type'] }
                  setForm(prev => ({ ...prev, extra_contacts: contacts }))
                  setSaved(false)
                }}
                className="rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ ...inputStyle, width: '110px', flexShrink: 0 }}
              >
                <option value="mobile">휴대폰</option>
                <option value="office">일반전화</option>
                <option value="fax">팩스</option>
                <option value="email">이메일</option>
                <option value="address">주소</option>
              </select>
              <input
                type="text"
                inputMode={PHONE_TYPES.has(contact.type) ? 'numeric' : undefined}
                value={contact.value}
                onChange={e => {
                  const contacts = [...(form.extra_contacts ?? [])]
                  const val = PHONE_TYPES.has(contact.type) ? formatPhone(e.target.value) : e.target.value
                  contacts[i] = { ...contacts[i], value: val }
                  setForm(prev => ({ ...prev, extra_contacts: contacts }))
                  setSaved(false)
                }}
                placeholder={PHONE_TYPES.has(contact.type) ? '010-0000-0000' : '값 입력'}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
              <input
                type="text"
                value={contact.label ?? ''}
                onChange={e => {
                  const contacts = [...(form.extra_contacts ?? [])]
                  contacts[i] = { ...contacts[i], label: e.target.value }
                  setForm(prev => ({ ...prev, extra_contacts: contacts }))
                  setSaved(false)
                }}
                placeholder="라벨(선택)"
                className="rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ ...inputStyle, width: '90px', flexShrink: 0 }}
              />
              <button
                type="button"
                onClick={() => {
                  const contacts = (form.extra_contacts ?? []).filter((_: ExtraContact, j: number) => j !== i)
                  setForm(prev => ({ ...prev, extra_contacts: contacts }))
                  setSaved(false)
                }}
                className="text-sm px-2 py-2 rounded-xl transition-all hover:scale-110"
                style={{ color: '#f3727f', flexShrink: 0 }}
              >✕</button>
            </div>
          ))}
        </div>
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


      {/* 상태 설정 */}
      <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>상태 설정</label>

        {/* 상태 선택 */}
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>현재 상태</label>
          <select
            value={form.status}
            onChange={e => update('status', e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
          >
            <option value="online">🟢 온라인</option>
            <option value="vacation">🏖️ 휴가중</option>
          </select>
        </div>

        {/* PIN 설정 */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            상태 변경 PIN
            {form.status_pin && <span className="ml-2 text-[10px]" style={{ color: '#22c55e' }}>● 설정됨</span>}
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={form.status_pin_input}
            onChange={e => update('status_pin_input', e.target.value)}
            placeholder="PIN 설정 (4자리 숫자 권장)"
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
          />
          <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            입력 시 저장할 때 SHA-256으로 암호화됩니다. 비워두면 기존 PIN이 유지됩니다.
          </p>
        </div>
      </div>

      {/* 인트로 애니메이션 */}
      <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>인트로 애니메이션</label>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>방문자가 카드를 처음 열 때 한 번만 재생됩니다.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { key: null, label: '없음', icon: '✕' },
            { key: 'fade', label: '페이드', icon: '✦' },
            { key: 'slide', label: '슬라이드', icon: '▲' },
            { key: 'typewriter', label: '타이핑', icon: 'Aa' },
            { key: 'particles', label: '파티클', icon: '✦✦' },
            { key: 'wave', label: '웨이브', icon: '〜' },
          ].map(({ key, label, icon }) => (
            <button
              key={String(key)}
              type="button"
              onClick={() => update('intro_animation', key ?? '')}
              style={{
                padding: '12px 8px',
                borderRadius: 12,
                border: `2px solid ${(form.intro_animation ?? '') === (key ?? '') ? 'var(--accent)' : 'var(--border)'}`,
                background: (form.intro_animation ?? '') === (key ?? '') ? 'rgba(30,215,96,0.1)' : 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{label}</div>
            </button>
          ))}
        </div>

        {/* 애니메이션 텍스트 — fade/typewriter에 표시 */}
        {form.intro_animation && form.intro_animation !== 'slide' && form.intro_animation !== 'particles' && form.intro_animation !== 'wave' && (
          <div className="mt-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              애니메이션 문구
              <span className="ml-1 font-normal" style={{ color: 'var(--text-muted)' }}>
                (비워두면 {form.intro_animation === 'typewriter' ? '이름' : '"MY NAME IS."'} 사용)
              </span>
            </label>
            <input
              type="text"
              value={form.intro_animation_text ?? ''}
              onChange={e => update('intro_animation_text', e.target.value)}
              placeholder={form.intro_animation === 'typewriter' ? card.name : 'MY NAME IS.'}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
        )}
      </div>

      {/* 다국어 설정 */}
      <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>다국어 설정</label>
        <LanguageEditor
          supported={form.supported_languages ?? ['ko']}
          translations={form.translations ?? {}}
          onChange={updateLangs}
        />
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

      <hr style={{ borderColor: 'var(--border)' }} />

      {/* 명함 삭제 */}
      <div className="rounded-2xl p-4" style={{ border: '1px solid #3f1212', backgroundColor: 'rgba(239,68,68,0.04)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: '#f3727f' }}>명함 삭제</p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>삭제하면 복구할 수 없습니다. 모든 링크, 갤러리 이미지, 조회 기록이 함께 삭제됩니다.</p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-full px-5 py-2 text-sm font-bold transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f3727f', border: '1px solid #3f1212' }}
          >
            명함 삭제
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold" style={{ color: '#f3727f' }}>정말 삭제하시겠습니까?</span>
            <button
              type="button"
              onClick={deleteCard}
              disabled={deleting}
              className="rounded-full px-5 py-2 text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}
            >
              {deleting ? '삭제 중...' : '확인, 삭제'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-sm px-3"
              style={{ color: 'var(--text-muted)' }}
            >
              취소
            </button>
          </div>
        )}
      </div>
    </form>
  )
}
