'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Header from '@/components/Header'
import DoctorProfile from '@/components/DoctorProfile'
import ReviewsSection from '@/components/ReviewsSection'
import BookingInfoBar from '@/components/BookingInfoBar'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import TimeSlotSelector from '@/components/TimeSlotSelector'
import PatientForm from '@/components/PatientForm'
import BookingSummary from '@/components/BookingSummary'
import WorkingHours from '@/components/WorkingHours'
import PreviousBooking from '@/components/PreviousBooking'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import { bookAppointment, getAvailableSlots, normalizePhone } from '@/lib/booking'

export default function BookingPage() {
  const [locale, setLocale] = useState('ar')
  const [currentWeek, setCurrentWeek] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    maritalStatus: '',
    age: '',
    ageUnit: 'years',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [mounted, setMounted] = useState(false)

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
    setMounted(true)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('locale')
    if (saved === 'ar' || saved === 'en') setLocale(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  useEffect(() => {
    if (selectedDate) {
      getAvailableSlots(format(selectedDate, 'yyyy-MM-dd')).then(setSlots)
      setSelectedSlot(null)
    } else {
      setSlots([])
    }
  }, [selectedDate])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) return
    setLoading(true)
    setMessage(null)

    try {
      const cleanPhone = normalizePhone(form.phone)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const result = await bookAppointment({
        name: form.name,
        phone: cleanPhone,
        date: dateStr,
        time: selectedSlot.start,
        maritalStatus: form.maritalStatus,
        age: form.age,
        ageUnit: form.ageUnit,
        visitType: selectedSlot.type,
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
        const updatedSlots = await getAvailableSlots(dateStr)
        setSlots(updatedSlots)
        setSelectedSlot(null)
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
      <div className="min-h-screen bg-[#1A050A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A050A] text-gray-200 pb-20 sm:pb-8">
      <Header locale={locale} setLocale={setLocale} />

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">
        <DoctorProfile locale={locale} />
        <ReviewsSection locale={locale} />
        <BookingInfoBar locale={locale} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-5">
            <WorkingHours locale={locale} />
            <PreviousBooking locale={locale} />
          </div>

          <div className="lg:col-span-2 space-y-4">
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
              <TimeSlotSelector
                locale={locale}
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />
            )}

            <PatientForm locale={locale} form={form} setForm={setForm} />

            <BookingSummary
              locale={locale}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              form={form}
              loading={loading}
              onSubmit={handleSubmit}
              message={message}
            />
          </div>
        </div>

        <Footer locale={locale} />
      </main>
      <BottomNav />
    </div>
  )
}