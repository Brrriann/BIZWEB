'use client'

import { useState, useRef, useCallback } from 'react'

type Status = 'online' | 'vacation'

interface Props {
  slug: string
  initialStatus: Status
  hasPIN: boolean
}

const STATUS_CONFIG: Record<Status, { emoji: string; label: string; color: string }> = {
  online:   { emoji: '🟢', label: '온라인', color: '#22c55e' },
  vacation: { emoji: '🏖️', label: '휴가중', color: '#f59e0b' },
}

export function StatusBadge({ slug, initialStatus, hasPIN }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [showPINModal, setShowPINModal] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [loading, setLoading] = useState(false)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTapRef = useRef<number>(0)

  // Verified PIN kept in memory for the session so user isn't re-prompted
  const verifiedPinRef = useRef<string>('')

  const openFlow = useCallback(() => {
    if (!hasPIN) return // PIN not set by admin — no status change allowed
    if (!verifiedPinRef.current) {
      setShowPINModal(true)
    } else {
      setShowPicker(true)
    }
  }, [hasPIN])

  // Long-press handlers (touch)
  function handleTouchStart() {
    longPressTimer.current = setTimeout(() => {
      openFlow()
    }, 500)
  }

  function handleTouchEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // Double-tap handler (also works as fallback for mouse users)
  function handleClick() {
    const now = Date.now()
    if (now - lastTapRef.current < 350) {
      openFlow()
    }
    lastTapRef.current = now
  }

  async function submitPIN() {
    setPinError('')
    setLoading(true)
    // Verify the PIN by attempting a no-op status update (same status)
    const res = await fetch(`/api/cards/${slug}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, status }),
    })
    setLoading(false)
    if (res.ok) {
      verifiedPinRef.current = pin
      setShowPINModal(false)
      setPin('')
      setShowPicker(true)
    } else {
      const data = await res.json()
      setPinError(data.error ?? 'PIN이 올바르지 않습니다')
    }
  }

  async function selectStatus(newStatus: Status) {
    const prevStatus = status
    setStatus(newStatus) // optimistic update
    setShowPicker(false)

    const res = await fetch(`/api/cards/${slug}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: verifiedPinRef.current || undefined, status: newStatus }),
    })

    if (!res.ok) {
      // Revert on failure
      setStatus(prevStatus)
    }
  }

  const cfg = STATUS_CONFIG[status]

  return (
    <>
      {/* Badge */}
      <div className="flex flex-col items-center gap-1 py-2">
        <button
          type="button"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold select-none transition-transform active:scale-95"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <span>{cfg.emoji}</span>
          <span>{cfg.label}</span>
        </button>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          길게 눌러 변경
        </span>
      </div>

      {/* PIN Modal */}
      {showPINModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPINModal(false); setPin(''); setPinError('') } }}
        >
          <div
            className="w-full max-w-xs rounded-2xl p-6 flex flex-col gap-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3 className="text-base font-bold text-center" style={{ color: 'var(--text-primary)' }}>
              PIN 확인
            </h3>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              autoFocus
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError('') }}
              onKeyDown={e => e.key === 'Enter' && pin && submitPIN()}
              placeholder="PIN 입력"
              className="w-full rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            />
            {pinError && (
              <p className="text-xs text-center" style={{ color: '#ef4444' }}>{pinError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowPINModal(false); setPin(''); setPinError('') }}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitPIN}
                disabled={!pin || loading}
                className="flex-1 rounded-full py-2.5 text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: '#000' }}
              >
                {loading ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Picker Modal */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPicker(false) }}
        >
          <div
            className="w-full max-w-xs rounded-2xl p-6 flex flex-col gap-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3 className="text-base font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
              상태 변경
            </h3>
            {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => selectStatus(key)}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: status === key ? 'var(--bg-elevated)' : 'var(--bg-base)',
                  border: `1px solid ${status === key ? cfg.color : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                }}
              >
                <span className="text-base">{cfg.emoji}</span>
                <span>{cfg.label}</span>
                {status === key && <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>현재</span>}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="mt-1 w-full rounded-full py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </>
  )
}
