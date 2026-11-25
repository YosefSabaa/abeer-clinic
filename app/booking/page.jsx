'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useClinic } from '@/lib/clinic-context'
import Header from '@/components/Header'
import DoctorProfile from '@/components/DoctorProfile'
import ReviewsSection from '@/components/ReviewsSection'
import BookingInfoBar from '@/components/BookingInfoBar'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import QueueStatusCard from '@/components/QueueStatusCard'
import PatientForm from '@/components/PatientForm'
import BookingSummary from '@/components/BookingSummary'
import BookingTicketModal from '@/components/BookingTicketModal'
import ConsultationWidget from '@/components/ConsultationWidget'
import WorkingHours from '@/components/WorkingHours'
import PreviousBooking from '@/components/PreviousBooking'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import { bookAppointment, normalizePhone } from '@/lib/booking'

export default function BookingPage() {
  const { settings, locale, setLocale, mounted } = useClinic()

  const [currentWeek, setCurrentWeek] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [queueInfo, setQueueInfo] = useState(null)
  const [loadingQueue, setLoadingQueue] = useState(false)
  const [visitType, setVisitType] = useState('كشف')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    maritalStatus: '',
    age: '',
    ageUnit: 'years',
    customAnswers: {},
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [confirmedTicket, setConfirmedTicket] = useState(null)

  useEffect(() => {
    setCurrentWeek(new Date())
    const savedPhone = localStorage.getItem('patient_phone')
    const savedName = localStorage.getItem('patient_name')
    if (savedPhone || savedName) {
      setForm((prev) => ({
        ...prev,
        phone: savedPhone || '',
        name: savedName || '',
      }))
    }
  }, [])

  useEffect(() => {
    if (settings?.booking_rules?.consultation_label_ar) {
      setVisitType(settings.booking_rules.consultation_label_ar)
    }
  }, [settings?.booking_rules?.consultation_label_ar])

  const fetchQueueStatus = useCallback(async (dateObj) => {
    if (!dateObj) {
      setQueueInfo(null)
      return
    }
    setLoadingQueue(true)
    try {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const res = await fetch(`/api/appointments/queue?date=${dateStr}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setQueueInfo(data)
      }
    } catch {
      setQueueInfo(null)
    } finally {
      setLoadingQueue(false)
    }
  }, [])

  useEffect(() => {
    fetchQueueStatus(selectedDate)
  }, [selectedDate, fetchQueueStatus])

  const handleSubmit = async () => {
    if (!selectedDate || !queueInfo?.isOpen || queueInfo?.isFull) return
    setLoading(true)
    setMessage(null)

    try {
      const cleanPhone = normalizePhone(form.phone)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const result = await bookAppointment({
        name: form.name,
        phone: cleanPhone,
        date: dateStr,
        maritalStatus: form.maritalStatus,
        age: form.age,
        ageUnit: form.ageUnit,
        visitType,
        customAnswers: form.customAnswers,
      })

      if (result.success) {
        localStorage.setItem('patient_phone', cleanPhone)
        localStorage.setItem('patient_name', form.name.trim())

        const whatsappNote =
          result.whatsappNotification === 'sent'
            ? ' وتم إرسال تفاصيل الموعد عبر واتساب.'
            : ''

        setMessage({
          type: 'success',
          text: `${result.message}${whatsappNote}`,
        })

        if (result.ticket) {
          setConfirmedTicket(result.ticket)
        }
        await fetchQueueStatus(selectedDate)
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
    setLoading(false)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen clinic-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 clinic-spinner rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen clinic-main pb-24 sm:pb-8 overflow-x-hidden">
      <Header locale={locale} setLocale={setLocale} />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-5 space-y-5 overflow-x-hidden">
        <DoctorProfile locale={locale} />
        <ReviewsSection locale={locale} />
        <BookingInfoBar locale={locale} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="space-y-5 min-w-0 order-2 lg:order-1">
            <WorkingHours locale={locale} />
            <PreviousBooking locale={locale} />
          </div>

          <div className="lg:col-span-2 space-y-4 min-w-0 order-1 lg:order-2">
            {currentWeek && (
              <WeeklyCalendar
                locale={locale}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                currentWeek={currentWeek}
                onChangeWeek={setCurrentWeek}
              />
            )}

            {selectedDate && (
              <QueueStatusCard
                locale={locale}
                queueInfo={queueInfo}
                loadingQueue={loadingQueue}
                visitType={visitType}
                setVisitType={setVisitType}
              />
            )}

            <PatientForm locale={locale} form={form} setForm={setForm} />

            <BookingSummary
              locale={locale}
              selectedDate={selectedDate}
              queueInfo={queueInfo}
              visitType={visitType}
              form={form}
              loading={loading}
              onSubmit={handleSubmit}
              message={message}
              lastTicket={confirmedTicket}
              onOpenTicket={() => setConfirmedTicket((prev) => prev)}
            />
          </div>
        </div>

        <Footer locale={locale} />
      </main>

      <BookingTicketModal ticket={confirmedTicket} onClose={() => setConfirmedTicket(null)} />
      <ConsultationWidget />
      <BottomNav />
    </div>
  )
}
