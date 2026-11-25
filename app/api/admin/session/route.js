import { getAdminSession } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ authenticated: false })
  }

  return Response.json({
    authenticated: true,
    role: session.role,
    userName: session.userName,
    permissions: session.permissions,
  })
}
