import { cookies } from 'next/headers'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { loadClinicSettingsFromDB } from '@/lib/clinic-settings-server'

const COOKIE_NAME = 'clinic_admin_session'
const DEFAULT_SESSION_HOURS = 8

const FULL_PERMISSIONS = {
  viewToday: true,
  manageCalendar: true,
  managePatients: true,
  viewMedicalRecords: true,
  manageSettings: true,
  manageWhatsapp: true,
}

function normalizePhone(raw) {
  let cleaned = String(raw || '').replace(/[\s\-()+]/g, '').trim()
  if (cleaned.startsWith('0020')) cleaned = '0' + cleaned.slice(4)
  else if (cleaned.startsWith('20') && cleaned.length === 12) cleaned = '0' + cleaned.slice(2)
  else if (/^1\d{9}$/.test(cleaned)) cleaned = '0' + cleaned
  return cleaned
}

function getSecret() {
  const secret = process.env.WHATSAPP_ADMIN_SESSION_SECRET || 'clinic-local-fallback-secret-change-me'
  return secret
}

function sign(value) {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

function safeEqual(a, b) {
  const first = Buffer.from(String(a || ''))
  const second = Buffer.from(String(b || ''))
  if (first.length !== second.length) return false
  return timingSafeEqual(first, second)
}

export async function authenticateCredentials(rawPhone, rawPassword) {
  const phone = normalizePhone(rawPhone)
  const password = String(rawPassword || '').trim()
  if (!phone || !password) return null

  const { settings } = await loadClinicSettingsFromDB()

  // Doctor credentials (from DB security_settings, with safe env/default fallbacks)
  const configuredPhone = normalizePhone(
    settings?.security_settings?.admin_phone || process.env.ADMIN_PHONE || '01000000000'
  )
  const configuredPassword = String(
    settings?.security_settings?.admin_password ||
      process.env.ADMIN_PASSWORD ||
      process.env.ADMIN_PIN ||
      '1234'
  ).trim()

  if (safeEqual(phone, configuredPhone) && safeEqual(password, configuredPassword)) {
    return {
      role: 'doctor',
      userName: settings?.doctor_profile?.name_ar || 'دكتورة عبير الدالي',
      phone: configuredPhone,
      permissions: FULL_PERMISSIONS,
      sessionHours: Number(settings?.security_settings?.session_hours) || DEFAULT_SESSION_HOURS,
    }
  }

  // Active reception staff credentials (phone + password)
  const staffList = Array.isArray(settings?.reception_staff) ? settings.reception_staff : []
  for (const member of staffList) {
    if (!member?.active) continue
    const staffPhone = normalizePhone(member.phone)
    const staffPass = String(member.password || member.pin || '').trim()
    if (staffPhone && staffPass && safeEqual(phone, staffPhone) && safeEqual(password, staffPass)) {
      return {
        role: 'reception',
        userName: member.name || 'الاستقبال',
        phone: staffPhone,
        permissions: {
          viewToday: Boolean(member.permissions?.viewToday),
          manageCalendar: Boolean(member.permissions?.manageCalendar),
          managePatients: Boolean(member.permissions?.managePatients),
          viewMedicalRecords: Boolean(member.permissions?.viewMedicalRecords),
          manageSettings: Boolean(member.permissions?.manageSettings),
          manageWhatsapp: Boolean(member.permissions?.manageWhatsapp),
        },
        sessionHours: Number(settings?.security_settings?.session_hours) || DEFAULT_SESSION_HOURS,
      }
    }
  }

  return null
}

export async function createAdminSession(sessionMeta = null) {
  const meta = sessionMeta || {
    role: 'doctor',
    userName: 'دكتورة عبير الدالي',
    permissions: FULL_PERMISSIONS,
    sessionHours: DEFAULT_SESSION_HOURS,
  }

  const sessionSeconds = Math.max(1, Number(meta.sessionHours) || DEFAULT_SESSION_HOURS) * 3600
  const expiresAt = Date.now() + sessionSeconds * 1000
  const nonce = randomBytes(16).toString('hex')

  const dataB64 = Buffer.from(
    JSON.stringify({
      role: meta.role || 'doctor',
      userName: meta.userName || 'دكتورة عبير الدالي',
      phone: meta.phone || '',
      permissions: meta.permissions || FULL_PERMISSIONS,
    })
  ).toString('base64url')

  const payload = `${expiresAt}.${nonce}.${dataB64}`
  const signature = sign(payload)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: sessionSeconds,
  })
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE_NAME)?.value
  if (!value) return null

  const parts = value.split('.')
  if (parts.length === 4) {
    const [expiresAt, nonce, dataB64, signature] = parts
    const payload = `${expiresAt}.${nonce}.${dataB64}`
    if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return null
    if (!safeEqual(signature, sign(payload))) return null
    try {
      const parsed = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8'))
      return {
        authenticated: true,
        role: parsed.role || 'doctor',
        userName: parsed.userName || 'دكتورة عبير الدالي',
        phone: parsed.phone || '',
        permissions: parsed.permissions || FULL_PERMISSIONS,
      }
    } catch {
      return null
    }
  }

  return null
}

export async function isAdminAuthenticated() {
  const session = await getAdminSession()
  return Boolean(session?.authenticated)
}

export async function destroyAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
}

export async function requireAdmin(requiredPermission = null) {
  const session = await getAdminSession()
  if (!session?.authenticated) return false
  if (!requiredPermission) return true
  if (session.role === 'doctor') return true
  return Boolean(session.permissions?.[requiredPermission])
}
