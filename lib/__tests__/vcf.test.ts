// lib/__tests__/vcf.test.ts
import { describe, it, expect } from 'vitest'
import { generateVCF } from '../vcf'

describe('generateVCF', () => {
  it('필수 필드만 있는 VCF 생성', () => {
    const vcf = generateVCF({ name: '홍길동', phone: '010-1234-5678' })
    expect(vcf).toContain('BEGIN:VCARD')
    expect(vcf).toContain('FN:홍길동')
    expect(vcf).toContain('TEL;TYPE=CELL:010-1234-5678')
    expect(vcf).toContain('END:VCARD')
  })

  it('모든 필드 포함 VCF 생성', () => {
    const vcf = generateVCF({
      name: '김철수', phone: '010-9999-8888',
      email: 'kim@test.com', company: '테스트회사', title: '팀장',
    })
    expect(vcf).toContain('EMAIL:kim@test.com')
    expect(vcf).toContain('ORG:테스트회사')
    expect(vcf).toContain('TITLE:팀장')
  })
})
