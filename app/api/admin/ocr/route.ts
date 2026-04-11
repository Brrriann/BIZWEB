// app/api/admin/ocr/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OCR를 사용할 수 없습니다' }, { status: 500 })

  const { imageBase64, mimeType } = await req.json()
  if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  // ~10MB image limit (base64 is ~4/3x raw size)
  if (typeof imageBase64 !== 'string' || imageBase64.length > 13_000_000) {
    return NextResponse.json({ error: '이미지 크기가 너무 큽니다 (최대 10MB)' }, { status: 413 })
  }

  const prompt = `이 명함 이미지에서 다음 정보를 추출해 JSON으로만 응답해 (설명 없이 JSON만):
{
  "name": "이름",
  "title": "직함/직책",
  "company": "회사명",
  "phone": "전화번호 (숫자와 -만)",
  "email": "이메일",
  "address": "주소",
  "website": "웹사이트 URL"
}
없는 항목은 빈 문자열로 반환해.`

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
      ],
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'OCR 처리 중 오류가 발생했습니다' }, { status: 502 })
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Extract JSON from response
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return NextResponse.json({ error: '명함 정보를 인식하지 못했습니다' }, { status: 422 })

  try {
    const parsed = JSON.parse(match[0])
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: '명함 정보를 인식하지 못했습니다' }, { status: 422 })
  }
}
