import { supabaseAdmin } from '@/lib/supabase-admin'
import { mergeClinicSettings } from '@/lib/default-settings'

export async function loadClinicSettingsFromDB() {
  try {
    const { data, error } = await supabaseAdmin
      .from('clinic_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) {
      // Table might not exist yet before migration
      return { settings: mergeClinicSettings(null), fromDb: false, error: error.message }
    }

    return { settings: mergeClinicSettings(data), fromDb: Boolean(data), error: null }
  } catch (err) {
    return { settings: mergeClinicSettings(null), fromDb: false, error: err.message }
  }
}

export async function saveClinicSettingsToDB(partialUpdate) {
  const { settings: current } = await loadClinicSettingsFromDB()
  const merged = mergeClinicSettings({
    ...current,
    ...partialUpdate,
  })

  const { data, error } = await supabaseAdmin
    .from('clinic_settings')
    .upsert(
      {
        id: 'default',
        ...merged,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mergeClinicSettings(data)
}
