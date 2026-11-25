-- ============================================================================
-- ترقية قاعدة بيانات عيادة طبيبي (Supabase SQL Migration)
-- آمن لإعادة التشغيل (Idempotent) — لا يحذف أي بيانات حالية
-- ============================================================================

-- 1) جدول إعدادات العيادة الموحد (صف واحد id = 'default')
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id text PRIMARY KEY DEFAULT 'default',
  doctor_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  clinic_contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviews jsonb NOT NULL DEFAULT '[]'::jsonb,
  working_hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  holidays jsonb NOT NULL DEFAULT '[]'::jsonb,
  booking_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  booking_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  reception_staff jsonb NOT NULL DEFAULT '[]'::jsonb,
  security_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  whatsapp_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  subscription_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  support_access jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) إضافة عمود إجابات أسئلة الحجز المخصصة لجدول الحجوزات (إن لم يكن موجودًا)
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS custom_answers jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS slot_type text DEFAULT 'كشف';

-- 3) إدراج الصف الافتراضي لعيادة دكتورة عبير الدالي إن لم يكن موجودًا
INSERT INTO public.clinic_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- 4) صلاحيات القراءة العامة عبر API الخادم (يفضل قصر الكتابة على service_role)
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'clinic_settings'
      AND policyname = 'Allow service role full access on clinic_settings'
  ) THEN
    CREATE POLICY "Allow service role full access on clinic_settings"
      ON public.clinic_settings
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
