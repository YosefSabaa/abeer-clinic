'use client'

import { motion } from 'framer-motion'
import { useClinic } from '@/lib/clinic-context'

export default function SplashScreen({ onFinish }) {
 const { settings, locale } = useClinic()
 const doctorName =
 locale === 'ar'
 ? settings?.doctor_profile?.name_ar || 'دكتورة عبير الدالي'
 : settings?.doctor_profile?.name_en || 'Dr. Abeer El-Dali'

 return (
 <motion.div
 className="fixed inset-0 z-[200] flex flex-col items-center justify-center clinic-main"
 initial={{ opacity: 1 }}
 animate={{ opacity: 0 }}
 transition={{ delay: 2.2, duration: 0.6 }}
 onAnimationComplete={onFinish}
 >
 <motion.div
 initial={{ scale: 0, rotate: -180 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
 className="w-24 h-24 rounded-3xl clinic-accent-bg flex items-center justify-center mb-6 shadow-glow"
 >
 <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </motion.div>

 <motion.h1
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.8, duration: 0.6 }}
 className="text-2xl font-alexandria font-bold clinic-text"
 >
 {doctorName}
 </motion.h1>

 <motion.p
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 1.1, duration: 0.6 }}
 className="text-sm clinic-text-muted mt-2"
 >
 {locale === 'ar' ? 'احجز موعدك في ثوانٍ' : 'Book your appointment in seconds'}
 </motion.p>

 <motion.div
 initial={{ width: 0 }}
 animate={{ width: 120 }}
 transition={{ delay: 1.4, duration: 0.8 }}
 className="h-1 clinic-accent-bg rounded-full mt-6"
 />
 </motion.div>
 )
}
