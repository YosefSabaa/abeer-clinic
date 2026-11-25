export const DEFAULT_CLINIC_SETTINGS = {
  doctor_profile: {
    name_ar: 'دكتورة عبير الدالي',
    name_en: 'Dr. Abeer El-Dali',
    badge_ar: 'استشاري',
    badge_en: 'Consultant',
    title_ar: 'استشاري و رئيس قسم نساء وتوليد MSH',
    title_en: 'Consultant & Head of OB/GYN, MSH',
    bio_ar:
      'استشاري ورئيس أقسام النساء والتوليد بمستشفى MSH المتخصصة. استشاري المناظير والحقن المجهري. حاصلة على الدبلومة الأمريكية في التجميل النسائي وجراحات التجميل.',
    bio_en:
      'Consultant & Head of OB/GYN Departments at MSH Specialized Hospital. Consultant in Laparoscopy & IVF. American Diploma in Aesthetic Gynecology.',
    image: '/doctor.jpg',
    available_for_booking: true,
  },

  clinic_contact: {
    clinic_name_ar: 'عيادة دكتورة عبير الدالي',
    clinic_name_en: 'Dr. Abeer El-Dali Clinic',
    address_ar: 'برج الفاروق 2 حي الجامعة - بجوار الراتب الشامي مقابل وكالة أبو ريا',
    address_en: 'Al-Farouk Tower 2, University District, beside Al-Rateb Al-Shami',
    phone: '+201000000000',
    whatsapp: '201000000000',
    map_url: 'https://maps.google.com',
    facebook_url: 'https://facebook.com',
    instagram_url: '',
  },

  theme_settings: {
    preset: 'burgundy',
    default_mode: 'dark',
    accent_primary: '#EC4899',
    accent_secondary: '#A855F7',
  },

  reviews: [
    {
      id: 'rev-1',
      name: 'Reham H.',
      date: 'مارس 2025',
      text: 'الدكتورة كويسة جدًا ومستمعة جيدة وبتشرح كل حاجة بهدوء.',
      rating: 5,
      visible: true,
    },
    {
      id: 'rev-2',
      name: 'ريان ز.',
      date: 'أبريل 2025',
      text: 'أسلوب علمي ومهنية عالية واهتمام كبير بالتفاصيل.',
      rating: 5,
      visible: true,
    },
    {
      id: 'rev-3',
      name: 'أحمد م.',
      date: 'مايو 2025',
      text: 'الدكتورة متمكنة جدًا ومتابعة ممتازة في كل زيارة.',
      rating: 5,
      visible: true,
    },
  ],

  working_hours: [
    { dayIndex: 6, day_ar: 'السبت', day_en: 'Saturday', start: '19:00', end: '23:00', closed: false },
    { dayIndex: 0, day_ar: 'الأحد', day_en: 'Sunday', start: '19:00', end: '23:00', closed: false },
    { dayIndex: 1, day_ar: 'الاثنين', day_en: 'Monday', start: '19:00', end: '23:00', closed: false },
    { dayIndex: 2, day_ar: 'الثلاثاء', day_en: 'Tuesday', start: '19:00', end: '23:00', closed: false },
    { dayIndex: 3, day_ar: 'الأربعاء', day_en: 'Wednesday', start: '19:00', end: '23:00', closed: false },
    { dayIndex: 4, day_ar: 'الخميس', day_en: 'Thursday', start: '19:00', end: '23:00', closed: false },
    { dayIndex: 5, day_ar: 'الجمعة', day_en: 'Friday', start: '19:00', end: '23:00', closed: true },
  ],

  holidays: [],

  booking_rules: {
    consultation_label_ar: 'كشف',
    consultation_label_en: 'Consultation',
    followup_label_ar: 'استشارة',
    followup_label_en: 'Follow-up',
    consultation_price: 360,
    followup_price: 150,
    currency_ar: 'ج.م',
    currency_en: 'EGP',
    avg_minutes_per_patient: 15,
    max_daily_bookings: 20,
    max_advance_days: 30,
    allow_same_day: true,
    booking_notice_ar: 'الحجز بأسبقية الدور — يرجى الحضور قبل الوقت التقريبي بـ 15 دقيقة.',
    booking_notice_en: 'Queue-based booking — please arrive 15 minutes before your estimated time.',
  },

  booking_questions: [
    {
      id: 'q-marital',
      field_key: 'maritalStatus',
      type: 'select',
      label_ar: 'الحالة الاجتماعية',
      label_en: 'Marital status',
      hint_ar: '',
      hint_en: '',
      required: true,
      options: [
        { id: 'opt-1', value: 'single', label_ar: 'آنسة', label_en: 'Single' },
        { id: 'opt-2', value: 'married', label_ar: 'مدام', label_en: 'Married' },
      ],
    },
    {
      id: 'q-age',
      field_key: 'age',
      type: 'number',
      label_ar: 'السن',
      label_en: 'Age',
      hint_ar: 'اكتب السن بالأرقام',
      hint_en: 'Enter age in years',
      required: false,
      options: [],
    },
  ],

  reception_staff: [
    {
      id: 'staff-1',
      name: 'الاستقبال الرئيسي',
      role: 'reception',
      phone: '',
      password: '',
      active: true,
      permissions: {
        viewToday: true,
        manageCalendar: true,
        managePatients: true,
        viewMedicalRecords: false,
        manageSettings: false,
        manageWhatsapp: true,
      },
    },
  ],

  security_settings: {
    admin_phone: '01000000000',
    admin_password: '',
    session_hours: 8,
  },

  whatsapp_settings: {
    auto_confirmation_enabled: true,
    template_name: 'appointment_confirmation_ar',
    reminder_hours_before: 24,
    clinic_signature_ar: 'د. عبير الدالي',
  },
}

export const THEME_PRESETS = [
  {
    id: 'burgundy',
    name_ar: 'عنابي ملكي (الافتراضي)',
    name_en: 'Royal Burgundy',
    dark: {
      bgMain: '#1A050A',
      bgCard: '#2A0A14',
      bgSurface: '#3A0D1A',
      bgBorder: '#5A1D2E',
    },
    light: {
      bgMain: '#FDF7F9',
      bgCard: '#FFFFFF',
      bgSurface: '#F9EAF0',
      bgBorder: '#E9C8D5',
    },
    accentPrimary: '#EC4899',
    accentSecondary: '#A855F7',
  },
  {
    id: 'emerald',
    name_ar: 'أخضر طبي هادئ',
    name_en: 'Medical Emerald',
    dark: {
      bgMain: '#061512',
      bgCard: '#0B231E',
      bgSurface: '#12332C',
      bgBorder: '#1E5247',
    },
    light: {
      bgMain: '#F4FBF8',
      bgCard: '#FFFFFF',
      bgSurface: '#E6F5EE',
      bgBorder: '#BCE0D0',
    },
    accentPrimary: '#10B981',
    accentSecondary: '#06B6D4',
  },
  {
    id: 'navy',
    name_ar: 'أزرق كحلي احترافي',
    name_en: 'Clinical Navy',
    dark: {
      bgMain: '#070E1C',
      bgCard: '#0E1A30',
      bgSurface: '#162644',
      bgBorder: '#27406E',
    },
    light: {
      bgMain: '#F5F8FD',
      bgCard: '#FFFFFF',
      bgSurface: '#E9F0FB',
      bgBorder: '#C7D8F2',
    },
    accentPrimary: '#3B82F6',
    accentSecondary: '#6366F1',
  },
  {
    id: 'plum',
    name_ar: 'بنفسجي ناعم',
    name_en: 'Soft Plum',
    dark: {
      bgMain: '#13081C',
      bgCard: '#200F2E',
      bgSurface: '#2F1742',
      bgBorder: '#4E2A6B',
    },
    light: {
      bgMain: '#FAF6FD',
      bgCard: '#FFFFFF',
      bgSurface: '#F2E8FA',
      bgBorder: '#DAC4EE',
    },
    accentPrimary: '#A855F7',
    accentSecondary: '#EC4899',
  },
]

export function mergeClinicSettings(row) {
  if (!row || typeof row !== 'object') {
    return structuredClone(DEFAULT_CLINIC_SETTINGS)
  }

  return {
    doctor_profile: {
      ...DEFAULT_CLINIC_SETTINGS.doctor_profile,
      ...(row.doctor_profile || {}),
    },
    clinic_contact: {
      ...DEFAULT_CLINIC_SETTINGS.clinic_contact,
      ...(row.clinic_contact || {}),
    },
    theme_settings: {
      ...DEFAULT_CLINIC_SETTINGS.theme_settings,
      ...(row.theme_settings || {}),
    },
    reviews:
      Array.isArray(row.reviews) && row.reviews.length > 0
        ? row.reviews
        : DEFAULT_CLINIC_SETTINGS.reviews,
    working_hours:
      Array.isArray(row.working_hours) && row.working_hours.length === 7
        ? row.working_hours
        : DEFAULT_CLINIC_SETTINGS.working_hours,
    holidays: Array.isArray(row.holidays) ? row.holidays : [],
    booking_rules: {
      ...DEFAULT_CLINIC_SETTINGS.booking_rules,
      ...(row.booking_rules || {}),
    },
    booking_questions:
      Array.isArray(row.booking_questions) && row.booking_questions.length > 0
        ? row.booking_questions
        : DEFAULT_CLINIC_SETTINGS.booking_questions,
    reception_staff:
      Array.isArray(row.reception_staff) && row.reception_staff.length > 0
        ? row.reception_staff
        : DEFAULT_CLINIC_SETTINGS.reception_staff,
    security_settings: {
      ...DEFAULT_CLINIC_SETTINGS.security_settings,
      ...(row.security_settings || {}),
    },
    whatsapp_settings: {
      ...DEFAULT_CLINIC_SETTINGS.whatsapp_settings,
      ...(row.whatsapp_settings || {}),
    },
  }
}

export function stripPrivateSettings(settings) {
  return {
    doctor_profile: settings.doctor_profile,
    clinic_contact: settings.clinic_contact,
    theme_settings: settings.theme_settings,
    reviews: settings.reviews,
    working_hours: settings.working_hours,
    holidays: settings.holidays,
    booking_rules: settings.booking_rules,
    booking_questions: settings.booking_questions,
  }
}
