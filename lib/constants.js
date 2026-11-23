export const DOCTOR = {
  name: 'دكتورة عبير الدالي',
  title: 'استشاري و رئيس قسم نساء وتوليد MSH',
  bio: 'استشاري ورئيس أقسام النساء والتوليد بمستشفى MSH المتخصصة. استشاري المناظير والحقن المجهري. حاصلة على الدبلومة الأمريكية في التحليل النسائي وجراحات التجميل.',
  address: 'برج الفاروق 2 حي الجامعه - بجوار الراتب الشامي مقابل وكالة ابوريا',
  phone: '+201000000000',
  whatsapp: '201000000000',
  rating: 5.0,
  reviewCount: 16,
  image: '/doctor.jpg', // ضع صورة الطبيبة في public/doctor.jpg
  facebook: 'https://facebook.com',
  map: 'https://maps.google.com',
}

export const WORKING_HOURS = [
  { day: 'السبت', dayIndex: 6, start: '19:00', end: '23:00', closed: false },
  { day: 'الأحد', dayIndex: 0, start: '19:00', end: '23:00', closed: false },
  { day: 'الاثنين', dayIndex: 1, start: '19:00', end: '23:00', closed: false },
  { day: 'الثلاثاء', dayIndex: 2, start: '19:00', end: '23:00', closed: false },
  { day: 'الأربعاء', dayIndex: 3, start: '19:00', end: '23:00', closed: false },
  { day: 'الخميس', dayIndex: 4, start: '19:00', end: '23:00', closed: false },
  { day: 'الجمعة', dayIndex: 5, start: null, end: null, closed: true },
]

export const REVIEWS = [
  { id: 1, name: 'Reham H.', initial: 'R', date: 'مارس 2025', text: 'الدكتورة كويسة جدا ومسمعة جهدها', rating: 5 },
  { id: 2, name: 'ريان ز.', initial: 'ر', date: 'أبريل 2025', text: 'أسلوب علمي ومهنية عالية', rating: 5 },
  { id: 3, name: 'أحمد م.', initial: 'أ', date: 'مايو 2025', text: 'الدكتورة متمكنة جدا ومتابعة ممتازة', rating: 5 },
]

export const BOOKING_INFO = [
  { icon: 'user', label: 'كشف', value: '20 دقيقة' },
  { icon: 'money', label: 'سعر الكشف', value: '360 ج.م' },
  { icon: 'check', label: 'حجز بدون حساب', value: '' },
]