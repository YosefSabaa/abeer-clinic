
import { cookies } from 'next/headers'
import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'

const COOKIE_NAME = 'clinic_admin_session'
const SESSION_SECONDS = 60 * 60 * 8

function getSecret() {
  const secret = process.env.WHATSAPP_ADMIN_SESSION_SECRET

  if (!secret) {
    throw new Error('Missing WHATSAPP_ADMIN_SESSION_SECRET')
  }

  return secret
}

function sign(value) {
  return createHmac('sha256', getSecret())
    .update(value)
    .digest('hex')
}

function safeEqual(a, b) {
  const first = Buffer.from(String(a))
  const second = Buffer.from(String(b))

  if (first.length !== second.length) return false

  return timingSafeEqual(first, second)
}

export function verifyAdminPin(pin) {
  const configuredPin = process.env.ADMIN_PIN

  if (!configuredPin || !pin) return false

  return safeEqual(pin, configuredPin)
}

export async function createAdminSession() {
  const expiresAt = Date.now() + SESSION_SECONDS * 1000
  const nonce = randomBytes(24).toString('hex')

  const payload = `${expiresAt}.${nonce}`
  const signature = sign(payload)

  const cookieStore = await cookies()

  cookieStore.set(
    COOKIE_NAME,
    `${payload}.${signature}`,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_SECONDS,
    }
  )
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE_NAME)?.value

  if (!value) return false

  const parts = value.split('.')

  if (parts.length !== 3) return false

  const [expiresAt, nonce, signature] = parts
  const payload = `${expiresAt}.${nonce}`

  if (!/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) < Date.now()) return false

  return safeEqual(signature, sign(payload))
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

export async function requireAdmin() {
  return await isAdminAuthenticated()
}
