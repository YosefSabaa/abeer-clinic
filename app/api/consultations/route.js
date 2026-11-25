import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

function normalizePhone(raw) {
  let cleaned = String(raw || '').replace(/[\s\-()+]/g, '').trim()
  if (cleaned.startsWith('0020')) cleaned = '0' + cleaned.slice(4)
  else if (cleaned.startsWith('20') && cleaned.length === 12) cleaned = '0' + cleaned.slice(2)
  else if (/^1\d{9}$/.test(cleaned)) cleaned = '0' + cleaned
  return cleaned
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawPhone = searchParams.get('phone')

    // Patient lookup by phone (for /patient portal)
    if (rawPhone) {
      const phone = normalizePhone(rawPhone)
      const { data, error } = await supabaseAdmin
        .from('consultations')
        .select('*')
        .eq('patient_phone', phone)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.message?.includes('consultations')) {
          return Response.json({ consultations: [] })
        }
        return Response.json({ error: error.message }, { status: 500 })
      }

      return Response.json({ consultations: data || [] })
    }

    // Admin list all consultations
    if (!(await requireAdmin())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      if (error.message?.includes('consultations')) {
        return Response.json({
          consultations: [],
          dbWarning: 'جدول consultations غير موجود بعد في Supabase. يرجى تشغيل كود SQL.',
        })
      }
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ consultations: data || [] })
  } catch (error) {
    console.error('Consultations GET error:', error)
    return Response.json({ error: 'تعذر تحميل الاستشارات' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const patientName = String(body.patient_name || '').trim()
    const patientPhone = normalizePhone(body.patient_phone)
    const age = body.age ? parseInt(body.age, 10) : null
    const subject = String(body.subject || 'استشارة طبية').trim()
    const question = String(body.question || '').trim()

    if (!patientName || !/^01\d{9}$/.test(patientPhone) || question.length < 5) {
      return Response.json(
        { error: 'يرجى إدخال الاسم ورقم هاتف مصري صحيح وتفاصيل الاستشارة' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('consultations')
      .insert({
        patient_name: patientName,
        patient_phone: patientPhone,
        age,
        subject,
        question,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) {
      console.error('Consultation insert error:', error)
      return Response.json(
        {
          error: error.message?.includes('consultations')
            ? 'جدول الاستشارات غير مهيأ بعد في قاعدة البيانات.'
            : error.message,
        },
        { status: 500 }
      )
    }

    return Response.json({ success: true, consultation: data })
  } catch (error) {
    console.error('Consultations POST error:', error)
    return Response.json({ error: 'حدث خطأ أثناء إرسال الاستشارة' }, { status: 500 })
  }
}

export async function PATCH(request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = body.id
    const doctorReply = String(body.doctor_reply || '').trim()

    if (!id || !doctorReply) {
      return Response.json({ error: 'يرجى كتابة الرد قبل الحفظ' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('consultations')
      .update({
        doctor_reply: doctorReply,
        status: 'replied',
        replied_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return Response.json({ success: true, consultation: data })
  } catch (error) {
    console.error('Consultations PATCH error:', error)
    return Response.json({ error: error.message || 'تعذر حفظ الرد' }, { status: 500 })
  }
}

export async function DELETE(request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'المعرف مطلوب' }, { status: 400 })

    const { error } = await supabaseAdmin.from('consultations').delete().eq('id', id)
    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error('Consultations DELETE error:', error)
    return Response.json({ error: error.message || 'تعذر الحذف' }, { status: 500 })
  }
}
