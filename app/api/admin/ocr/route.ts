// app/api/admin/ocr/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })

  const { imageBase64, mimeType } = await req.json()
  if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  )

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Extract JSON from response
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return NextResponse.json({ error: 'No JSON in response', raw: text }, { status: 422 })

  try {
    const parsed = JSON.parse(match[0])
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'JSON parse error', raw: text }, { status: 422 })
  }
}
