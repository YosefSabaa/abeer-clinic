
import {
  verifyAdminPin,
  createAdminSession,
} from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()
    const pin = String(body.pin || '')

    if (!verifyAdminPin(pin)) {
      return Response.json(
        { error: 'رمز الدخول غير صحيح' },
        { status: 401 }
      )
    }

    await createAdminSession()

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin login error:', error)

    return Response.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}
