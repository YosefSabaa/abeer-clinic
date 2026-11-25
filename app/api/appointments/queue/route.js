import { supabaseAdmin } from '@/lib/supabase-admin'
import { loadClinicSettingsFromDB } from '@/lib/clinic-settings-server'

export const runtime = 'nodejs'

function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm || '19:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function minutesToHHMM(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatArabic12h(hhmm) {
  const [hRaw, mRaw] = String(hhmm || '19:00').split(':').map(Number)
  const period = hRaw >= 12 ? 'م' : 'ص'
  const h12 = hRaw % 12 || 12
  return `${String(h12).padStart(2, '0')}:${String(mRaw || 0).padStart(2, '0')} ${period}`
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ error: 'تاريخ غير صالح' }, { status: 400 })
    }

    const { settings } = await loadClinicSettingsFromDB()
    const [y, m, d] = date.split('-').map(Number)
    const dayOfWeek = new Date(y, m - 1, d).getDay()

    const holiday = (settings.holidays || []).find((h) => h.date === date)
    const dayRule = (settings.working_hours || []).find((w) => w.dayIndex === dayOfWeek)
    const maxDailyBookings = Math.max(1, Number(settings.booking_rules?.max_daily_bookings) || 20)
    const avgMinutes = Math.max(5, Number(settings.booking_rules?.avg_minutes_per_patient) || 15)

    if (holiday || !dayRule || dayRule.closed) {
      return Response.json({
        date,
        isOpen: false,
        isHoliday: Boolean(holiday),
        holidayReason: holiday?.reason || '',
        bookedCount: 0,
        maxDailyBookings,
        remainingSpots: 0,
        nextQueueNumber: null,
        waitingAhead: 0,
        estimatedTime: null,
        estimatedTimeArabic: null,
        isFull: true,
      })
    }

    const { data: rows, error } = await supabaseAdmin
      .from('appointments')
      .select('id, status, queue_number')
      .eq('appointment_date', date)
      .neq('status', 'cancelled')

    if (error) {
      console.error('Queue status query error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    const activeRows = rows || []
    const bookedCount = activeRows.length
    const waitingAhead = activeRows.filter((r) => r.status !== 'completed').length
    const maxQueueNum = activeRows.reduce((max, r, idx) => Math.max(max, Number(r.queue_number) || idx + 1), 0)
    const nextQueueNumber = Math.max(bookedCount, maxQueueNum) + 1
    const remainingSpots = Math.max(0, maxDailyBookings - bookedCount)
    const isFull = bookedCount >= maxDailyBookings

    const startMinutes = timeToMinutes(dayRule.start || '19:00')
    const estMinutes = startMinutes + bookedCount * avgMinutes
    const estimatedTime = minutesToHHMM(estMinutes)

    return Response.json({
      date,
      isOpen: true,
      isHoliday: false,
      workStart: dayRule.start || '19:00',
      workEnd: dayRule.end || '23:00',
      bookedCount,
      waitingAhead,
      maxDailyBookings,
      remainingSpots,
      nextQueueNumber,
      avgMinutesPerPatient: avgMinutes,
      estimatedTime,
      estimatedTimeArabic: formatArabic12h(estimatedTime),
      isFull,
    })
  } catch (error) {
    console.error('Queue API error:', error)
    return Response.json({ error: 'تعذر تحميل حالة الدور' }, { status: 500 })
  }
}
