import { NextResponse } from 'next/server'

export async function POST(request, response) {
  const secretKey = process?.env?.RECAPTCHA_SECRET_API_KEY
  const { captchaToken } = await request.json()

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${captchaToken}`,
      }
    )

    const res = await response.json()

    if (res && res.data?.success && res.data?.score > 0.5) {
      return NextResponse.json({
        success: true,
        score: res.data?.score,
      })
    }

    return NextResponse.json({ success: false, score: res.data?.score })
  } catch (e) {
    console.log('recaptcha error:', e)
  }
}
