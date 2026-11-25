'use client'

import Link from 'next/link'
import { useClinic } from '@/lib/clinic-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const sections = [
 {
 title: '1. المعلومات التي نجمعها',
 content: (
 <>
 <p>قد نجمع المعلومات التالية عند استخدام خدمات الموقع:</p>
 <ul>
 <li>الاسم ورقم الهاتف.</li>
 <li>العمر والحالة الاجتماعية وإجابات أسئلة الحجز عند تقديمها.</li>
 <li>تاريخ ووقت الموعد ونوع الزيارة.</li>
 <li>المعلومات الطبية التي يتم تسجيلها أثناء تقديم الخدمة، مثل الأعراض والتشخيص والعلاج والملاحظات الطبية.</li>
 <li>الرسائل المتبادلة مع العيادة عبر WhatsApp، ومعلومات حالة إرسال الرسائل.</li>
 <li>المعلومات التقنية اللازمة لتشغيل الموقع وحمايته.</li>
 </ul>
 </>
 ),
 },
 {
 title: '2. كيف نستخدم المعلومات؟',
 content: (
 <>
 <p>نستخدم المعلومات للأغراض التالية:</p>
 <ul>
 <li>إنشاء طلبات حجز المواعيد وإدارتها.</li>
 <li>التواصل مع المرضى بشأن المواعيد وتأكيد الحجوزات.</li>
 <li>إرسال واستقبال الرسائل المتعلقة بالخدمة عبر WhatsApp.</li>
 <li>إدارة سجلات المرضى والزيارات الطبية عند الحاجة لتقديم الرعاية.</li>
 <li>تحسين أداء الموقع وحماية الحسابات والأنظمة من الاستخدام غير المصرح به.</li>
 </ul>
 </>
 ),
 },
 {
 title: '3. مشاركة المعلومات مع جهات أخرى',
 content: (
 <>
 <p>لا نقوم ببيع البيانات الشخصية للمستخدمين.</p>
 <p>قد تتم معالجة بعض المعلومات من خلال مزودي الخدمات الضروريين لتشغيل الموقع، ومنهم:</p>
 <ul>
 <li><strong>Supabase:</strong> لتخزين وإدارة بيانات الحجوزات والمرضى وإعدادات العيادة.</li>
 <li><strong>Vercel:</strong> لاستضافة الموقع وتشغيل خدماته.</li>
 <li><strong>Meta / WhatsApp:</strong> لإرسال واستقبال رسائل WhatsApp المتعلقة بالحجوزات والتواصل مع المرضى.</li>
 </ul>
 </>
 ),
 },
 {
 title: '4. حماية المعلومات والاحتفاظ بها',
 content: (
 <p>
 نتخذ إجراءات تقنية وتنظيمية مناسبة لحماية المعلومات من الوصول أو الاستخدام أو التعديل أو الإفصاح غير المصرح به،
 ونحتفظ بها فقط للمدة اللازمة لتقديم الرعاية الطبية والوفاء بالالتزامات النظامية.
 </p>
 ),
 },
 {
 title: '5. حقوق المستخدم والتواصل',
 content: (
 <p>
 يمكن للمريض الاستفسار عن بياناته أو طلب تصحيحها أو حذفها عند عدم وجود سبب طبي أو قانوني للاحتفاظ بها،
 وذلك بالتواصل المباشر مع إدارة العيادة عبر وسائل الاتصال المنشورة في صفحة الحجز.
 </p>
 ),
 },
]

export default function PrivacyPolicyPage() {
 const { locale } = useClinic()

 return (
 <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen clinic-main">
 <Header />

 <section className="max-w-4xl mx-auto px-5 py-10">
 <div className="text-center mb-10">
 <div className="w-16 h-16 mx-auto mb-5 rounded-2xl clinic-accent-soft border flex items-center justify-center text-3xl">
 🔒
 </div>
 <h1 className="text-3xl md:text-4xl font-alexandria font-bold clinic-accent-text mb-3">
 سياسة الخصوصية
 </h1>
 <p className="clinic-text-muted leading-8 max-w-2xl mx-auto text-sm">
 نحن نحترم خصوصيتك ونعمل على حماية بياناتك الشخصية والطبية. توضح هذه السياسة كيفية جمع
 المعلومات واستخدامها وحمايتها عند استخدام الموقع وخدماته.
 </p>
 </div>

 <div className="space-y-5">
 {sections.map((section, index) => (
 <section
 key={index}
 className="rounded-2xl border clinic-border clinic-card p-5 md:p-7"
 >
 <h2 className="text-lg font-bold clinic-accent-text mb-3">{section.title}</h2>
 <div className="text-sm clinic-text-secondary leading-8 space-y-3 [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:space-y-2 [&_strong]:clinic-text">
 {section.content}
 </div>
 </section>
 ))}
 </div>

 <div className="text-center mt-10">
 <Link
 href="/booking"
 className="inline-flex items-center justify-center rounded-xl clinic-accent-bg text-white px-7 py-3 font-bold text-sm hover:opacity-90 transition shadow-glow"
 >
 العودة إلى صفحة الحجز
 </Link>
 </div>

 <Footer />
 </section>
 </div>
 )
}
