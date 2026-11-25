'use client'

import Link from 'next/link'
import QRCodeSVG from '@/components/QRCodeSVG'

export default function BookingTicketModal({ ticket, onClose }) {
  if (!ticket) return null

  const qrPayload = [
    `CODE:${ticket.bookingCode}`,
    `QUEUE:#${ticket.queueNumber}`,
    `DATE:${ticket.date}`,
    `EST:${ticket.estimatedTime}`,
    `NAME:${ticket.patientName}`,
    `PHONE:${ticket.patientPhone}`,
  ].join('\n')

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Ticket Header */}
        <div className="clinic-accent-bg text-white p-5 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[11px] font-bold">
            <span>✓</span>
            <span>تم تأكيد الحجز بنجاح</span>
          </div>
          <h2 className="text-lg font-alexandria font-bold pt-1">{ticket.doctorName}</h2>
          <p className="text-xs opacity-90">{ticket.clinicAddress}</p>
        </div>

        {/* Queue Number & Booking Code */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <span className="block text-[11px] text-slate-500">رقم الدور</span>
              <span className="block text-3xl font-alexandria font-bold clinic-accent-text mt-0.5">
                #{ticket.queueNumber}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <span className="block text-[11px] text-slate-500">الوقت التقريبي للدخول</span>
              <span className="block text-lg font-alexandria font-bold text-slate-900 mt-1.5" dir="ltr">
                {ticket.estimatedTimeArabic}
              </span>
            </div>
          </div>

          {/* QR Code Box */}
          <div className="flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 space-y-2">
            <QRCodeSVG value={qrPayload} size={156} className="shadow-sm border border-slate-200" />
            <div className="text-center">
              <span className="block text-[10px] text-slate-500">رقم الحجز</span>
              <span className="font-mono text-sm font-bold text-slate-900 tracking-wider" dir="ltr">
                {ticket.bookingCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              أظهر هذا الرمز للاستقبال عند حضورك للعيادة
            </p>
          </div>

          {/* Details List */}
          <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="text-slate-500">اسم المريض</span>
              <span className="font-bold text-slate-900">{ticket.patientName}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="text-slate-500">رقم الهاتف</span>
              <span className="font-bold text-slate-900" dir="ltr">
                {ticket.patientPhone}
              </span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="text-slate-500">التاريخ</span>
              <span className="font-bold text-slate-900" dir="ltr">
                {ticket.date}
              </span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="text-slate-500">نوع الزيارة / السعر</span>
              <span className="font-bold text-slate-900">
                {ticket.visitType} — {ticket.priceLabel}
              </span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="text-slate-500">عدد المنتظرين قبلك</span>
              <span className="font-bold text-slate-900">{ticket.waitingAhead} أشخاص</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 clinic-accent-bg text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition"
            >
              طباعة التذكرة
            </button>
            <Link
              href="/patient"
              className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold text-center hover:bg-slate-800 transition"
            >
              ملفي الطبي
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
