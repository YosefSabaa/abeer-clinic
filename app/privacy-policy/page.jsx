
import Link from 'next/link'

export const metadata = {
  title: 'سياسة الخصوصية | طبيبي',
  description:
    'سياسة الخصوصية وحماية بيانات المستخدمين في موقع طبيبي لحجز المواعيد الطبية.',
  robots: {
    index: true,
    follow: true,
  },
}

const sections = [
  {
    title: '1. المعلومات التي نجمعها',
    content: (
      <>
        <p>قد نجمع المعلومات التالية عند استخدام خدمات الموقع:</p>
        <ul>
          <li>الاسم ورقم الهاتف.</li>
          <li>العمر والحالة الاجتماعية عند تقديمهما.</li>
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
        <p>
          قد تتم معالجة بعض المعلومات من خلال مزودي الخدمات الضروريين لتشغيل
          الموقع، ومنهم:
        </p>
        <ul>
          <li>
            <strong>Supabase:</strong> لتخزين وإدارة بيانات الحجوزات والمرضى.
          </li>
          <li>
            <strong>Vercel:</strong> لاستضافة الموقع وتشغيل خدماته.
          </li>
          <li>
            <strong>Meta / WhatsApp:</strong> لإرسال واستقبال رسائل WhatsApp
            المتعلقة بالحجوزات والتواصل مع المرضى.
          </li>
        </ul>
        <p>
          تخضع معالجة البيانات لدى هذه الخدمات لسياسات الخصوصية والشروط الخاصة
          بكل مزود.
        </p>
      </>
    ),
  },
  {
    title: '4. حماية المعلومات',
    content: (
      <p>
        نتخذ إجراءات تقنية وتنظيمية مناسبة لحماية المعلومات من الوصول أو
        الاستخدام أو التعديل أو الإفصاح غير المصرح به. ومع ذلك، لا يمكن ضمان
        أمان نقل المعلومات أو تخزينها عبر الإنترنت بصورة مطلقة.
      </p>
    ),
  },
  {
    title: '5. الاحتفاظ بالبيانات',
    content: (
      <p>
        نحتفظ بالمعلومات للمدة اللازمة لتقديم الخدمات وإدارة المواعيد والسجلات
        الطبية، والوفاء بالالتزامات القانونية والتنظيمية عند انطباقها. وقد
        نحتفظ ببعض البيانات لمدة أطول إذا كان ذلك مطلوبًا بموجب القانون أو
        لحماية الحقوق.
      </p>
    ),
  },
  {
    title: '6. ملفات تعريف الارتباط والتخزين المحلي',
    content: (
      <p>
        قد يستخدم الموقع تقنيات التخزين المحلي في المتصفح لتسهيل الوصول إلى
        بعض الخدمات، مثل تذكر رقم الهاتف المستخدم للوصول إلى ملف المريض.
        كما قد يستخدم ملفات تعريف الارتباط اللازمة لتأمين جلسات الإدارة.
        يمكنك التحكم في بيانات المتصفح من إعداداته، وقد يؤثر حذفها على بعض
        وظائف الموقع.
      </p>
    ),
  },
  {
    title: '7. حقوق المستخدم',
    content: (
      <>
        <p>يمكن للمستخدم طلب ما يلي، وفقًا للقوانين المعمول بها:</p>
        <ul>
          <li>معرفة البيانات الشخصية التي نحتفظ بها عنه.</li>
          <li>طلب تصحيح البيانات غير الدقيقة.</li>
          <li>طلب حذف البيانات عندما لا يوجد سبب قانوني أو طبي للاحتفاظ بها.</li>
          <li>الاستفسار عن كيفية استخدام بياناته أو مشاركتها.</li>
        </ul>
      </>
    ),
  },
  {
    title: '8. خصوصية الأطفال',
    content: (
      <p>
        إذا كانت الخدمة تُستخدم لحجز موعد لشخص قاصر، فينبغي أن يتم تقديم
        البيانات والتعامل معها بواسطة ولي الأمر أو الشخص المخول قانونًا،
        مع مراعاة القوانين المعمول بها.
      </p>
    ),
  },
  {
    title: '9. الروابط والخدمات الخارجية',
    content: (
      <p>
        قد يحتوي الموقع على روابط لخدمات خارجية مثل WhatsApp أو خرائط Google.
        عند الانتقال إلى هذه الخدمات، تصبح سياسات الخصوصية الخاصة بها هي
        المنظمة لاستخدامك لها.
      </p>
    ),
  },
  {
    title: '10. التعديلات على سياسة الخصوصية',
    content: (
      <p>
        قد نقوم بتحديث هذه السياسة عند الحاجة. سيتم نشر النسخة المحدثة في
        هذه الصفحة مع تعديل تاريخ آخر تحديث.
      </p>
    ),
  },
  {
    title: '11. التواصل والاستفسارات',
    content: (
      <p>
        للاستفسار عن سياسة الخصوصية أو طلب تعديل بياناتك أو حذفها، يرجى
        التواصل مع إدارة العيادة من خلال وسائل الاتصال الرسمية المنشورة
        على الموقع.
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#1A050A] text-white"
    >
      <header className="border-b border-[#5A1D2E] bg-[#1A050A]/95">
        <div className="max-w-4xl mx-auto px-5 py-5 flex items-center justify-between">
          <Link
            href="/booking"
            className="flex items-center gap-2 text-pink-300 font-bold"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white">
              ط
            </span>
            طبيبي
          </Link>

          <Link
            href="/booking"
            className="text-sm text-gray-300 hover:text-pink-300 transition"
          >
            العودة للموقع
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-3xl">
            🔒
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-pink-300 mb-4">
            سياسة الخصوصية
          </h1>

          <p className="text-gray-400 leading-8 max-w-2xl mx-auto">
            نحن نحترم خصوصيتك ونعمل على حماية بياناتك الشخصية والطبية.
            توضح هذه السياسة كيفية جمع المعلومات واستخدامها وحمايتها
            عند استخدام موقع طبيبي وخدماته.
          </p>

          <p className="text-xs text-gray-500 mt-5">
            آخر تحديث: 24 نوفمبر 2026
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section, index) => (
            <section
              key={index}
              className="rounded-2xl border border-[#5A1D2E] bg-[#260B15] p-5 md:p-7"
            >
              <h2 className="text-lg font-bold text-pink-300 mb-4">
                {section.title}
              </h2>

              <div className="text-sm md:text-base text-gray-300 leading-8 space-y-3 [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:space-y-2 [&_strong]:text-white">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-7 py-3 font-bold hover:opacity-90 transition"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#5A1D2E] py-6 text-center text-xs text-gray-500">
        © 2026 طبيبي — جميع الحقوق محفوظة
      </footer>
    </main>
  )
}
