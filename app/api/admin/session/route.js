
import { isAdminAuthenticated } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function GET() {
  const authenticated = await isAdminAuthenticated()

  return Response.json({
    authenticated,
  })
}
