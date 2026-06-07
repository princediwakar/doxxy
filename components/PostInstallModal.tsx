// components/PostInstallModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Command, Search, X } from 'lucide-react'

type OS = 'mac' | 'windows' | 'ios' | 'android' | 'unknown'

function detectOS(): OS {
  if (typeof window === 'undefined') return 'unknown'
  const ua = window.navigator.userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  if (/mac/.test(ua)) return 'mac'
  if (/win/.test(ua)) return 'windows'
  return 'unknown'
}

interface PostInstallModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PostInstallModal({ isOpen, onClose }: PostInstallModalProps) {
  const [os, setOs] = useState<OS>('unknown')

  useEffect(() => {
    setOs(detectOS())
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Doxxy is Installed!
          </h3>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            You can now access your clinic faster. Here is how to find it:
          </p>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
            {os === 'mac' && (
              <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 font-medium text-xs shrink-0">1</span>
                  <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs shadow-sm mx-1"><Command className="w-3 h-3 inline" /> space</kbd> to open Spotlight Search.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 font-medium text-xs shrink-0">2</span>
                  <span>Type <strong>"Doxxy"</strong> and hit Return to launch.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 font-medium text-xs shrink-0">3</span>
                  <span>Right-click the Doxxy icon in your Dock, then select <strong>Options → Keep in Dock</strong>.</span>
                </li>
              </ul>
            )}

            {os === 'windows' && (
              <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 font-medium text-xs shrink-0">1</span>
                  <span>Press the <strong>Windows Key</strong> to open your Start Menu.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 font-medium text-xs shrink-0">2</span>
                  <span>Type <strong>"Doxxy"</strong> into the search bar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 font-medium text-xs shrink-0">3</span>
                  <span>Right-click the app and select <strong>Pin to taskbar</strong> for instant access.</span>
                </li>
              </ul>
            )}

            {os === 'ios' && (
              <div className="text-center text-sm text-gray-700 dark:text-gray-300">
                <p>Doxxy has been added directly to your <strong>Home Screen</strong>.</p>
                <p className="mt-2 text-gray-500">Swipe home to find the Doxxy icon and drag it to your dock for easy access.</p>
              </div>
            )}

            {(os === 'android' || os === 'unknown') && (
              <div className="text-center text-sm text-gray-700 dark:text-gray-300">
                <p>Doxxy is now available in your <strong>App Drawer</strong>.</p>
                <p className="mt-2 text-gray-500">Long-press the icon and drag it to your Home Screen for one-tap access to your clinic.</p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 bg-[#1f8fff] text-white font-medium rounded-xl hover:bg-[#1a7ae6] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
