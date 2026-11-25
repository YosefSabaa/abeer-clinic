import { loadClinicSettingsFromDB } from '@/lib/clinic-settings-server'
import { requireAdmin } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { settings, fromDb, error } = await loadClinicSettingsFromDB()
  const whatsappConfigured = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_API_VERSION
  )

  return Response.json({
    settings,
    fromDb,
    dbWarning: !fromDb ? error || 'جدول clinic_settings غير مُنشأ بعد، يتم عرض الإعدادات الافتراضية.' : null,
    whatsappConfigured,
  })
}
