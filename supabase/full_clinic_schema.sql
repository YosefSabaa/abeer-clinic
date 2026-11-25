-- ============================================================================
-- السكربت الكامل لقاعدة بيانات مشروع العيادة (آمن 100% لإعادة التشغيل)
-- يشمل: نظام الحجز بالترتيب (queue_number + booking_code)، الإعدادات الموحدة،
--       صلاحيات الجداول (GRANT + RLS) لمنع خطأ permission denied.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) جدول المرضى
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  name text NOT NULL,
  age integer,
  age_unit text DEFAULT 'years',
  marital_status text,
  chronic_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS age_unit text DEFAULT 'years';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS marital_status text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS chronic_notes text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients (phone);

-- 2) جدول الحجوزات (مع رقم الدور queue_number ورقم الحجز booking_code)
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  slot_type text DEFAULT 'كشف',
  queue_number integer,
  booking_code text,
  custom_answers jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS slot_type text DEFAULT 'كشف';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS queue_number integer;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS booking_code text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS custom_answers jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'confirmed';
CREATE INDEX IF NOT EXISTS idx_appointments_date_queue ON public.appointments (appointment_date, queue_number);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments (patient_phone);

-- 3) جدول السجل المرضي والروشتات
CREATE TABLE IF NOT EXISTS public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_phone text NOT NULL,
  patient_name text,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  symptoms text,
  diagnosis text NOT NULL,
  prescription text,
  notes text,
  next_visit date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS symptoms text;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS prescription text;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS next_visit date;
CREATE INDEX IF NOT EXISTS idx_medical_records_phone ON public.medical_records (patient_phone);

-- 4) جدول إعدادات العيادة الموحد
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
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.clinic_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 5) جدول محادثات واتساب
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  patient_name text,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  last_inbound_at timestamptz,
  unread_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_conversations_last_msg ON public.whatsapp_conversations (last_message_at DESC);

-- 6) جدول رسائل واتساب
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  wa_message_id text UNIQUE,
  direction text NOT NULL,
  message_type text DEFAULT 'text',
  content text,
  status text DEFAULT 'pending',
  status_at timestamptz DEFAULT now(),
  error_code text,
  error_title text,
  error_message text,
  error_details text,
  raw_status jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_messages_conv ON public.whatsapp_messages (conversation_id, created_at ASC);

-- 7) دالة زيادة غير المقروء في واتساب
CREATE OR REPLACE FUNCTION public.increment_whatsapp_unread(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.whatsapp_conversations
  SET unread_count = COALESCE(unread_count, 0) + 1, updated_at = now()
  WHERE id = p_conversation_id;
END;
$$;

-- 8) منح الصلاحيات الكاملة لمنع أي خطأ permission denied
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON TABLE
  public.patients,
  public.appointments,
  public.medical_records,
  public.clinic_settings,
  public.whatsapp_conversations,
  public.whatsapp_messages
TO service_role;

GRANT SELECT, INSERT, UPDATE ON TABLE public.patients TO anon, authenticated;
GRANT SELECT ON TABLE public.appointments TO anon, authenticated;
GRANT SELECT ON TABLE public.medical_records TO anon, authenticated;
GRANT SELECT ON TABLE public.clinic_settings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_whatsapp_unread(uuid) TO service_role;

-- سياسات RLS آمنة
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'patients', 'appointments', 'medical_records', 'clinic_settings',
    'whatsapp_conversations', 'whatsapp_messages'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl AND policyname = 'service_role_all_' || tbl
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        'service_role_all_' || tbl, tbl
      );
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='public_patients_access') THEN
    CREATE POLICY public_patients_access ON public.patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='public_appointments_read') THEN
    CREATE POLICY public_appointments_read ON public.appointments FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='medical_records' AND policyname='public_records_read') THEN
    CREATE POLICY public_records_read ON public.medical_records FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';


-- جدول طلبات الاستشارات والرد عليها
CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_phone text NOT NULL,
  age integer,
  subject text DEFAULT 'استشارة طبية',
  question text NOT NULL,
  doctor_reply text,
  status text NOT NULL DEFAULT 'pending',
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_consultations_phone ON public.consultations (patient_phone);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations (status, created_at DESC);

GRANT ALL ON TABLE public.consultations TO service_role;
GRANT SELECT, INSERT ON TABLE public.consultations TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consultations' AND policyname='service_role_all_consultations') THEN
    CREATE POLICY service_role_all_consultations ON public.consultations FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
