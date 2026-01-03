'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"

export function InstalarIos() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  toast.info('Adicione o app à Tela Inicial para ter acesso a todas as funcionalidades', {
    duration: 2000,
    action: {
      label: 'Adicionar',
      onClick: () => {
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
          if (e.matches) {
            toast.dismiss()
          }
        })
      }
    }
  })

  return (
    <div className="hidden"></div>
  )
}
