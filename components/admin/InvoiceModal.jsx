'use client'

import { useMemo, useState } from 'react'
import QRCodeSVG from '@/components/QRCodeSVG'

const QUICK_SERVICES = [
  { name: 'سونار (موجات صوتية)', price: 200 },
  { name: 'متابعة حمل', price: 250 },
  { name: 'تركيب / متابعة وسيلة', price: 300 },
  { name: 'تحليل معملي بالعيادة', price: 150 },
]

export default function InvoiceModal({ appointment, settings, onClose }) {
  const rules = settings?.booking_rules || {}
  const doc = settings?.doctor_profile || {}
  const contact = settings?.clinic_contact || {}

  const currency = rules.currency_ar || 'ج.م'
  const isFollowup = appointment?.slot_type === (rules.followup_label_ar || 'استشارة')
  const defaultPrice = isFollowup
    ? Number(rules.followup_price) || 150
    : Number(rules.consultation_price) || 360

  const [items, setItems] = useState([
    {
      id: 'item-1',
      description: `${appointment?.slot_type || 'كشف طبي'} — ${doc.name_ar || 'العيادة'}`,
      qty: 1,
      price: defaultPrice,
    },
  ])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('نقدي (كاش)')
  const [paymentStatus, setPaymentStatus] = useState('مدفوع بالكامل')
  const [invoiceNotes, setInvoiceNotes] = useState('')

  const invoiceNumber = useMemo(() => {
    const datePart = String(appointment?.appointment_date || new Date().toISOString().slice(0, 10)).replace(/-/g, '')
    const qPart = String(appointment?.queue_number || 1).padStart(3, '0')
    return `INV-${datePart}-${qPart}`
  }, [appointment])

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 1) * (Number(it.price) || 0), 0),
    [items]
  )
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0))

  const qrData = [
    `INV:${invoiceNumber}`,
    `BOOKING:${appointment?.booking_code || '-'}`,
    `PATIENT:${appointment?.patient_name || ''}`,
    `TOTAL:${grandTotal} ${currency}`,
    `DATE:${appointment?.appointment_date || ''}`,
  ].join('\n')

  const addItem = (description = '', price = 0) => {
    setItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}-${Math.random()}`, description, qty: 1, price },
    ])
  }

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  const removeItem = (id) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev))
  }

  if (!appointment) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl space-y-4 my-4">
        {/* Top Editor Bar (hidden on print) */}
        <div className="clinic-card border clinic-border rounded-2xl p-4 space-y-3 no-print">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-alexandria font-bold text-sm clinic-text">تجهيز وطباعة الفاتورة</h2>
              <p className="text-[11px] clinic-text-muted">
                يمكنك تعديل البنود أو إضافة خدمات إضافية قبل الطباعة مباشرة.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="clinic-accent-bg text-white px-4 py-2 rounded-xl text-xs font-bold shadow-glow hover:opacity-90 transition"
              >
                🖨 طباعة الفاتورة
              </button>
              <button
                type="button"
                onClick={onClose}
                className="clinic-surface border clinic-border px-3 py-2 rounded-xl text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>
          </div>

          {/* Quick Add Services */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t clinic-border">
            <span className="text-[11px] clinic-text-muted ms-1">إضافة سريعة:</span>
            {QUICK_SERVICES.map((svc) => (
              <button
                key={svc.name}
                type="button"
                onClick={() => addItem(svc.name, svc.price)}
                className="clinic-surface border clinic-border clinic-accent-hover px-2.5 py-1 rounded-lg text-[11px] font-bold transition"
              >
                + {svc.name} ({svc.price})
              </button>
            ))}
            <button
              type="button"
              onClick={() => addItem('خدمة إضافية', 0)}
              className="clinic-accent-soft border px-2.5 py-1 rounded-lg text-[11px] font-bold"
            >
              + بند مخصص
            </button>
          </div>

          {/* Payment Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] clinic-text-muted mb-1">طريقة الدفع</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full clinic-surface border clinic-border rounded-xl p-2 text-xs outline-none"
              >
                <option value="نقدي (كاش)">نقدي (كاش)</option>
                <option value="فودافون كاش">فودافون كاش</option>
                <option value="إنستاباي (InstaPay)">إنستاباي (InstaPay)</option>
                <option value="بطاقة بنكية (Visa)">بطاقة بنكية (Visa)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] clinic-text-muted mb-1">حالة السداد</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full clinic-surface border clinic-border rounded-xl p-2 text-xs outline-none"
              >
                <option value="مدفوع بالكامل">مدفوع بالكامل</option>
                <option value="دفع جزئي">دفع جزئي</option>
                <option value="غير مدفوع">غير مدفوع</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] clinic-text-muted mb-1">خصم ({currency})</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="w-full clinic-surface border clinic-border rounded-xl p-2 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Printable Professional Invoice Sheet */}
        <div
          id="printable-invoice"
          className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
        >
          {/* Top Accent Band */}
          <div className="h-2.5 clinic-accent-bg w-full" />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Clinic & Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-2xl clinic-accent-bg text-white flex items-center justify-center font-alexandria font-bold text-2xl shrink-0">
                  {(doc.name_ar || 'ع').charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-xl font-alexandria font-bold text-slate-900">
                    {contact.clinic_name_ar || doc.name_ar || 'العيادة'}
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">{doc.title_ar}</p>
                  <p className="text-[11px] text-slate-500">{contact.address_ar}</p>
                  {contact.phone && (
                    <p className="text-[11px] text-slate-500" dir="ltr">
                      {contact.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:text-end space-y-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  فاتورة خدمات طبية
                </span>
                <p className="font-mono text-sm font-bold text-slate-900" dir="ltr">
                  {invoiceNumber}
                </p>
                <p className="text-[11px] text-slate-600">
                  التاريخ: <strong dir="ltr">{appointment.appointment_date}</strong>
                </p>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    paymentStatus === 'مدفوع بالكامل'
                      ? 'bg-emerald-100 text-emerald-800'
                      : paymentStatus === 'دفع جزئي'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>

            {/* Patient & Booking Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400">بيانات المريض</span>
                <p className="text-sm font-bold text-slate-900">{appointment.patient_name}</p>
                <p className="text-slate-600" dir="ltr">
                  {appointment.patient_phone}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400">تفاصيل الحجز والسداد</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الدور:</span>
                  <strong className="text-slate-900">#{appointment.queue_number || 1}</strong>
                </div>
                {appointment.booking_code && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">كود الحجز:</span>
                    <strong className="font-mono text-slate-900" dir="ltr">
                      {appointment.booking_code}
                    </strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">طريقة الدفع:</span>
                  <strong className="text-slate-900">{paymentMethod}</strong>
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-3 px-4 text-right font-bold">#</th>
                    <th className="py-3 px-4 text-right font-bold">البيان / الخدمة الطبية</th>
                    <th className="py-3 px-3 text-center font-bold w-20">العدد</th>
                    <th className="py-3 px-3 text-center font-bold w-28">السعر ({currency})</th>
                    <th className="py-3 px-4 text-left font-bold w-28">الإجمالي</th>
                    <th className="py-3 px-2 w-10 no-print" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => {
                    const lineTotal = (Number(item.qty) || 1) * (Number(item.price) || 0)
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="w-full bg-transparent font-semibold text-slate-900 outline-none border-b border-transparent focus:border-slate-300"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) || 1 })}
                            className="w-14 text-center bg-slate-50 rounded-lg py-1 font-bold text-slate-900 outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, { price: Number(e.target.value) || 0 })}
                            className="w-20 text-center bg-slate-50 rounded-lg py-1 font-bold text-slate-900 outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-left font-bold text-slate-900">
                          {lineTotal.toLocaleString('ar-EG')} {currency}
                        </td>
                        <td className="py-2.5 px-2 text-center no-print">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                            title="حذف البند"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals + QR Verification */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-5 pt-2">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <QRCodeSVG value={qrData} size={86} className="border border-slate-200 shrink-0" />
                <div className="text-[11px] text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">رمز التحقق من الفاتورة</p>
                  <p>امسح الرمز للتحقق من تفاصيل الزيارة والمبلغ الإجمالي.</p>
                  <input
                    type="text"
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    placeholder="إضافة ملاحظة تظهر على الفاتورة (اختياري)..."
                    className="no-print w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] outline-none mt-1"
                  />
                  {invoiceNotes && <p className="text-slate-800 font-semibold">{invoiceNotes}</p>}
                </div>
              </div>

              <div className="sm:w-64 rounded-2xl bg-slate-900 text-white p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>المجموع الفرعي</span>
                  <span>
                    {subtotal.toLocaleString('ar-EG')} {currency}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <span>الخصم</span>
                    <span>
                      - {discount.toLocaleString('ar-EG')} {currency}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-slate-700 pt-2 text-sm font-bold">
                  <span>الصافي المطلوب</span>
                  <span className="text-base">
                    {grandTotal.toLocaleString('ar-EG')} {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature & Footer */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs text-slate-500">
              <div className="space-y-4">
                <p className="font-bold text-slate-700">توقيع الاستقبال / المحاسب</p>
                <div className="border-b border-dashed border-slate-300 w-44" />
              </div>
              <div className="text-end space-y-4">
                <p className="font-bold text-slate-700">ختم العيادة</p>
                <div className="border-b border-dashed border-slate-300 w-44 ms-auto" />
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 pt-2">
              شكرًا لثقتكم — نتمنى لكم دوام الصحة والعافية · {contact.clinic_name_ar || doc.name_ar}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
