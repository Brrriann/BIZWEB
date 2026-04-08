// lib/vcf.ts
interface VCFData {
  name: string
  phone?: string
  email?: string
  company?: string
  title?: string
  address?: string
  website?: string
}

export function generateVCF(data: VCFData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    `N:${data.name};;;`,
  ]
  if (data.phone)   lines.push(`TEL;TYPE=CELL:${data.phone}`)
  if (data.email)   lines.push(`EMAIL:${data.email}`)
  if (data.company) lines.push(`ORG:${data.company}`)
  if (data.title)   lines.push(`TITLE:${data.title}`)
  if (data.address) lines.push(`ADR:;;${data.address};;;;`)
  if (data.website) lines.push(`URL:${data.website}`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}
