import { loadClinicSettingsFromDB, saveClinicSettingsToDB } from '@/lib/clinic-settings-server'
import { stripPrivateSettings } from '@/lib/default-settings'
import { requireAdmin } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function GET() {
  const { settings, fromDb } = await loadClinicSettingsFromDB()
  return Response.json({
    settings: stripPrivateSettings(settings),
    fromDb,
  })
}

export async function PUT(request) {
  if (!(await requireAdmin('manageSettings'))) {
    return Response.json({ error: 'غير مصرح لك بتعديل الإعدادات' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const allowedKeys = [
      'doctor_profile',
      'clinic_contact',
      'theme_settings',
      'reviews',
      'working_hours',
      'holidays',
      'booking_rules',
      'booking_questions',
      'reception_staff',
      'security_settings',
      'whatsapp_settings',
    ]

    const patch = {}
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        patch[key] = body[key]
      }
    }

    const updated = await saveClinicSettingsToDB(patch)
    return Response.json({ success: true, settings: updated })
  } catch (error) {
    console.error('Save settings error:', error)
    return Response.json(
      {
        error:
          error.message?.includes('clinic_settings')
            ? 'جدول clinic_settings غير موجود بعد في Supabase. يرجى تشغيل ملف SQL الكامل أولاً.'
            : error.message || 'تعذر حفظ الإعدادات',
      },
      { status: 500 }
    )
  }
}
