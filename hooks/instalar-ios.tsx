'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"

export function InstalarIos() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [hasPrompted, setHasPrompted] = useState(false)

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  useEffect(() => {
    if (!isIOS) return
    if (isStandalone) return
    if (hasPrompted) return

    setHasPrompted(true)
    const id = toast.info(
      'No iPhone/iPad, instale o app na Tela Inicial para habilitar tudo',
      {
        duration: 6000,
        action: {
          label: 'Como fazer',
          onClick: () => {
            // Apenas mantém o aviso; instruções mais completas já existem em outras telas.
          },
        },
      }
    )

    const mql = window.matchMedia('(display-mode: standalone)')
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) toast.dismiss(id)
    }
    mql.addEventListener('change', onChange)

    return () => {
      mql.removeEventListener('change', onChange)
    }
  }, [isIOS, isStandalone, hasPrompted])

  return (
    <div className="hidden"></div>
  )
}
