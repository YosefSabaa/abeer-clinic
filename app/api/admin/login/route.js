import { authenticateCredentials, createAdminSession } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()
    const phone = String(body.phone || '').trim()
    const password = String(body.password || '').trim()

    if (!phone || !password) {
      return Response.json(
        { error: 'يرجى إدخال رقم الهاتف وكلمة المرور' },
        { status: 400 }
      )
    }

    const sessionMeta = await authenticateCredentials(phone, password)
    if (!sessionMeta) {
      return Response.json(
        { error: 'رقم الهاتف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    await createAdminSession(sessionMeta)

    return Response.json({
      success: true,
      role: sessionMeta.role,
      userName: sessionMeta.userName,
      permissions: sessionMeta.permissions,
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return Response.json({ error: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 })
  }
}
