'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { DEFAULT_CLINIC_SETTINGS, THEME_PRESETS } from '@/lib/default-settings'

const ClinicContext = createContext(null)

export function applyThemeToDocument(themeMode, themeSettings) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const preset =
    THEME_PRESETS.find((p) => p.id === themeSettings?.preset) || THEME_PRESETS[0]
  const palette = themeMode === 'light' ? preset.light : preset.dark

  root.dataset.theme = themeMode
  root.style.setProperty('--bg-main', palette.bgMain)
  root.style.setProperty('--bg-card', palette.bgCard)
  root.style.setProperty('--bg-surface', palette.bgSurface)
  root.style.setProperty('--bg-border', palette.bgBorder)
  root.style.setProperty(
    '--accent-primary',
    themeSettings?.accent_primary || preset.accentPrimary
  )
  root.style.setProperty(
    '--accent-secondary',
    themeSettings?.accent_secondary || preset.accentSecondary
  )

  if (themeMode === 'light') {
    root.style.setProperty('--text-primary', '#1F0C14')
    root.style.setProperty('--text-secondary', '#5B3C49')
    root.style.setProperty('--text-muted', '#846270')
  } else {
    root.style.setProperty('--text-primary', '#F9FAFB')
    root.style.setProperty('--text-secondary', '#D1D5DB')
    root.style.setProperty('--text-muted', '#9CA3AF')
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', palette.bgMain)
  }
}

export function ClinicSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_CLINIC_SETTINGS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [locale, setLocaleState] = useState('ar')
  const [theme, setThemeState] = useState('dark')
  const [mounted, setMounted] = useState(false)

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data?.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }))

          // Apply DB default_mode if visitor has not manually chosen a mode
          const savedTheme = localStorage.getItem('clinic_theme')
          const dbDefaultMode = data.settings?.theme_settings?.default_mode
          if (!savedTheme && (dbDefaultMode === 'light' || dbDefaultMode === 'dark')) {
            setThemeState(dbDefaultMode)
          }
        }
      }
    } catch {
      // Fallback to defaults gracefully
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale === 'ar' || savedLocale === 'en') {
      setLocaleState(savedLocale)
    }

    const savedTheme = localStorage.getItem('clinic_theme')
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme)
    }

    refreshSettings()
    setMounted(true)
  }, [refreshSettings])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale, mounted])

  useEffect(() => {
    if (!mounted) return
    applyThemeToDocument(theme, settings.theme_settings)
  }, [theme, settings.theme_settings, mounted])

  const setLocale = useCallback((next) => {
    setLocaleState(next === 'en' ? 'en' : 'ar')
  }, [])

  const setTheme = useCallback((next) => {
    const resolved = next === 'light' ? 'light' : 'dark'
    localStorage.setItem('clinic_theme', resolved)
    setThemeState(resolved)
  }, [])

  const previewThemeSettings = useCallback(
    (nextThemeSettings) => {
      applyThemeToDocument(nextThemeSettings?.default_mode || theme, nextThemeSettings)
    },
    [theme]
  )

  return (
    <ClinicContext.Provider
      value={{
        settings,
        setSettings,
        settingsLoaded,
        refreshSettings,
        locale,
        setLocale,
        theme,
        setTheme,
        previewThemeSettings,
        mounted,
      }}
    >
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  const ctx = useContext(ClinicContext)
  if (!ctx) {
    throw new Error('useClinic must be used within ClinicSettingsProvider')
  }
  return ctx
}
