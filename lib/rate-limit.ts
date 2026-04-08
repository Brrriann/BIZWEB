// lib/rate-limit.ts
// Cloudflare Workers는 요청 간 메모리 공유 안 됨 → DB 기반 중복 체크 사용
const ONE_HOUR_AGO = () => new Date(Date.now() - 60 * 60 * 1000).toISOString()

export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

export async function shouldCountView(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  cardId: string,
  ip: string
): Promise<boolean> {
  const ipHash = await hashIP(ip)
  const { count } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('card_id', cardId)
    .eq('ip_hash', ipHash)
    .gte('viewed_at', ONE_HOUR_AGO())
  return (count ?? 0) === 0
}
