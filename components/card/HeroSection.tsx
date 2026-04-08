// components/card/HeroSection.tsx
import Image from 'next/image'

interface Props {
  name: string
  title?: string
  company?: string
  profileImageUrl?: string
  themeColor: string
}

export function HeroSection({ name, title, company, profileImageUrl, themeColor }: Props) {
  return (
    <div className="relative">
      {/* Hero gradient with theme color */}
      <div
        className="h-36 w-full"
        style={{
          background: `linear-gradient(180deg, ${themeColor} 0%, var(--bg-base) 100%)`,
        }}
      />
      <div className="px-5 pb-5">
        <div className="flex items-end gap-4 -mt-10">
          <div
            className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0"
            style={{
              border: '4px solid var(--bg-surface)',
              boxShadow: 'var(--shadow-elevated)',
              backgroundColor: 'var(--bg-elevated)',
            }}
          >
            {profileImageUrl ? (
              <Image src={profileImageUrl} alt={name} width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl" style={{ color: 'var(--text-muted)' }}>👤</div>
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{name}</h1>
            {title && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{title}</p>}
            {company && (
              <p className="text-sm font-semibold" style={{ color: themeColor }}>{company}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
