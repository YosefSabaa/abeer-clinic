
import { destroyAdminSession } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function POST() {
  await destroyAdminSession()

  return Response.json({ success: true })
}
