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
      <div className="h-32 w-full" style={{ backgroundColor: themeColor }} />
      <div className="px-5 pb-4">
        <div className="flex items-end gap-4 -mt-8">
          <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
            {profileImageUrl ? (
              <Image src={profileImageUrl} alt={name} width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">👤</div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            {title && <p className="text-sm text-gray-500">{title}</p>}
            {company && (
              <p className="text-sm font-medium" style={{ color: themeColor }}>{company}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
