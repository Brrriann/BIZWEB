'use client'
// app/contact/page.tsx
import { useState } from 'react'
import { Send, CheckCircle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: '9a89be3c-5115-4ea9-b95f-2bbe69e27b76',
          subject: `[마이네임이즈] 제작문의 - ${form.name} (${form.company})`,
          from_name: 'mynameiz 제작문의',
          name: form.name,
          company: form.company,
          phone: form.phone,
          email: form.email,
          message: form.message,
        }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    width: '100%',
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="text-center">
          <CheckCircle size={56} strokeWidth={1.5} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>문의가 접수되었습니다</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>빠른 시일 내에 연락드리겠습니다.</p>
          <Link href="/"
            className="inline-block rounded-full px-8 py-3 text-sm font-bold"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}>
            홈으로
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-md mx-auto px-6 py-10" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* 헤더 */}
      <div className="mb-8">
        <Link href="javascript:history.back()" className="inline-flex items-center gap-1 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft size={16} strokeWidth={1.5} />뒤로
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)', letterSpacing: '0.2em' }}>
          MY NAME IS
        </p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>디지털 명함 제작문의</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          아래 양식을 작성해 주시면 빠르게 연락드리겠습니다.
        </p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>이름 *</label>
          <input
            required
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="홍길동"
            className="rounded-xl px-4 py-3 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>회사명</label>
          <input
            value={form.company}
            onChange={e => update('company', e.target.value)}
            placeholder="마그네이트코리아"
            className="rounded-xl px-4 py-3 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>연락처 *</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="010-0000-0000"
            className="rounded-xl px-4 py-3 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="hello@example.com"
            className="rounded-xl px-4 py-3 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>문의내용</label>
          <textarea
            value={form.message}
            onChange={e => update('message', e.target.value)}
            placeholder="제작 인원, 원하시는 기능 등을 자유롭게 작성해주세요."
            rows={4}
            className="rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            style={inputStyle}
          />
        </div>

        {status === 'error' && (
          <p className="text-sm text-center" style={{ color: '#f3727f' }}>전송에 실패했습니다. 다시 시도해주세요.</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] disabled:opacity-50 mt-2"
          style={{ backgroundColor: 'var(--accent)', color: '#000', letterSpacing: '0.1em' }}
        >
          <Send size={16} strokeWidth={2} />
          {status === 'loading' ? '전송 중...' : '문의 보내기'}
        </button>
      </form>

      <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
        © 마그네이트코리아 · official@magnatekorea.com
      </p>
    </main>
  )
}
