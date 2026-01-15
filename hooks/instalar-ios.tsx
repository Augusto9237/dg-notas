'use client'

import { SquarePlus } from "lucide-react";
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface WindowMSStream extends Window {
  MSStream?: unknown;
}

export function InstalarIos() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [hasPrompted, setHasPrompted] = useState(false)

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as WindowMSStream).MSStream
    )

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  useEffect(() => {
    if (!isIOS) return
    if (isStandalone) return
    if (hasPrompted) return

    setHasPrompted(true)
    const id = toast.info(
      'No seu iPhone/iPad, adicione o app na Tela Inicial para habilitar todas as funções',
      {
        icon: <SquarePlus />,
        duration: 5000,
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

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  return (
    <div className="hidden"></div>
  )
}
