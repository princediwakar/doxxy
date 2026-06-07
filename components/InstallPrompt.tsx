'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios-safari' | 'mac-safari' | 'chromium' | 'other'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isMac = /Mac/.test(ua) && !isIOS
  const isChromium = /Chrome|Edg/.test(ua)
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)

  if (isIOS && isSafari) return 'ios-safari'
  if (isMac && isSafari) return 'mac-safari'
  if (isChromium) return 'chromium'
  return 'other'
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block align-middle mx-0.5"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function PlatformInstructions({ platform }: { platform: Platform }) {
  switch (platform) {
    case 'ios-safari':
      return (
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
          Tap <ShareIcon /> then <strong>Add to Home Screen</strong>
        </span>
      )
    case 'mac-safari':
      return (
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
          <strong>File</strong> → <strong>Add to Dock</strong>
        </span>
      )
    default:
      return null
  }
}

const DISMISSAL_KEY = 'install-prompt-dismissed'
const DISMISSAL_DAYS = 7

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [platform, setPlatform] = useState<Platform>('other')
  const [isStandalone, setIsStandalone] = useState(true)

  useEffect(() => {
    const plat = detectPlatform()
    setPlatform(plat)

    if (window.matchMedia('(display-mode: standalone)').matches) return
    setIsStandalone(false)

    const dismissedAt = localStorage.getItem(DISMISSAL_KEY)
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysSince < DISMISSAL_DAYS) return
    }

    if (plat === 'chromium') {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
      }
      window.addEventListener('beforeinstallprompt', handler)

      const installedHandler = () => {
        setDeferredPrompt(null)
        setShowManual(false)
      }
      window.addEventListener('appinstalled', installedHandler)

      setDismissed(false)
      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
        window.removeEventListener('appinstalled', installedHandler)
      }
    }

    if (plat === 'ios-safari' || plat === 'mac-safari') {
      const timer = setTimeout(() => {
        setShowManual(true)
        setDismissed(false)
      }, 3000)
      return () => clearTimeout(timer)
    }

    setDismissed(false)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setDeferredPrompt(null)
    setShowManual(false)
    setDismissed(true)
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString())
  }, [])

  if (dismissed || isStandalone) return null
  if (!deferredPrompt && !showManual) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-bottom-4">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3">
        <img
          src="/icon-192x192.png"
          alt="Doxxy"
          className="w-10 h-10 rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Install Doxxy
          </p>
          <PlatformInstructions platform={platform} />
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 px-4 py-2 bg-[#1f8fff] text-white text-sm font-medium rounded-lg hover:bg-[#1a7ae6] transition-colors"
          >
            Install
          </button>
        )}
      </div>
    </div>
  )
}
