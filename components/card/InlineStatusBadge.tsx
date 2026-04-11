'use client'
import { useState, useRef, useCallback } from 'react'

type Status = 'online' | 'vacation'

const STATUS_CONFIG: Record<Status, { emoji: string; label: string; color: string }> = {
  online:   { emoji: '🟢', label: '온라인', color: '#22c55e' },
  vacation: { emoji: '🏖️', label: '휴가중', color: '#f59e0b' },
}

function toStatus(val: unknown): Status {
  if (val === 'vacation') return 'vacation'
  return 'online'
}

interface Props {
  slug: string
  initialStatus: unknown
  hasPIN: boolean
}

export function InlineStatusBadge({ slug, initialStatus, hasPIN }: Props) {
  const [status, setStatus] = useState<Status>(() => toStatus(initialStatus))
  const [showPINModal, setShowPINModal] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [loading, setLoading] = useState(false)
  const verifiedPinRef = useRef('')
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTapRef = useRef(0)

  const openFlow = useCallback(() => {
    if (!hasPIN) return
    if (!verifiedPinRef.current) setShowPINModal(true)
    else setShowPicker(true)
  }, [hasPIN])

  function handleTouchStart() { longPressTimer.current = setTimeout(openFlow, 500) }
  function handleTouchEnd() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
  }
  function handleClick() {
    const now = Date.now()
    if (now - lastTapRef.current < 350) openFlow()
    lastTapRef.current = now
  }

  async function submitPIN() {
    setPinError(''); setLoading(true)
    const res = await fetch(`/api/cards/${slug}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, status }),
    })
    setLoading(false)
    if (res.ok) {
      verifiedPinRef.current = pin
      setShowPINModal(false); setPin(''); setShowPicker(true)
    } else {
      const d = await res.json().catch(() => ({}))
      setPinError(d.error ?? 'PIN이 올바르지 않습니다')
    }
  }

  async function selectStatus(next: Status) {
    const prev = status
    setStatus(next); setShowPicker(false)
    const res = await fetch(`/api/cards/${slug}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: verifiedPinRef.current, status: next }),
    })
    if (!res.ok) setStatus(prev)
  }

  const cfg = STATUS_CONFIG[status]

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold select-none transition-transform active:scale-95"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}
        onClick={handleClick}
        title={hasPIN ? '더블탭·길게눌러 변경' : undefined}
      >
        {cfg.emoji} {cfg.label}
      </button>

      {showPINModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowPINModal(false); setPin(''); setPinError('') } }}>
          <div className="w-full max-w-xs rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-base font-bold text-center" style={{ color: 'var(--text-primary)' }}>PIN 확인</h3>
            <input type="password" inputMode="numeric" maxLength={8} autoFocus
              value={pin} onChange={e => { setPin(e.target.value); setPinError('') }}
              onKeyDown={e => e.key === 'Enter' && pin && submitPIN()}
              placeholder="PIN 입력"
              className="w-full rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            {pinError && <p className="text-xs text-center" style={{ color: '#ef4444' }}>{pinError}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowPINModal(false); setPin(''); setPinError('') }}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>취소</button>
              <button type="button" onClick={submitPIN} disabled={!pin || loading}
                className="flex-1 rounded-full py-2.5 text-sm font-bold disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: '#000' }}>
                {loading ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPicker(false) }}>
          <div className="w-full max-w-xs rounded-2xl p-6 flex flex-col gap-3"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-base font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>상태 변경</h3>
            {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, c]) => (
              <button key={key} type="button" onClick={() => selectStatus(key)}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left transition-all hover:scale-[1.02]"
                style={{ backgroundColor: status === key ? 'var(--bg-elevated)' : 'var(--bg-base)', border: `1px solid ${status === key ? c.color : 'var(--border)'}`, color: 'var(--text-primary)' }}>
                <span className="text-base">{c.emoji}</span>
                <span>{c.label}</span>
                {status === key && <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>현재</span>}
              </button>
            ))}
            <button type="button" onClick={() => setShowPicker(false)}
              className="mt-1 w-full rounded-full py-2.5 text-sm font-semibold"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>취소</button>
          </div>
        </div>
      )}
    </>
  )
}
