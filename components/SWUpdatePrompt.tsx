'use client'

import { toast } from 'sonner'
import { useEffect } from 'react'

export function SWUpdatePrompt() {
  useEffect(() => {
    const handler = () => {
      toast('Update available', {
        description: 'A new version is ready. Reload to update.',
        action: {
          label: 'Reload',
          onClick: () => window.location.reload(),
        },
        duration: Infinity,
      })
    }
    window.addEventListener('sw-update', handler)
    return () => window.removeEventListener('sw-update', handler)
  }, [])

  return null
}
