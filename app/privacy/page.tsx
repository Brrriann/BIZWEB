// app/privacy/page.tsx
export const metadata = { title: '개인정보처리방침 | 마이네임이즈' }

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12" style={{ color: 'var(--text-primary)' }}>
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>개인정보처리방침</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>1. 수집하는 개인정보 항목</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>마이네임이즈는 디지털 명함 서비스 제공을 위해 다음 정보를 수집합니다.</p>
          <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>성명, 직함, 소속회사</li>
            <li>전화번호, 이메일 주소</li>
            <li>주소, 홈페이지 URL</li>
            <li>프로필 사진, 소개글</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>2. 개인정보 수집 및 이용 목적</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>수집된 정보는 디지털 명함 페이지 생성 및 운영 목적으로만 사용됩니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>3. 개인정보 보유 및 이용 기간</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>서비스 이용 계약 종료 시 즉시 파기합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>4. 개인정보의 국외 이전</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>본 서비스는 Supabase(미국 AWS)를 통해 데이터를 처리합니다. 이는 개인정보의 국외 이전에 해당하며, 수탁업체는 Supabase Inc. (미국)입니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>5. 개인정보 처리 위탁</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>제3자에게 개인정보를 제공하지 않습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>6. 정보주체의 권리</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>개인정보 열람, 정정, 삭제를 요청하실 수 있습니다. 아래 이메일로 문의해 주세요.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>7. 개인정보 보호책임자</h2>
          <p className="text-sm">이메일: <a href="mailto:admin@mynameiz.com" style={{ color: 'var(--accent)' }}>admin@mynameiz.com</a></p>
        </section>
        <p className="text-xs mt-8" style={{ color: 'var(--text-muted)' }}>시행일: 2026년 4월 7일</p>
      </div>
    </main>
  )
}
